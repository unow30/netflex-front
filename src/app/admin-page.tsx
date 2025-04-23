import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Layout } from '../components/layout/layout';
import { Director, Genre, CreateMovieDto } from '../types';
import { api, extractData, ApiResponse } from '../services/api';

// 프리사인드 URL 응답 타입
interface PresignedUrlResponse {
  filename: string;
  url: string;
}

export const AdminPage = () => {
  // 파일 업로드 상태
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // S3 업로드 상태
  const [s3UploadComplete, setS3UploadComplete] = useState<boolean>(false);
  const [s3FileName, setS3FileName] = useState<string>('');
  
  // 영화 정보 상태
  const [title, setTitle] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [directors, setDirectors] = useState<Director[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedDirectorId, setSelectedDirectorId] = useState<number | ''>('');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  // 파일 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 감독 및 장르 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { directorService } = await import('../services/director.service');
        const { genreService } = await import('../services/genre.service');
        
        const directorsData = await directorService.getDirectors();
        const genresData = await genreService.getGenres();
        
        setDirectors(directorsData);
        setGenres(genresData);
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        setErrorMessage('감독 및 장르 정보를 불러오는데 실패했습니다.');
      }
    };
    
    fetchData();
  }, []);

  // 파일 선택 처리
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setErrorMessage('');
    setUploadProgress(0);
    setS3UploadComplete(false);
    setS3FileName('');
    
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = files[0];
    
    // 파일 유형 확인 (mp4만 허용)
    if (file.type !== 'video/mp4') {
      setErrorMessage('MP4 형식의 파일만 업로드할 수 있습니다.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    // 파일 크기 확인 (최대 200MB)
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes
    if (file.size > maxSize) {
      setErrorMessage('파일 크기는 최대 200MB까지만 허용됩니다.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    setSelectedFile(file);
    
    // 파일 이름에서 확장자 제거하여 제목으로 설정
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setTitle(fileName);
  };

  // 장르 선택 처리
  const handleGenreChange = (genreId: number) => {
    setSelectedGenreIds(prev => {
      // 이미 선택된 경우 제거
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      }
      
      // 최대 3개 제한
      if (prev.length >= 3) {
        return prev;
      }
      
      // 추가
      return [...prev, genreId];
    });
  };
  
  // 프리사인드 URL 가져오기
  const getPresignedUrl = async (): Promise<PresignedUrlResponse> => {
    try {
      const response = await api.post('common/presigned-url').json<ApiResponse<PresignedUrlResponse[]>>();
      const presignedData = extractData(response);
      
      if (presignedData.length > 0) {
        return presignedData[0];
      }
      
      throw new Error('프리사인드 URL을 받아오는데 실패했습니다.');
    } catch (error) {
      console.error('URL 요청 실패:', error);
      throw error;
    }
  };
  
  // S3에 파일 업로드
  const uploadFileToS3 = async (url: string, file: File): Promise<boolean> => {
    try {
      // 직접 fetch 사용하여 PUT 요청으로 파일 업로드
      const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'video/mp4',
        }
      });
      console.log('url', url);
      console.log('response', response);

      if (!response.ok) {
        throw new Error(`파일 업로드 실패: ${response.status} ${response.statusText}`);
      }
      
      // 성공시 true 리턴
      return response.ok;
    } catch (error) {
      console.error('S3 파일 업로드 실패:', error);
      throw error;
    }
  };

  // 프리사인드 URL에서 S3 파일명 추출
  const extractS3FileNameFromUrl = (url: string): string => {
    try {
      // URL을 '/' 기준으로 나눔
      const urlParts = url.split('/');
      
      // .mp4로 끝나는 부분 찾기 (쿼리 파라미터 제외)
      for (const part of urlParts) {
        if (part.includes('.mp4')) {
          // ? 이전 부분만 추출 (쿼리 파라미터 제거)
          return part.split('?')[0];
        }
      }
      throw new Error('URL에서 파일명을 찾을 수 없습니다.');
    } catch (error) {
      console.error('파일명 추출 실패:', error);
      throw error;
    }
  };

  // S3 파일 업로드 처리 (영화 등록과 분리)
  const handleS3Upload = async () => {
    if (!selectedFile) {
      setErrorMessage('영화 파일을 선택해주세요.');
      return;
    }
    
    try {
      setIsUploading(true);
      setErrorMessage('');
      setUploadProgress(10);
      
      // 1. 프리사인드 URL 요청
      const presignedData = await getPresignedUrl();
      setUploadProgress(30);
      
      // 2. S3에 파일 직접 업로드
      const uploadSuccess = await uploadFileToS3(presignedData.url, selectedFile);
      setUploadProgress(90);
      
      if (!uploadSuccess) {
        throw new Error('파일 업로드가 실패했습니다.');
      }
      
      // 3. S3 파일명 추출
      const s3FileName = extractS3FileNameFromUrl(presignedData.url);
      setS3FileName(s3FileName);
      
      // 업로드 성공 상태 설정
      setS3UploadComplete(true);
      setUploadProgress(100);
      
      // 파일 이름에서 확장자 제거하여 제목으로 설정 (이미 설정되어 있으나 확인)
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(fileName);
      
      // 성공 메시지는 3초 후 사라짐
      setTimeout(() => {
        setUploadProgress(0);
      }, 3000);
    } catch (error) {
      console.error('S3 파일 업로드 실패:', error);
      if (error instanceof Error) {
        setErrorMessage(`S3 파일 업로드에 실패했습니다: ${error.message}`);
      } else {
        setErrorMessage('S3 파일 업로드에 실패했습니다.');
      }
      setUploadProgress(0);
      setS3UploadComplete(false);
    } finally {
      setIsUploading(false);
    }
  };

  // 영화 등록 처리 (S3 업로드 이후)
  const handleMovieRegistration = async () => {
    if (!s3UploadComplete) {
      setErrorMessage('먼저 파일을 S3에 업로드해야 합니다.');
      return;
    }
    
    if (!title.trim()) {
      setErrorMessage('영화 제목을 입력해주세요.');
      return;
    }
    
    if (!detail.trim()) {
      setErrorMessage('영화 설명을 입력해주세요.');
      return;
    }
    
    if (!selectedDirectorId) {
      setErrorMessage('감독을 선택해주세요.');
      return;
    }
    
    if (selectedGenreIds.length === 0) {
      setErrorMessage('최소 1개의 장르를 선택해주세요.');
      return;
    }
    
    try {
      setIsUploading(true);
      setErrorMessage('');
      
      // 영화 데이터 생성
      const movieData: CreateMovieDto = {
        title,
        detail,
        directorId: Number(selectedDirectorId),
        genreIds: selectedGenreIds,
        movieFileName: s3FileName // S3에 업로드된 파일 이름 사용
      };
      
      // 영화 데이터 서버에 전송
      const response = await api.post('movie', { json: movieData }).json<ApiResponse<any>>();
      
      setUploadSuccess(true);
      // 폼 초기화
      setSelectedFile(null);
      setTitle('');
      setDetail('');
      setSelectedDirectorId('');
      setSelectedGenreIds([]);
      setS3UploadComplete(false);
      setS3FileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // 성공 메시지는 3초 후 사라짐
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('영화 등록 실패:', error);
      if (error instanceof Error) {
        setErrorMessage(`영화 등록에 실패했습니다: ${error.message}`);
      } else {
        setErrorMessage('영화 등록에 실패했습니다.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-red-700 dark:text-red-500 mb-6">관리자 페이지</h1>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">영화 업로드</h2>
            
            <div className="space-y-6">
              {/* 파일 업로드 */}
              <div>
                <label className="block text-sm font-medium mb-2">영화 파일 (MP4만 가능, 최대 200MB)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  disabled={isUploading || s3UploadComplete}
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    선택된 파일: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>
              
              {/* S3 업로드 버튼 - 파일 선택 시에만 표시 */}
              {selectedFile && !s3UploadComplete && (
                <div className="mt-4">
                  <button
                    onClick={handleS3Upload}
                    disabled={isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50"
                  >
                    {isUploading ? 'S3에 업로드 중...' : 'S3에 파일 업로드'}
                  </button>
                </div>
              )}
              
              {/* 업로드 진행 상태 */}
              {isUploading && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-red-600 h-4 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
                    {uploadProgress}% 완료
                  </p>
                </div>
              )}
              
              {/* S3 업로드 완료 메시지 */}
              {s3UploadComplete && (
                <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
                  파일이 S3에 성공적으로 업로드되었습니다! 이제 영화 정보를 등록해주세요.
                </div>
              )}
              
              {/* 영화 정보 입력 (S3 업로드 완료 시에만 표시) */}
              {s3UploadComplete && (
                <>
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">영화 정보 등록</h3>
                    
                    {/* S3 파일명 표시 (읽기 전용) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">S3 파일명 (변경 불가)</label>
                      <input
                        type="text"
                        value={s3FileName}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 bg-gray-100 dark:bg-gray-600"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">이 파일명은 자동으로 생성되며 변경할 수 없습니다.</p>
                    </div>
                    
                    {/* 영화 제목 */}
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium mb-2">영화 제목</label>
                      <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        required
                        disabled={isUploading}
                      />
                    </div>
                    
                    {/* 영화 설명 */}
                    <div className="mb-4">
                      <label htmlFor="detail" className="block text-sm font-medium mb-2">영화 설명 (필수)</label>
                      <textarea
                        id="detail"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        rows={4}
                        required
                        disabled={isUploading}
                      />
                    </div>
                    
                    {/* 감독 선택 */}
                    <div className="mb-4">
                      <label htmlFor="director" className="block text-sm font-medium mb-2">감독 (필수)</label>
                      <select
                        id="director"
                        value={selectedDirectorId}
                        onChange={(e) => setSelectedDirectorId(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        required
                        disabled={isUploading}
                      >
                        <option value="">감독 선택</option>
                        {directors.map(director => (
                          <option key={director.id} value={director.id}>{director.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* 장르 선택 (1-3개) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">장르 (1-3개 선택)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {genres.map(genre => (
                          <div key={genre.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`genre-${genre.id}`}
                              checked={selectedGenreIds.includes(genre.id)}
                              onChange={() => handleGenreChange(genre.id)}
                              disabled={(isUploading || (!selectedGenreIds.includes(genre.id) && selectedGenreIds.length >= 3))}
                              className="mr-2"
                            />
                            <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {selectedGenreIds.length}/3 장르 선택됨
                      </div>
                    </div>
                    
                    {/* 영화 등록 버튼 */}
                    <div className="mt-6">
                      <button
                        onClick={handleMovieRegistration}
                        disabled={isUploading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50"
                      >
                        {isUploading ? '영화 등록 중...' : '영화 정보 등록'}
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="mt-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
                  {errorMessage}
                </div>
              )}
              
              {/* 성공 메시지 */}
              {uploadSuccess && (
                <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
                  영화가 성공적으로 등록되었습니다!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default { AdminPage };

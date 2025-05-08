import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { MovieDto } from '../types';
import { extractErrorMessage } from '../utils/errorMessage';
import { getFirstThumbnailFromHls } from '../utils/thumbnailUtils';

export const MoviesPage = () => {
  const [movies, setMovies] = useState<MovieDto[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // 동적으로 서비스 로드
        const { movieService } = await import('../services/movie.service');
        const result = await movieService.getMovies();
        // 응답 형식에 따라 데이터 설정
        if (result.data) {
          setMovies(result.data);
          setFilteredMovies(result.data);
        } else {
          setMovies(result as any);
          setFilteredMovies(result as any);
        }
      } catch (err) {
        setError(await extractErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      setFilteredMovies(movies);
    } else {
      // 프론트엔드에서 검색 처리
      const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded mb-6">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">영화 목록</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="영화 검색..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-white dark:bg-gray-700 rounded-full px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-center">
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map(movie => (
            <Link 
              key={movie.id} 
              to={`/movies/${movie.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                {movie.movieFileName ? (
                  <img 
                    src={getFirstThumbnailFromHls(movie.movieFileName)}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // prevent infinite loop
                      target.style.backgroundColor = "#000"; // set black background
                      target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // transparent 1px gif
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    이미지 없음
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{movie.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{movie.movieDetail?.detail}</p>
                {movie.director && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                    감독: {movie.director.name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}; 
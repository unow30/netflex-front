import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { MovieDto } from '../types';
import { HLSVideoPlayer } from '../components/video/HLSVideoPlayer';
import { extractErrorMessage } from '../utils/errorMessage';
import ky from 'ky';

const getFallbackMovieUrl = (id?: string) => {
  if (!id) return '';
  return `/media/${id}.m3u8`;
};

interface ThumbnailInfo {
  url: string;
  time: number;
}

export const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 썸네일 상태
  const [thumbnails, setThumbnails] = useState<ThumbnailInfo[]>([]);
  const [thumbnailMeta, setThumbnailMeta] = useState<{resolution: string, layout: string, duration: number} | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      try {
        const { movieService } = await import('../services/movie.service');
        const result = await movieService.getMovie(parseInt(id, 10));
        setMovie(result);
        setLoading(false);
      } catch (error) {
        setError(await extractErrorMessage(error));
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // 썸네일 메타 및 리스트 fetch
  useEffect(() => {
    const fetchThumbnails = async () => {
      setThumbnails([]);
      setThumbnailMeta(null);
      setThumbnailLoading(true);
      setThumbnailError(null);
      try {
        const movieFileName = movie?.movieFileName;
        if (!movieFileName) return;
        // 1. origin.m3u8 fetch
        const res = await ky(movieFileName);
        if (!res.ok) throw new Error('origin.m3u8을 불러올 수 없습니다.');
        const manifest = await res.text();
        // 2. #EXT-X-IMAGE-STREAM-INF에서 썸네일 m3u8 경로 추출
        const imageInfMatch = manifest.match(/#EXT-X-IMAGE-STREAM-INF:.*URI="([^"]+)"/);
        if (!imageInfMatch) throw new Error('썸네일 메니페스토 경로를 찾을 수 없습니다.');
        const thumbnailManifestUrl = new URL(imageInfMatch[1], movieFileName).toString();
        // 3. 썸네일 메니페스토 fetch
        const thumbRes = await ky(thumbnailManifestUrl);
        if (!thumbRes.ok) throw new Error('썸네일 메니페스토를 불러올 수 없습니다.');
        const thumbManifest = await thumbRes.text();
        // 4. #EXT-X-TILES 정보 파싱
        const tilesMatch = thumbManifest.match(/#EXT-X-TILES:RESOLUTION=([^,]+),LAYOUT=([^,]+),DURATION=(\d+)/);
        if (!tilesMatch) throw new Error('썸네일 메타 정보를 찾을 수 없습니다.');
        const [_, resolution, layout, durationStr] = tilesMatch;
        const duration = parseInt(durationStr, 10);
        setThumbnailMeta({ resolution, layout, duration });
        // 5. 썸네일 파일명 추출 (최대 20개)
        const thumbMatches = Array.from(thumbManifest.matchAll(/(Thumbnail_\d+\.jpg)/g));
        const baseUrl = movieFileName.replace(/origin\.m3u8$/, '');
        const thumbs: ThumbnailInfo[] = thumbMatches.slice(0, 20).map((m, i) => ({
          url: baseUrl + m[1],
          time: i * duration
        }));
        setThumbnails(thumbs);
      } catch (err) {
        setThumbnailError(await extractErrorMessage(err));
      } finally {
        setThumbnailLoading(false);
      }
    };
    if (movie?.movieFileName) fetchThumbnails();
  }, [movie?.movieFileName]);

  const handleLike = async () => {
    if (!movie) return;
    try {
      const response = await ky.post(`/api/movie/${movie.id}/like`);
      if (response.ok) {
        const updatedMovie = await response.json<any>();
        setMovie(updatedMovie.data);
      }
    } catch (error) {
      setError(await extractErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">로딩중...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        {error && (
          <div className="text-xl text-red-600 mb-4">{error}</div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <HLSVideoPlayer
            videoUrl={movie?.movieFileName || getFallbackMovieUrl(id)}
            autoPlay={true}
            poster={movie?.movieFileName}
            muted={false}
          />
          {movie && (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{movie.title}</h1>
                <button
                  onClick={handleLike}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  좋아요 ({movie.likeCount})
                </button>
              </div>
              <div className="mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">감독:</span>
                <span className="ml-2 font-medium">{movie.director.name}</span>
              </div>
              <div className="mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-400">장르:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {movie.genres.map((genre) => (
                    <span key={genre.id} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
              {/* 썸네일 표시 영역 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">영상 썸네일 (최대 27개, 테스트용)</h3>
                {thumbnailLoading && <div>썸네일 로딩 중...</div>}
                {thumbnailError && <div className="text-red-500">{thumbnailError}</div>}
                {thumbnails.length > 0 && thumbnailMeta && (() => {
                  // 해상도, 레이아웃 파싱
                  const [tileW, tileH] = thumbnailMeta.resolution.split('x').map(Number);
                  const [cols, rows] = thumbnailMeta.layout.split('x').map(Number);
                  // 최대 3개 이미지(조각)만 사용
                  const maxImages = 3;
                  const usedThumbs = thumbnails.slice(0, maxImages);
                  const tileDivs = [];
                  let globalIdx = 0;
                  for (let imgIdx = 0; imgIdx < usedThumbs.length; imgIdx++) {
                    for (let row = 0; row < rows; row++) {
                      for (let col = 0; col < cols; col++) {
                        if (globalIdx >= 27) break;
                        tileDivs.push(
                          <div key={`thumb-${imgIdx}-${row}-${col}`} className="flex flex-col items-center">
                            <img
                              src={usedThumbs[imgIdx].url}
                              alt={`썸네일${globalIdx+1}`}
                              style={{
                                width: tileW + 'px',
                                height: tileH + 'px',
                                objectFit: 'none',
                                objectPosition: `-${col * tileW}px -${row * tileH}px`,
                                background: '#222',
                                borderRadius: '8px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                              }}
                            />
                            <span className="text-xs mt-1 text-gray-500">{Math.floor((globalIdx * thumbnailMeta.duration)/60)}:{((globalIdx * thumbnailMeta.duration)%60).toString().padStart(2,'0')}</span>
                          </div>
                        );
                        globalIdx++;
                      }
                    }
                  }
                  return <div className="flex flex-wrap gap-2">{tileDivs}</div>;
                })()}
                {/* 썸네일 메타정보를 m3u8에서 동적으로 추출한 값으로 표시 */}
                {thumbnailMeta && (
                  <div className="text-xs text-gray-400 mt-2">
                    해상도: {thumbnailMeta.resolution}, 레이아웃: {thumbnailMeta.layout}, 썸네일당 {thumbnailMeta.duration}초
                  </div>
                )}
              </div>
              {/* // 썸네일 표시 끝 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h2 className="text-xl font-semibold mb-2">줄거리</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {movie.detail}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
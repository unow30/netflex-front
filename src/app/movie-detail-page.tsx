import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { MovieDto } from '../types';
import { HLSVideoPlayer } from '../components/video/HLSVideoPlayer';

const getFallbackMovieUrl = (id?: string) => {
  if (!id) return '';
  return `/media/${id}.m3u8`;
};

export const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return; // id가 없으면 호출하지 않음
      try {
        const { movieService } = await import('../services/movie.service');
        const result = await movieService.getMovie(parseInt(id, 10));
        setMovie(result);
      } catch (err) {
        setError('영화 정보를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleLike = async () => {
    if (!movie) return;

    try {
      const response = await fetch(`/api/movie/${movie.id}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const updatedMovie = await response.json();
        setMovie(updatedMovie.data);
      }
    } catch (error) {
      console.error('좋아요 처리중 오류가 발생했습니다:', error);
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

  if (error || !movie) {
    return (
      <Layout>
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded mb-6">
          {error || '영화를 찾을 수 없습니다.'}
        </div>
        <Link to="/movies" className="text-red-600 hover:underline">
          영화 목록으로 돌아가기
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/movies" className="text-red-600 hover:underline">
            ← 영화 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <HLSVideoPlayer
            videoUrl={movie?.movieFileName || getFallbackMovieUrl(id)}
            autoPlay={false}
            poster={movie?.movieFileName}
          />
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

            <p className="text-gray-600 dark:text-gray-300 mb-6">{movie.detail}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">감독</h2>
                <Link to={`/directors/${movie.director.id}`} className="text-red-600 hover:underline">
                  {movie.director.name}
                </Link>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{movie.director.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">장르</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <Link
                      key={genre.id}
                      to={`/genres/${genre.id}`}
                      className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
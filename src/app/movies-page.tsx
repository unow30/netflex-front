import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { movieService } from '../services';
import { MovieListResponseDto } from '../types';

export const MoviesPage = () => {
  const [movies, setMovies] = useState<MovieListResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const result = await movieService.getMovies();
        setMovies(result);
      } catch (err) {
        setError('영화 목록을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">영화 목록</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded mb-6">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-center">
            <p>등록된 영화가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map(movie => (
              <Link key={movie.id} to={`/movies/${movie.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-64 bg-gray-200 dark:bg-gray-700">
                    {movie.movieFileName ? (
                      <img
                        src={`http://localhost:3000/api/common/video/thumbnail/${movie.movieFileName}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2 dark:text-white">{movie.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">{movie.detail}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {movie.genres.map(genre => (
                        <span key={genre.id} className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-xs px-2 py-1 rounded">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>감독: {movie.director.name}</p>
                      <p>좋아요: {movie.likeCount}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}; 
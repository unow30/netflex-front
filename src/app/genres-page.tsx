import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { genreService } from '../services';
import { Genre } from '../types';

export const GenresPage = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const result = await genreService.getGenres();
        setGenres(result);
      } catch (err) {
        setError('장르 목록을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">장르 목록</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded mb-6">
            {error}
          </div>
        ) : genres.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-center">
            <p>등록된 장르가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {genres.map(genre => (
              <Link key={genre.id} to={`/genres/${genre.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
                  <h2 className="text-xl font-semibold mb-3 dark:text-white">{genre.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">{genre.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}; 
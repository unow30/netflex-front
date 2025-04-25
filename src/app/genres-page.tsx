import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { Genre } from '../types';
import { extractErrorMessage } from '../utils/errorMessage';

export const GenresPage = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        // 동적으로 서비스 로드
        const { genreService } = await import('../services/genre.service');
        const result = await genreService.getGenres();
        setGenres(result);
      } catch (err) {
        setError(await extractErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

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
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">장르 목록</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {genres.map(genre => (
          <Link 
            key={genre.id}
            to={`/genres/${genre.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold">{genre.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mt-2">{genre.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}; 
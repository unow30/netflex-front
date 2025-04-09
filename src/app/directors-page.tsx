import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { directorService } from '../services';
import { Director } from '../types';

export const DirectorsPage = () => {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const result = await directorService.getDirectors();
        setDirectors(result);
      } catch (err) {
        setError('감독 목록을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectors();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">감독 목록</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded mb-6">
            {error}
          </div>
        ) : directors.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-center">
            <p>등록된 감독이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {directors.map(director => (
              <Link key={director.id} to={`/directors/${director.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
                  <h2 className="text-xl font-semibold mb-3 dark:text-white">{director.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">{director.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}; 
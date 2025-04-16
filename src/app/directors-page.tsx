import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { Director } from '../types';

export const DirectorsPage = () => {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        // 동적으로 서비스 로드
        const { directorService } = await import('../services/director.service');
        const result = await directorService.getDirectors();
        setDirectors(result);
      } catch (err) {
        setError('감독 정보를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectors();
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
      <h1 className="text-3xl font-bold mb-6">감독 목록</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {directors.map(director => (
          <Link 
            key={director.id}
            to={`/directors/${director.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold">{director.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mt-2">{director.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}; 
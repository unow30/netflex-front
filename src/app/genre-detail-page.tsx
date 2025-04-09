import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { genreService } from '../services';
import { Genre } from '../types';

export const GenreDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [genre, setGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenre = async () => {
      if (!id) return;
      
      try {
        const result = await genreService.getGenre(parseInt(id));
        setGenre(result);
      } catch (err) {
        setError('장르 정보를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenre();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (error || !genre) {
    return (
      <Layout>
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded mb-6">
          {error || '장르를 찾을 수 없습니다.'}
        </div>
        <Link to="/genres" className="text-red-600 hover:underline">
          장르 목록으로 돌아가기
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/genres" className="text-red-600 hover:underline">
            ← 장르 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{genre.name}</h1>
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-gray-600 dark:text-gray-300">{genre.description}</p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                추가 날짜: {new Date(genre.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                업데이트 날짜: {new Date(genre.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}; 
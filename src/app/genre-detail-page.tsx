import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { Genre } from '../types';

interface MovieInfo {
  id: number;
  title: string;
}

interface GenreWithMovies extends Genre {
  movies?: MovieInfo[];
}

export const GenreDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [genre, setGenre] = useState<GenreWithMovies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenre = async () => {
      if (!id) return;
      
      try {
        // 동적으로 서비스 로드
        const { genreService } = await import('../services/genre.service');
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
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{genre.name}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{genre.description}</p>
            
            <h2 className="text-xl font-semibold mb-3">영화</h2>
            {genre.movies && genre.movies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {genre.movies.map((movie: MovieInfo) => (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.id}`}
                    className="block bg-gray-100 dark:bg-gray-700 rounded p-3 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <h3 className="font-medium">{movie.title}</h3>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">이 장르의 영화가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}; 
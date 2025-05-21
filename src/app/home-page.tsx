import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { useAuth } from '../hooks/useAuth';

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <div className="w-full bg-gradient-to-r from-red-800 to-red-600 text-white p-12 mb-10 rounded-lg shadow-lg">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">NETFLEX2에 오신것을 환영합니다</h1>
          <p className="text-xl mb-6">{user?.email}님, 최고의 영화들을 즐겨보세요</p>
          <Link to="/movies" className="bg-white text-red-700 hover:bg-gray-100 py-3 px-6 rounded font-bold inline-block">
            영화 보러가기
          </Link>
        </div>

        <section className="w-full">
          <h2 className="text-3xl font-bold mb-6">카테고리</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Link to="/movies">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold mb-2">영화</h3>
                <p className="text-gray-600 dark:text-gray-300">다양한 영화를 탐색해보세요.</p>
              </div>
            </Link>
            <Link to="/directors">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold mb-2">감독</h3>
                <p className="text-gray-600 dark:text-gray-300">유명 감독들의 작품을 확인하세요.</p>
              </div>
            </Link>
            <Link to="/genres">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold mb-2">장르</h3>
                <p className="text-gray-600 dark:text-gray-300">좋아하는 장르의 영화를 찾아보세요.</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}; 
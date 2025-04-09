import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';

export const NotFoundPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-16">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">페이지를 찾을 수 없습니다</h2>
        <p className="mb-8 text-gray-600 dark:text-gray-300 text-center max-w-md">
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 이름이 변경되었을 수 있습니다.
        </p>
        <Link
          to="/"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </Layout>
  );
}; 
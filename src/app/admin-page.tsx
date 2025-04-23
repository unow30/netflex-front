import React from 'react';
import { Layout } from '../components/layout/layout';

export const AdminPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center text-red-700 dark:text-red-500 mb-6">관리자입니다</h1>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              관리자 전용 페이지입니다. 이 페이지는 관리자 권한을 가진.사용자만 접근할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default { AdminPage };

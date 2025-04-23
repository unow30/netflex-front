import React, { useState } from 'react';
import { Layout } from '../components/layout/layout';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/user';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  // 사용자 역할에 따른 텍스트 표시 함수
  const getRoleText = (role: Role) => {
    switch (role) {
      case Role.admin:
        return '관리자';
      case Role.paidUser:
        return '유료 회원';
      case Role.user:
        return '일반 회원';
      default:
        return '알 수 없음';
    }
  };

  const handleLogout = () => {
    if (confirmLogout) {
      logout();
    } else {
      setConfirmLogout(true);
      setTimeout(() => {
        setConfirmLogout(false);
      }, 3000);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">내 프로필</h1>
          
          {user && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">이메일</h2>
                <p className="mt-1 text-lg">{user.email}</p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">역할</h2>
                <p className="mt-1 text-lg">{getRoleText(user.role)}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className={`w-full py-2 px-4 rounded transition-colors ${
                    confirmLogout 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  {confirmLogout ? '정말 로그아웃 하시겠습니까?' : '로그아웃'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
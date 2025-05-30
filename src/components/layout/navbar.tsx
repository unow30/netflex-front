import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types/user';

export const Navbar = React.memo(() => {
  const { user, logout, isAuthenticated } = useAuth();
  
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark ? 'dark' : 'light');
  };
  // 관리자 권한 확인 (role이 admin인 경우) - useMemo로 최적화
  const isAdmin = useMemo(() => user && user.role === Role.admin, [user]);

  return (
    // <nav className="bg-red-700 dark:bg-black px-6 py-3 flex justify-center shadow-md fixed w-full z-10">
    <nav className="bg-red-700 dark:bg-black px-6 py-3 flex justify-center shadow-md max-w-screen-xl mx-auto z-10">
      <div className="max-w-screen-xl mx-auto flex items-center justify-start space-x-6">
        <div className="flex items-center">
          <Link to="/" className="text-white text-2xl font-bold">NETFLEX2</Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link to="/movies" className="text-white hover:text-red-300">영화</Link>
          <Link to="/directors" className="text-white hover:text-red-300">감독</Link>
          <Link to="/genres" className="text-white hover:text-red-300">장르</Link>
          
          {/* 관리자 권한이 있는 경우에만 관리자 버튼 표시 */}
          {isAdmin && (
            <Link to="/admin" className="text-white hover:text-red-300 bg-red-800 dark:bg-gray-800 p-2 rounded hover:bg-red-900">
              관리자
            </Link>
          )}
          
          <button 
            onClick={toggleDarkMode}
            className="text-white bg-red-800 dark:bg-gray-800 p-2 rounded hover:bg-red-900"
          >
            다크모드
          </button>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">{user?.email}</span>
              <button 
                onClick={logout}
                className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded"
              >
                로그인
              </Link>
              <Link 
                to="/register" 
                className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});
import React, { useEffect, Suspense } from 'react';
// Navbar를 지연 로딩으로 변경
const Navbar = React.lazy(() => import('./navbar').then(module => ({ default: module.Navbar })));

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    // 다크 모드 설정 유지
    const savedTheme = localStorage.getItem('darkMode') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-200">
      <Suspense fallback={<div className="h-16 bg-red-700 dark:bg-black"></div>}>
        <Navbar />
      </Suspense>
      <div className="pt-16 pb-8">
        <main className="max-w-screen-xl mx-auto p-4 min-h-[calc(100vh-8rem)]">
          {children}
        </main>
      </div>
      <footer className="bg-red-700 dark:bg-black text-white p-4 text-center">
        <div className="max-w-screen-xl mx-auto">
          <p> {new Date().getFullYear()} Netflex2. All rights reserved.</p>
          <p className="mt-2">이 사이트는 포트폴리오 사이트입니다.</p>
        </div>
      </footer>
    </div>
  );
}; 
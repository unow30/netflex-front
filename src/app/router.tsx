import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Lazy-loaded Pages
const HomePage = React.lazy(() => import('./home-page').then(module => ({ default: module.HomePage })));
const LoginPage = React.lazy(() => import('./login-page').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('./register-page').then(module => ({ default: module.RegisterPage })));
const MoviesPage = React.lazy(() => import('./movies-page').then(module => ({ default: module.MoviesPage })));
const MovieDetailPage = React.lazy(() => import('./movie-detail-page').then(module => ({ default: module.MovieDetailPage })));
const DirectorsPage = React.lazy(() => import('./directors-page').then(module => ({ default: module.DirectorsPage })));
const DirectorDetailPage = React.lazy(() => import('./director-detail-page').then(module => ({ default: module.DirectorDetailPage })));
const GenresPage = React.lazy(() => import('./genres-page').then(module => ({ default: module.GenresPage })));
const GenreDetailPage = React.lazy(() => import('./genre-detail-page').then(module => ({ default: module.GenreDetailPage })));
const ProfilePage = React.lazy(() => import('./profile-page').then(module => ({ default: module.ProfilePage })));
const NotFoundPage = React.lazy(() => import('./not-found-page').then(module => ({ default: module.NotFoundPage })));

// Loading Component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">로딩 중...</div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/movies" element={<ProtectedRoute><MoviesPage /></ProtectedRoute>} />
        <Route path="/movies/:id" element={<ProtectedRoute><MovieDetailPage /></ProtectedRoute>} />
        <Route path="/directors" element={<ProtectedRoute><DirectorsPage /></ProtectedRoute>} />
        <Route path="/directors/:id" element={<ProtectedRoute><DirectorDetailPage /></ProtectedRoute>} />
        <Route path="/genres" element={<ProtectedRoute><GenresPage /></ProtectedRoute>} />
        <Route path="/genres/:id" element={<ProtectedRoute><GenreDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}; 
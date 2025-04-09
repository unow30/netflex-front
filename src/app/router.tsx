import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Pages
import { HomePage } from './home-page';
import { LoginPage } from './login-page';
import { RegisterPage } from './register-page';
import { MoviesPage } from './movies-page';
import { MovieDetailPage } from './movie-detail-page';
import { DirectorsPage } from './directors-page';
import { DirectorDetailPage } from './director-detail-page';
import { GenresPage } from './genres-page';
import { GenreDetailPage } from './genre-detail-page';
import { ProfilePage } from './profile-page';
import { NotFoundPage } from './not-found-page';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export const AppRouter = () => {
  return (
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
  );
}; 
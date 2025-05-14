import { CreateMovieDto, GetMoviesDto, Movie, MovieDto, MovieListRecentDto, MovieListResponseDto, UpdateMovieDto } from '../types';
import { api, ExtendedRequestInit } from './api';

export const movieService = {
  async getMovies(params?: GetMoviesDto): Promise<MovieListResponseDto> {
    const searchParams: Record<string, string> = {};
    
    // GetMoviesDto를 searchParams로 변환
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams[key] = String(value);
        }
      });
    }
    
    return await api.get<MovieListResponseDto>('movie', {
      searchParams
    });
  },

  async getRecentMovies(): Promise<MovieListRecentDto[]> {
    return await api.get<MovieListRecentDto[]>('movie/recent');
  },

  async getMovie(id: number): Promise<MovieDto> {
    return await api.get<MovieDto>(`movie/${id}`);
  },

  async createMovie(movieData: CreateMovieDto): Promise<MovieDto> {
    return await api.post<MovieDto>('movie', movieData);
  },

  async updateMovie(id: number, movieData: UpdateMovieDto): Promise<MovieDto> {
    return await api.patch<MovieDto>(`movie/${id}`, movieData);
  },

  async deleteMovie(id: number): Promise<{ id: number }> {
    return await api.delete<{ id: number }>(`movie/${id}`);
  },

  async likeMovie(id: number): Promise<MovieDto> {
    return await api.post<MovieDto>(`movie/${id}/like`);
  }
};
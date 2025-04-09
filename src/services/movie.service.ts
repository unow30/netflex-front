import { CreateMovieDto, GetMoviesDto, Movie, MovieListRecentDto, MovieListResponseDto, UpdateMovieDto } from '../types';
import { ApiResponse, api, extractData } from './api';

export const movieService = {
  async getMovies(params?: GetMoviesDto): Promise<MovieListResponseDto[]> {
    const response = await api.get('movie', {
      searchParams: params as Record<string, string | number | boolean>
    }).json<ApiResponse<MovieListResponseDto[]>>();
    
    return extractData(response);
  },

  async getRecentMovies(): Promise<MovieListRecentDto[]> {
    const response = await api.get('movie/recent').json<ApiResponse<MovieListRecentDto[]>>();
    return extractData(response);
  },

  async getMovie(id: number): Promise<Movie> {
    const response = await api.get(`movie/${id}`).json<ApiResponse<Movie>>();
    return extractData(response);
  },

  async createMovie(movieData: CreateMovieDto): Promise<Movie> {
    const response = await api.post('movie', {
      json: movieData
    }).json<ApiResponse<Movie>>();
    
    return extractData(response);
  },

  async updateMovie(id: number, movieData: UpdateMovieDto): Promise<Movie> {
    const response = await api.patch(`movie/${id}`, {
      json: movieData
    }).json<ApiResponse<Movie>>();
    
    return extractData(response);
  },

  async deleteMovie(id: number): Promise<{ id: number }> {
    const response = await api.delete(`movie/${id}`).json<ApiResponse<{ id: number }>>();
    return extractData(response);
  },

  async likeMovie(id: number): Promise<Movie> {
    const response = await api.post(`movie/${id}/like`).json<ApiResponse<Movie>>();
    return extractData(response);
  }
}; 
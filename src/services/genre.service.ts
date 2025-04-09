import { CreateGenreDto, Genre, UpdateGenreDto } from '../types';
import { ApiResponse, api, extractData } from './api';

export const genreService = {
  async getGenres(): Promise<Genre[]> {
    const response = await api.get('genre').json<ApiResponse<Genre[]>>();
    return extractData(response);
  },

  async getGenre(id: number): Promise<Genre> {
    const response = await api.get(`genre/${id}`).json<ApiResponse<Genre>>();
    return extractData(response);
  },

  async createGenre(genreData: CreateGenreDto): Promise<Genre> {
    const response = await api.post('genre', {
      json: genreData
    }).json<ApiResponse<Genre>>();
    
    return extractData(response);
  },

  async updateGenre(id: number, genreData: UpdateGenreDto): Promise<Genre> {
    const response = await api.patch(`genre/${id}`, {
      json: genreData
    }).json<ApiResponse<Genre>>();
    
    return extractData(response);
  },

  async deleteGenre(id: number): Promise<{ id: number }> {
    const response = await api.delete(`genre/${id}`).json<ApiResponse<{ id: number }>>();
    return extractData(response);
  }
}; 
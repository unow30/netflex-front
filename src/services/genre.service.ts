import { CreateGenreDto, Genre, UpdateGenreDto } from '../types';
import { api } from './api';

export const genreService = {
  async getGenres(): Promise<Genre[]> {
    return await api.get<Genre[]>('genre');
  },

  async getGenre(id: number): Promise<Genre> {
    return await api.get<Genre>(`genre/${id}`);
  },

  async createGenre(genreData: CreateGenreDto): Promise<Genre> {
    return await api.post<Genre>('genre', genreData);
  },

  async updateGenre(id: number, genreData: UpdateGenreDto): Promise<Genre> {
    return await api.patch<Genre>(`genre/${id}`, genreData);
  },

  async deleteGenre(id: number): Promise<{ id: number }> {
    return await api.delete<{ id: number }>(`genre/${id}`);
  }
};
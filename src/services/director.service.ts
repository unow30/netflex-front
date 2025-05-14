import { CreateDirectorDto, Director, UpdateDirectorDto } from '../types';
import { api } from './api';

export const directorService = {
  async getDirectors(): Promise<Director[]> {
    return await api.get<Director[]>('director');
  },

  async getDirector(id: number): Promise<Director> {
    return await api.get<Director>(`director/${id}`);
  },

  async createDirector(directorData: CreateDirectorDto): Promise<Director> {
    return await api.post<Director>('director', directorData);
  },

  async updateDirector(id: number, directorData: UpdateDirectorDto): Promise<Director> {
    return await api.patch<Director>(`director/${id}`, directorData);
  },

  async deleteDirector(id: number): Promise<{ id: number }> {
    return await api.delete<{ id: number }>(`director/${id}`);
  }
};
import { CreateDirectorDto, Director, UpdateDirectorDto } from '../types';
import { ApiResponse, api, extractData } from './api';

export const directorService = {
  async getDirectors(): Promise<Director[]> {
    const response = await api.get('director').json<ApiResponse<Director[]>>();
    return extractData(response);
  },

  async getDirector(id: number): Promise<Director> {
    const response = await api.get(`director/${id}`).json<ApiResponse<Director>>();
    return extractData(response);
  },

  async createDirector(directorData: CreateDirectorDto): Promise<Director> {
    const response = await api.post('director', {
      json: directorData
    }).json<ApiResponse<Director>>();
    
    return extractData(response);
  },

  async updateDirector(id: number, directorData: UpdateDirectorDto): Promise<Director> {
    const response = await api.patch(`director/${id}`, {
      json: directorData
    }).json<ApiResponse<Director>>();
    
    return extractData(response);
  },

  async deleteDirector(id: number): Promise<{ id: number }> {
    const response = await api.delete(`director/${id}`).json<ApiResponse<{ id: number }>>();
    return extractData(response);
  }
}; 
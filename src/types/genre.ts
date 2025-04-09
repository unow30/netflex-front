export interface Genre {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGenreDto {
  name: string;
  description: string;
}

export interface UpdateGenreDto {
  name?: string;
  description?: string;
} 
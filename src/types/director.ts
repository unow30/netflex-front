export interface Director {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDirectorDto {
  name: string;
  description: string;
}

export interface UpdateDirectorDto {
  name?: string;
  description?: string;
} 
import { Director } from './director';
import { Genre } from './genre';
import { User } from './user';

export interface Movie {
  id: number;
  title: string;
  detail: string;
  director: Director;
  genres: Genre[];
  likes: User[];
  movieFileName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMovieDto {
  title: string;
  detail: string;
  directorId: number;
  genreIds: number[];
  movieFileName: string;
}

export interface UpdateMovieDto {
  title?: string;
  detail?: string;
  directorId?: number;
  genreIds?: number[];
}

export interface GetMoviesDto {
  page?: number;
  limit?: number;
}

export interface MovieListResponseDto {
  id: number;
  title: string;
  detail: string;
  director: Director;
  genres: Genre[];
  likeCount: number;
  movieFileName: string;
}

export interface MovieListRecentDto {
  id: number;
  title: string;
  detail: string;
  movieFileName: string;
} 
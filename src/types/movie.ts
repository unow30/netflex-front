import { Director } from './director';
import { Genre } from './genre';
import { User } from './user';

// 기본 영화 상세 정보 인터페이스
export interface MovieDetailDto {
  detail: string;
  createdAt: Date;
  updatedAt: Date;
}

// 기본 영화 정보 인터페이스
export interface MovieDto {
  id: number;
  title: string;
  movieFileName: string;
  likeCount: number;
  dislikeCount: number;
  likeStatus: boolean | null;
  director: Director;
  detail: string;
  genres: Genre[];
  likes: User[];

  movieDetail?: MovieDetailDto;
}

// 영화 목록 아이템 (상세 정보 제외)
export interface MovieListItemDto extends Omit<MovieDto, 'movieDetail'> {}

// 최근 영화 목록용 간소화된 인터페이스
export interface MovieListRecentDto {
  id: number;
  title: string;
  likeCount: number;
  dislikeCount: number;
  movieFileName: string;
}

// 페이지네이션된 영화 목록 응답
export interface MovieListResponseDto {
  data: MovieListItemDto[];
  nextCursor: string | null;
  count: number;
}

// 영화 생성 DTO
export interface CreateMovieDto {
  title: string;
  detail: string;
  directorId: number;
  genreIds: number[];
  movieFileName: string;
}

// 영화 업데이트 DTO
export interface UpdateMovieDto {
  title?: string;
  detail?: string;
  directorId?: number;
  genreIds?: number[];
}

// 영화 목록 조회 파라미터
export interface GetMoviesDto {
  page?: number;
  limit?: number;
  cursor?: string;
}

// 원본 영화 전체 정보 (기존 Movie 인터페이스)
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
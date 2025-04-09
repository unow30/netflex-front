넷플릭스 클론 API 엔드포인트 목록
====================================

1. 인증 관련 (/auth)
-------------------
POST /auth/register
- 기능: 새로운 사용자 등록
- 인증: Basic Auth
- 응답: UserDto

POST /auth/login
- 기능: 사용자 로그인
- 인증: Basic Auth
- 응답: UserToken (accessToken, refreshToken)

POST /auth/login/passport
- 기능: Passport를 이용한 로그인
- 인증: Passport Local Strategy
- 응답: UserToken

POST /auth/token/access
- 기능: 액세스 토큰 갱신
- 인증: Public
- 응답: { accessToken: string }

GET /auth/me
- 기능: 현재 로그인한 사용자 정보 조회
- 인증: JWT Auth Guard
- 응답: { id: number, email: string, role: Role }

2. 영화 관련 (/movie)
-------------------
GET /movie
- 기능: 영화 목록 조회
- 인증: JWT Auth Guard
- 응답: MovieListResponseDto[]

GET /movie/recent
- 기능: 최근 영화 목록 조회
- 인증: Public
- 응답: MovieListRecentDto[]

GET /movie/:id
- 기능: 특정 영화 상세 조회
- 인증: JWT Auth Guard
- 응답: MovieDto

POST /movie
- 기능: 새로운 영화 생성
- 인증: JWT Auth Guard, Role.ADMIN
- 요청: CreateMovieDto
- 응답: MovieDto

PATCH /movie/:id
- 기능: 영화 정보 수정
- 인증: JWT Auth Guard, Role.ADMIN
- 요청: UpdateMovieDto
- 응답: MovieDto

DELETE /movie/:id
- 기능: 영화 삭제
- 인증: JWT Auth Guard, Role.ADMIN
- 응답: { id: number }

POST /movie/:id/like
- 기능: 영화 좋아요
- 인증: JWT Auth Guard
- 응답: MovieDto

3. 감독 관련 (/director)
----------------------
GET /director
- 기능: 감독 목록 조회
- 인증: JWT Auth Guard
- 응답: DirectorDto[]

GET /director/:id
- 기능: 특정 감독 상세 조회
- 인증: JWT Auth Guard
- 응답: DirectorDto

POST /director
- 기능: 새로운 감독 생성
- 인증: JWT Auth Guard
- 요청: CreateDirectorDto
- 응답: DirectorDto

PATCH /director/:id
- 기능: 감독 정보 수정
- 인증: JWT Auth Guard
- 요청: UpdateDirectorDto
- 응답: DirectorDto

DELETE /director/:id
- 기능: 감독 삭제
- 인증: JWT Auth Guard
- 응답: { id: number }

4. 장르 관련 (/genre)
-------------------
GET /genre
- 기능: 장르 목록 조회
- 인증: JWT Auth Guard
- 응답: GenreDto[]

GET /genre/:id
- 기능: 특정 장르 상세 조회
- 인증: JWT Auth Guard
- 응답: GenreDto

POST /genre
- 기능: 새로운 장르 생성
- 인증: JWT Auth Guard
- 요청: CreateGenreDto
- 응답: GenreDto

PATCH /genre/:id
- 기능: 장르 정보 수정
- 인증: JWT Auth Guard
- 요청: UpdateGenreDto
- 응답: GenreDto

DELETE /genre/:id
- 기능: 장르 삭제
- 인증: JWT Auth Guard
- 응답: { id: number }

5. 사용자 관련 (/user)
--------------------
GET /user
- 기능: 사용자 목록 조회
- 인증: JWT Auth Guard
- 응답: UserDto[]

GET /user/:id
- 기능: 특정 사용자 상세 조회
- 인증: JWT Auth Guard
- 응답: UserDto

PATCH /user/:id
- 기능: 사용자 정보 수정
- 인증: JWT Auth Guard
- 요청: UpdateUserDto
- 응답: UserDto

DELETE /user/:id
- 기능: 사용자 삭제
- 인증: JWT Auth Guard
- 응답: { id: number }

6. 공통 기능 (/common)
--------------------
POST /common/presigned-url
- 기능: S3 프리사인드 URL 생성
- 인증: JWT Auth Guard
- 응답: { url: string, fields: object }

POST /common/video
- 기능: 비디오 생성
- 인증: JWT Auth Guard
- 응답: { message: string }

POST /common/video/s3
- 기능: S3에 비디오 업로드
- 인증: JWT Auth Guard
- 응답: { message: string }

GET /common/video/multer/:page/:pageSize
- 기능: 정적 비디오 경로 조회
- 인증: JWT Auth Guard
- 응답: { videos: string[], total: number }

PUT /common/video/multer/publish
- 기능: 비디오 파일 이름 변경
- 인증: JWT Auth Guard
- 요청: UpdateLocalFilePathDto
- 응답: { message: string }

참고사항:
1. 모든 엔드포인트는 Swagger 문서화가 되어 있습니다.
2. 대부분의 엔드포인트는 JWT 인증이 필요합니다.
3. 일부 엔드포인트는 Public 데코레이터를 통해 인증 없이 접근 가능합니다.
4. 영화 컨트롤러는 캐싱과 트랜잭션 인터셉터가 적용되어 있습니다.
5. 모든 컨트롤러는 ClassSerializerInterceptor를 사용하여 응답 데이터를 변환합니다. 
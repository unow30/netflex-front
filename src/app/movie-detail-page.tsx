import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { MovieDto } from '../types';
import Hls from 'hls.js';

export const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      
      try {
        // 동적으로 서비스 로드
        const { movieService } = await import('../services/movie.service');
        const result = await movieService.getMovie(parseInt(id));
        setMovie(result);
      } catch (err) {
        setError('영화 정보를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleLike = async () => {
    if (!movie) return;

    try {
      const response = await fetch(`/api/movie/${movie.id}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const updatedMovie = await response.json();
        setMovie(updatedMovie.data);
      }
    } catch (error) {
      console.error('좋아요 처리중 오류가 발생했습니다:', error);
    }
  };

  // HLS.js video player initialization
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (movie && videoRef.current) {
      const videoElement = videoRef.current;
      
      // Convert movieFileName to m3u8 format if it's not already
      // For example, if the original file is something like "video.mp4", change to "video.m3u8"
      // or use the full m3u8 URL as provided
      const movieUrl = movie.movieFileName.endsWith('.m3u8') ? movie.movieFileName : movie.movieFileName.replace(/\.[^.]+$/, '.m3u8');
      
      console.log('Player script loaded');
      
      // Check if HLS is supported and if Hls object exists
      if (Hls.isSupported()) {
        console.log('HLS.js is supported');
        
        let hls: Hls;
        
        try {
          // Create HLS instance
          hls = new Hls({
            debug: true,
            enableWorker: false,
            lowLatencyMode: false,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            progressive: true,
            testBandwidth: true,
          });

          // 추가 이벤트 리스너
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log('HLS: Media attached to video element');
          });

          hls.on(Hls.Events.MANIFEST_LOADING, () => {
            console.log('HLS: Manifest loading');
          });

          hls.on(Hls.Events.MANIFEST_LOADED, () => {
            console.log('HLS: Manifest loaded');
          });

          hls.on(Hls.Events.LEVEL_LOADING, (_event, data) => {
            console.log('HLS: Level loading', data);
          });

          hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
            console.log('HLS: Level loaded', data);
          });

          hls.on(Hls.Events.FRAG_LOADING, (_event, data) => {
            console.log('HLS: Fragment loading', data.frag.url);
          });

          hls.on(Hls.Events.FRAG_LOADED, (_event, data) => {
            console.log('HLS: Fragment loaded', data.frag.url);
          });

          // Bind HLS player to video element
          hls.loadSource(movieUrl);
          hls.attachMedia(videoElement);

          // Handle HLS events
          hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
            console.log('HLS manifest parsed, found ' + data.levels.length + ' quality levels');

            // 수동으로 처음 레벨 선택 (가장 낮은 품질)
            if (data.levels.length > 0) {
              hls.currentLevel = 0; // 가장 낮은 품질 레벨
            }

            videoElement.play().catch(error => {
              console.error('Auto-play was prevented:', error);
              // 사용자 인터랙션이 필요한 경우
              console.log('Click on video to play');
              videoElement.onclick = function() {
                videoElement.play();
              };
            });
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            console.error('HLS player error:', data);
            if (data.fatal) {
              switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, attempting recovery...');
                  // 네트워크 오류 후 2초 후 재시도
                  setTimeout(() => {
                    hls.startLoad();
                  }, 2000);
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, attempting recovery...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error, playback cannot continue:', data);
                  console.log('Attempting one last recovery by destroying and recreating...');

                  // HLS 인스턴스 재생성 시도
                  hls.destroy();

                  // 1초 후 재시도
                  setTimeout(() => {
                    const newHls = new Hls({debug: true});
                    newHls.loadSource(movieUrl);
                    newHls.attachMedia(videoElement);
                  }, 1000);

                  break;
              }
            } else {
              hls.destroy();
            }
          });
        
          // Clean up HLS instance when component unmounts
          return () => {
            if (hls) {
              hls.destroy();
            }
          };
        } catch (err) {
          console.error('Error initializing HLS:', err);
        }
      }
      // For browsers with native HLS support like Safari
      else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('Using native HLS support');
        videoElement.src = movieUrl;
        videoElement.addEventListener('loadedmetadata', function() {
          console.log('Video metadata loaded');
          videoElement.play().catch(error => {
            console.error('Auto-play was prevented:', error);
            // 사용자 인터랙션 필요
            videoElement.onclick = function() {
              videoElement.play();
            };
          });
        });

        // 에러 핸들링 추가
        videoElement.addEventListener('error', function() {
          console.error('Video playback error:', videoElement.error);
        });
      } else {
        console.error('HLS is not supported in this browser');
      }
    }
  }, [movie]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout>
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded mb-6">
          {error || '영화를 찾을 수 없습니다.'}
        </div>
        <Link to="/movies" className="text-red-600 hover:underline">
          영화 목록으로 돌아가기
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/movies" className="text-red-600 hover:underline">
            ← 영화 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-video w-full bg-black relative">
            <video
              ref={videoRef}
              controls
              className="w-full h-full"
              poster={movie?.movieFileName}
            >
              브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              <button
                onClick={handleLike}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                좋아요 ({movie.likeCount})
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">{movie.detail}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">감독</h2>
                <Link to={`/directors/${movie.director.id}`} className="text-red-600 hover:underline">
                  {movie.director.name}
                </Link>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{movie.director.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">장르</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <Link
                      key={genre.id}
                      to={`/genres/${genre.id}`}
                      className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
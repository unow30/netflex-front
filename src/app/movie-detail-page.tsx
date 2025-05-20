import React, {useEffect, useState, lazy, Suspense, useRef} from 'react';
import {useParams, Link} from 'react-router-dom';
import {Layout} from '../components/layout/layout';
import {MovieDto} from '../types';
import {extractErrorMessage} from '../utils/errorMessage';
import { getMediaConvertJobId } from '../utils/thumbnailUtils';

const getFallbackMovieUrl = (id?: string) => {
    if (!id) return '';
    return `/media/${id}.m3u8`;
};

interface ThumbnailInfo {
    url: string;
    time: number;
}

const HLSVideoPlayer = lazy(() => import('../components/video/HLSVideoPlayer').then(module => ({
    default: module.HLSVideoPlayer
})));

// 세션 스토리지 키 상수
const SESSION_HAS_INTERACTED_KEY = 'user_has_interacted';
const SESSION_MOVIE_ID_KEY = 'current_movie_id';
const SESSION_PLAYBACK_TIME = 'movie_playback_time';
const SESSION_USER_PREFERRED_MUTED_STATE = 'user_preferred_muted_state';

export const MovieDetailPage = () => {
    const {id} = useParams<{ id: string }>();
    const [movie, setMovie] = useState<MovieDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobIdLoading, setJobIdLoading] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [initialMuted, setInitialMuted] = useState(false);
    const [initialPlaybackTime, setInitialPlaybackTime] = useState(0);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const hasRegisteredEvents = useRef(false);

    // 사용자 상호작용 여부 확인
    useEffect(() => {
        // 세션 스토리지에서 이전 상호작용 정보 복원
        const hasInteractedBefore = sessionStorage.getItem(SESSION_HAS_INTERACTED_KEY) === 'true';
        const storedMovieId = sessionStorage.getItem(SESSION_MOVIE_ID_KEY);
        const playbackTime = sessionStorage.getItem(SESSION_PLAYBACK_TIME);
        const userPreferredMutedState = sessionStorage.getItem(SESSION_USER_PREFERRED_MUTED_STATE);
        
        // 같은 영화일 경우 이전 상태 복원
        if (hasInteractedBefore && storedMovieId === id) {
            setHasInteracted(hasInteractedBefore);
            setInitialPlaybackTime(playbackTime ? parseFloat(playbackTime) : 0);
        } else {
            // id가 undefined일 수 있으므로 빈 문자열로 대체
            sessionStorage.setItem(SESSION_MOVIE_ID_KEY, id || '');
            sessionStorage.setItem(SESSION_HAS_INTERACTED_KEY, 'false');
            sessionStorage.setItem(SESSION_PLAYBACK_TIME, '0');
            setHasInteracted(false);
            setInitialPlaybackTime(0);
        }
        
        // 글로벌 음소거 설정 적용 (영화별 설정 없음)
        if (!userPreferredMutedState) {
            // 초기 설정이 없으면 unmuted로 설정
            sessionStorage.setItem(SESSION_USER_PREFERRED_MUTED_STATE, 'unmuted');
            setInitialMuted(false);
        } else {
            setInitialMuted(userPreferredMutedState === 'muted');
        }
        
        if (!hasRegisteredEvents.current) {
            // 전역 상호 작용 이벤트 등록 (사용자가 상호작용했음을 표시)
            const registerInteraction = () => {
                sessionStorage.setItem(SESSION_HAS_INTERACTED_KEY, 'true');
                setHasInteracted(true);
            };
            
            // 가시성 변경 이벤트 처리 (탭 전환, 복원 등에 대응)
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    const hasInteractedBefore = sessionStorage.getItem(SESSION_HAS_INTERACTED_KEY) === 'true';
                    setHasInteracted(hasInteractedBefore);
                }
            };
            
            // 다양한 사용자 상호작용 이벤트 리스너 등록
            window.addEventListener('click', registerInteraction);
            window.addEventListener('keydown', registerInteraction);
            window.addEventListener('touchstart', registerInteraction);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // 페이지 종료 시 재생 상태 저장 (beforeunload 시점)
            window.addEventListener('beforeunload', () => {
                const videoElement = document.querySelector('video');
                if (videoElement) {
                    sessionStorage.setItem(SESSION_PLAYBACK_TIME, videoElement.currentTime.toString());
                }
            });
            
            hasRegisteredEvents.current = true;
            
            return () => {
                window.removeEventListener('click', registerInteraction);
                window.removeEventListener('keydown', registerInteraction);
                window.removeEventListener('touchstart', registerInteraction);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [id]);

    useEffect(() => {
        const fetchMovie = async () => {
            if (!id) return;
            try {
                const {movieService} = await import('../services/movie.service');
                const result = await movieService.getMovie(parseInt(id, 10));
                setMovie(result);
                setLoading(false);
                
                // 영화 데이터를 불러온 후, m3u8 파일의 헤더를 확인하여 jobId 가져오기
                if (result.movieFileName) {
                    setJobIdLoading(true);
                    const mediaJobId = await getMediaConvertJobId(result.movieFileName);
                    setJobId(mediaJobId);
                    setJobIdLoading(false);
                }
            } catch (error) {
                setError(await extractErrorMessage(error));
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    // 비디오 재생 시간이 변경될 때 세션 스토리지 업데이트
    const handleTimeUpdate = (currentTime: number) => {
        sessionStorage.setItem(SESSION_PLAYBACK_TIME, currentTime.toString());
        setInitialPlaybackTime(currentTime);
    };
    
    // 음소거 상태 변경 처리 - 오직 전역 설정만 저장
    const handleMutedChange = (isMuted: boolean) => {
        sessionStorage.setItem(SESSION_USER_PREFERRED_MUTED_STATE, isMuted ? 'muted' : 'unmuted');
        setInitialMuted(isMuted);
    };

    const handleLike = async () => {
        if (!movie) return;
        try {
            const { movieService } = await import('../services/movie.service');
            const updatedMovie = await movieService.likeMovie(movie.id);
            setMovie(updatedMovie);
        } catch (error) {
            console.error('영화 좋아요 실패:', error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-xl">로딩중...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto p-4">
                {error && (
                    <div className="text-xl text-red-600 mb-4">{error}</div>
                )}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" ref={videoContainerRef}>
                    <Suspense fallback={<div className="aspect-video bg-gray-800 flex items-center justify-center text-white">로딩중...</div>}>
                        <HLSVideoPlayer
                            videoUrl={movie?.movieFileName || getFallbackMovieUrl(id)}
                            autoPlay={true}
                            poster={movie?.movieFileName}
                            muted={initialMuted}
                            initialTime={initialPlaybackTime}
                            onTimeUpdate={handleTimeUpdate}
                            onMutedChange={handleMutedChange}
                            hasInteracted={hasInteracted}
                        />
                    </Suspense>
                    {movie && (
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
                            
                            {/* MediaConvert Job ID 표시 */}
                            {jobIdLoading ? (
                                <div className="mb-3 text-sm text-gray-500">영상 변환 중...</div>
                            ) : jobId ? (
                                <div className="mb-3 text-sm text-gray-500">
                                    <span className="font-medium">MediaConvert Job ID:</span> {jobId}
                                </div>
                            ) : (
                                <div className="mb-3 text-sm text-gray-500">MediaConvert Job ID를 찾을 수 없습니다.</div>
                            )}
                            
                            <div className="mb-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">감독:</span>
                                <span className="ml-2 font-medium">{movie.director.name}</span>
                            </div>
                            <div className="mb-6">
                                <span className="text-sm text-gray-600 dark:text-gray-400">장르:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {movie.genres.map((genre) => (
                                        <span key={genre.id}
                                              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">
                      {genre.name}
                    </span>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h2 className="text-xl font-semibold mb-2">줄거리</h2>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {movie.movieDetail?.detail}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
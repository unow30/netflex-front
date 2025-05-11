import React, {useEffect, useState, lazy, Suspense} from 'react';
import {useParams, Link} from 'react-router-dom';
import {Layout} from '../components/layout/layout';
import {MovieDto} from '../types';
import {extractErrorMessage} from '../utils/errorMessage';
import ky from 'ky';

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

export const MovieDetailPage = () => {
    const {id} = useParams<{ id: string }>();
    const [movie, setMovie] = useState<MovieDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovie = async () => {
            if (!id) return;
            try {
                const {movieService} = await import('../services/movie.service');
                const result = await movieService.getMovie(parseInt(id, 10));
                setMovie(result);
                setLoading(false);
            } catch (error) {
                setError(await extractErrorMessage(error));
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    const handleLike = async () => {
        if (!movie) return;
        try {
            const response = await ky.post(`/api/movie/${movie.id}/like`);
            if (response.ok) {
                const updatedMovie = await response.json<any>();
                setMovie(updatedMovie.data);
            }
        } catch (error) {
            setError(await extractErrorMessage(error));
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <Suspense fallback={<div className="aspect-video bg-gray-800 flex items-center justify-center text-white">로딩중...</div>}>
                        <HLSVideoPlayer
                            videoUrl={movie?.movieFileName || getFallbackMovieUrl(id)}
                            autoPlay={true}
                            poster={movie?.movieFileName}
                            muted={false}
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
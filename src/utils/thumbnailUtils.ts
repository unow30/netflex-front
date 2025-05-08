/**
 * Utility functions for handling video thumbnails
 */

/**
 * Extracts the thumbnail URL from a video HLS manifest URL
 * @param hlsUrl - The HLS manifest URL (e.g., https://d16ufd393m7gss.cloudfront.net/public/movie/uuid/origin.m3u8)
 * @returns - The URL to the first thumbnail image (e.g., https://d16ufd393m7gss.cloudfront.net/public/movie/uuid/Thumbnail_000000001.jpg)
 */
export const getFirstThumbnailFromHls = (hlsUrl: string): string => {
  if (!hlsUrl) return '';
  
  // Extract the base URL by removing 'origin.m3u8' from the end
  const baseUrl = hlsUrl.replace(/origin\.m3u8$/, '');
  
  // Return the URL to the first thumbnail
  return `${baseUrl}Thumbnail_000000001.jpg`;
};

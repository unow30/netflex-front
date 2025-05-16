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

/**
 * Fetches the metadata headers from an HLS manifest file
 * @param hlsUrl - The HLS manifest URL to check headers for
 * @returns - Promise that resolves with the headers object or null if failed
 */
export const getHlsManifestMetadata = async (hlsUrl: string): Promise<Record<string, string> | null> => {
  if (!hlsUrl) return null;
  
  try {
    // Make a HEAD request to get only the headers
    const response = await fetch(hlsUrl, { method: 'HEAD' });

    if (!response.ok) {
      console.error('Failed to fetch manifest headers:', response.status);
      return null;
    }

    // Convert headers to a simple object
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  } catch (error) {
    console.error('Error fetching manifest headers:', error);
    return null;
  }
};

/**
 * Specifically gets the MediaConvert job ID from an HLS manifest
 * @param hlsUrl - The HLS manifest URL
 * @returns - Promise that resolves with the job ID or null if not found
 */
export const getMediaConvertJobId = async (hlsUrl: string): Promise<string | null> => {
  const headers = await getHlsManifestMetadata(hlsUrl);
  
  if (!headers) return null;
  
  // The header key might be lowercase due to fetch API normalization
  return headers['x-amz-meta-mediaconvert-jobid'] || null;
};

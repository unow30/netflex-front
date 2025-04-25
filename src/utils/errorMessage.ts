import { ErrorResponse } from '../types/ErrorResponse';

export async function extractErrorMessage(error: any): Promise<string> {
  if (error?.response) {
    try {
      const body = await error.response.json();
      if (
        typeof body?.statusCode === 'number' &&
        typeof body?.error === 'string' &&
        typeof body?.message === 'string'
      ) {
        return `${body.statusCode} ${body.error}: ${body.message}`;
      } else if (body?.message) {
        return body.message;
      }
    } catch {}
  }
  return error?.message || '알 수 없는 오류가 발생했습니다.';
}

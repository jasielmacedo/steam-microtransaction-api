import logger from './logger';

const DEFAULT_TIMEOUT_MS = 30000;

export declare interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new FetchError(`Request timed out after ${timeoutMs}ms`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const get = async <T>(url: string): Promise<T> => {
  try {
    logger.debug(`[STEAM-API CALL][REQUEST][GET]: ${url}`);

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      const errorData = await parseJsonSafely(response);
      throw new FetchError(
        `Request failed with status ${response.status}`,
        response.status,
        errorData,
      );
    }

    const data = await parseJsonSafely<T>(response);
    if (data === null) {
      throw new FetchError('Invalid JSON response', response.status);
    }

    logger.debug(`[STEAM-API CALL][RESPONSE_SUCCESS][GET]: ${url}`, {
      status: response.status,
      data,
    });

    return data;
  } catch (err) {
    if (err instanceof FetchError) {
      logger.error(`[STEAM-API CALL][RESPONSE_ERROR][GET]: ${url}`, {
        message: err.message,
        response: err.response,
        status: err.status,
      });
    } else {
      logger.error(`[STEAM-API CALL][UNKNOWN_ERROR][GET]: ${url}`, {
        error: err,
      });
    }
    throw err;
  }
};

const post = async <T>(
  url: string,
  data: any,
  headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' },
): Promise<T> => {
  try {
    logger.debug(`[STEAM-API CALL][REQUEST][POST]: ${url}`, { payload: data });

    const body = data instanceof URLSearchParams ? data.toString() : data;

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await parseJsonSafely(response);
      throw new FetchError(
        `Request failed with status ${response.status}`,
        response.status,
        errorData,
      );
    }

    const responseData = await parseJsonSafely<T>(response);
    if (responseData === null) {
      throw new FetchError('Invalid JSON response', response.status);
    }

    logger.debug(`[STEAM-API CALL][RESPONSE_SUCCESS][POST]: ${url}`, {
      status: response.status,
      data: responseData,
    });

    return responseData;
  } catch (err) {
    if (err instanceof FetchError) {
      logger.error(`[STEAM-API CALL][RESPONSE_ERROR][POST]: ${url}`, {
        message: err.message,
        response: err.response,
        status: err.status,
      });
    } else {
      logger.error(`[STEAM-API CALL][UNKNOWN_ERROR][POST]: ${url}`, {
        error: err,
      });
    }
    throw err;
  }
};

export default {
  get,
  post,
} as HttpClient;

import axios from 'axios';

import logger from './logger';

export declare interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
}

const get = async <T>(url: string): Promise<T> => {
  try {
    logger.debug(`[STEAM-API CALL][REQUEST][GET]: ${url}`);

    const response = await axios.get<T>(url);

    logger.debug(`[STEAM-API CALL][RESPONSE_SUCCESS][GET]: ${url}`, {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      logger.error(`[STEAM-API CALL][RESPONSE_ERROR][GET]: ${url}`, {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.config.headers,
        method: err.config.method,
        url: err.config.url,
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
  headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
): Promise<T> => {
  try {
    logger.debug(`[STEAM-API CALL][REQUEST][POST]: ${url}`, { payload: data });

    const response = await axios.post<T>(url, data, { headers });

    logger.debug(`[STEAM-API CALL][RESPONSE_SUCCESS][POST]: ${url}`, {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      logger.error(`[STEAM-API CALL][RESPONSE_ERROR][POST]: ${url}`, {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.config.headers,
        method: err.config.method,
        url: err.config.url,
        data: err.config.data,
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

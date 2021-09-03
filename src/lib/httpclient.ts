import axios from 'axios';
import logger from './logger';

export declare interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
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
    logger.error(`[STEAM-API CALL][RESPONSE_ERROR][GET]: ${url}`, { payload: err });
    throw err;
  }
};

const post = async <T>(url: string, data: any): Promise<T> => {
  try {
    logger.debug(`[STEAM-API CALL][REQUEST][POST]: ${url}`, { payload: data });

    const response = await axios.post<T>(url, data, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    });

    logger.debug(`[STEAM-API CALL][RESPONSE_SUCCESS][POST]: ${url}`, {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (err) {
    logger.error(`[STEAM-API CALL][RESPONSE_ERROR][POST]: ${url}`, { payload: err });
    throw err;
  }
};

export default {
  get,
  post,
} as HttpClient;

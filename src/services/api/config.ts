import axios from 'axios';
import { getAccessToken, logout } from '../auth';
import history from '@source/services/history';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const timeout = Number(process.env.REACT_APP_API_TIMEOUT) || 150000;

// Do something before request is sent
// tslint:disable-next-line:no-any
const beforeRequest = (config: any) => {
  // If there is no Bearer token, add it if exists
  if (!config.headers.authorization && getAccessToken()) {
    config.headers.authorization = `Bearer ${getAccessToken()}`;
  }

  return config;
};

// Do something with request error
// tslint:disable-next-line:no-any
const onRequestError = (error: any) => Promise.reject(error);

// Do something with response data
// tslint:disable-next-line:no-any
const beforeResponse = (response: any) => response.data;

// Do something with response error
// tslint:disable-next-line:no-any
const onResponseError = (error: any) => {
  let statusCode = null;
  if (error.response && error.response.data && error.response.data.statusCode) {
    statusCode = error.response.data.statusCode;
  }

  // Not authenticated, so logout...
  if (statusCode && statusCode === 403) {
    const callback = () => {
      const path = history.location.pathname;
      if (path === '/selector' || path === '/callback') {
        return;
      }

      history.push('/selector');
    };
    logout(callback);
  }

  return Promise.reject(error);
};

// Setup headers and add Bearer if exists
let headers: LooseObject = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

if (getAccessToken()) {
  headers.authorization = `Bearer ${getAccessToken()}`;
}

const Server = axios.create({
  baseURL: API_URL,
  headers,
  timeout
});

Server.interceptors.request.use(beforeRequest, onRequestError);

Server.interceptors.response.use(beforeResponse, onResponseError);

export default Server;

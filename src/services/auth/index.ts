import decode from 'jwt-decode';
import auth0 from 'auth0-js';
import { request } from 'graphql-request';

const ID_TOKEN_KEY = 'id_token';
const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';
const IS_APPLICATION_LOGGING_OUT = 'loginout';

const CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID || 'C3APVkj7pSphv9x7qLZ7ib1eeyPO5lOh';
const CLIENT_DOMAIN = process.env.REACT_APP_AUTH0_CLIENT_DOMAIN || 'nevim42.eu.auth0.com';
const REDIRECT = process.env.REACT_APP_AUTH0_REDIRECT || 'http://localhost:3000/callback';
// const SCOPE = 'YOUR_SCOPE';
const AUDIENCE = process.env.REACT_APP_AUTH0_AUDIENCE || 'http://localhost:8000/';

var auth = new auth0.WebAuth({
  clientID: CLIENT_ID,
  domain: CLIENT_DOMAIN
});

export function login() {
  auth.authorize({
    responseType: 'token id_token',
    redirectUri: REDIRECT,
    audience: AUDIENCE,
    scope: 'openid profile email user_metadata app_metadata picture'
  });
}

// tslint:disable-next-line:no-any
export function logout(callback?: () => any) {
  localStorage.setItem(IS_APPLICATION_LOGGING_OUT, 'true');
  clearIdToken();
  clearAccessToken();

  // Usualy dispatch router action
  window.location.href = 
    `https://${process.env.REACT_APP_AUTH0_CLIENT_DOMAIN}/v2/logout?`
    + `returnTo=${encodeURIComponent(process.env.REACT_APP_AUTH0_REDIRECT_LOGOUT)}`
    + `&client_id=${process.env.REACT_APP_AUTH0_CLIENT_ID}`;
  if (callback) {
    callback();
  }
}

// tslint:disable-next-line:no-any
export function requireAuth(nextState: any, replace: any) {
  if (!isLoggedIn()) {
    replace({pathname: '/'});
  }
}

export function getIdToken() {
  return localStorage.getItem(ID_TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearIdToken() {
  return localStorage.removeItem(ID_TOKEN_KEY);
}

export function clearAccessToken() {
  return localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Helper function that will allow us to extract the access_token and id_token
// tslint:disable-next-line:no-any
function getParameterByName(name: any) {
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Get and store access_token in local storage
export function setAccessToken() {
  let accessToken = getParameterByName('access_token');
  if (!accessToken) {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

// Get and store id_token in local storage
export function setIdToken() {
  let idToken = getParameterByName('id_token');
  if (!idToken) {
    return;
  }
  localStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function getError() {
  const error = getParameterByName('error');
  return error;
}

export function isLoggedIn() {
  /**
   * In case that client logging out through logout endpoint say true, 
   * to prevent application to asynchronously redirect us and let do the redirect the logout method
   */

  if (localStorage.getItem(IS_APPLICATION_LOGGING_OUT)) {
    localStorage.removeItem(IS_APPLICATION_LOGGING_OUT);
    return true;
  }
  const idToken = getIdToken();
  return !!idToken && !isTokenExpired(idToken);
}

// tslint:disable-next-line:no-any
function getTokenExpirationDate(encodedToken: any) {
  // tslint:disable-next-line:no-any
  const token = decode(encodedToken) as any;
  if (!token.exp) { return null; }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);

  return date;
}

// tslint:disable-next-line:no-any
function isTokenExpired(token: any) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
}

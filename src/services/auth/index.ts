import decode from 'jwt-decode';
import auth0 from 'auth0-js';
import { request } from 'graphql-request';

const ID_TOKEN_KEY = 'id_token';
const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

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
  clearIdToken();
  clearAccessToken();

  // Usualy dispatch router action
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

function clearIdToken() {
  localStorage.removeItem(ID_TOKEN_KEY);
}

function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
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

  request(
    process.env.REACT_APP_AUTHORIZATION_API_ADDRESS,
    `
    mutation authenticate($idToken: String!) {
      authenticate(idToken: $idToken) {
          id
          name
          email
          avatar
      }
    }
    `,
    {
      idToken
    },
  ).then((user) => {
    localStorage.setItem(ID_TOKEN_KEY, idToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }).catch(console.error);
}

export function getError() {
  const error = getParameterByName('error');
  return error;
}

export function isLoggedIn() {
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

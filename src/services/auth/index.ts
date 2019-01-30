import decode from 'jwt-decode';
import auth0 from 'auth0-js';

const ID_TOKEN_KEY = 'id_token';
const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';
const IS_APPLICATION_LOGGING_OUT = 'loginout';

let renewTimer = null;

const CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID || 'C3APVkj7pSphv9x7qLZ7ib1eeyPO5lOh';
const CLIENT_DOMAIN = process.env.REACT_APP_AUTH0_CLIENT_DOMAIN || 'nevim42.eu.auth0.com';
const REDIRECT = process.env.REACT_APP_AUTH0_REDIRECT || 'http://localhost:3000/callback';
// const SCOPE = 'YOUR_SCOPE';
const AUDIENCE = process.env.REACT_APP_AUTH0_AUDIENCE || 'http://localhost:8000/';
const SCOPE = 'openid profile email user_metadata app_metadata picture';
const RESPONSE_TYPE = 'token id_token';

var auth = new auth0.WebAuth({
  clientID: CLIENT_ID,
  domain: CLIENT_DOMAIN
});

export function login() {
  auth.authorize({
    responseType: RESPONSE_TYPE,
    redirectUri: REDIRECT,
    audience: AUDIENCE,
    scope: SCOPE
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

export async function setSession(
  authResult?: LooseObject,
  silent: boolean = false
) {
  const idToken = (authResult && authResult.idToken) || getParameterByName(ID_TOKEN_KEY);
  const expiresAt: Date = getTokenExpirationDate(idToken);
  localStorage.setItem(ID_TOKEN_KEY, idToken);
  localStorage.setItem(ACCESS_TOKEN_KEY, (authResult && authResult.accessToken) || getParameterByName(ACCESS_TOKEN_KEY));

  // tslint:disable-next-line:no-any
  const expiresIn: any = (authResult && authResult.expiresIn) || (expiresAt.getTime() - new Date().getTime());

  localStorage.setItem(
      'expires_at',
      // tslint:disable-next-line:no-any
      '' + expiresAt.getTime()
  );

  // zapne casovac
  if (expiresIn > 10) {
      startRenewTimer(expiresIn);
  }

  restartRenewTimer();
  if (silent) {
      return;
  }
}

/**
 * Renew token - use silent authentication
 */
// tslint:disable-next-line:no-any
async function renew() {
    const job = new Promise(resolve => {
      auth.checkSession(
            {
                // tslint:disable-next-line:no-any
                audience: AUDIENCE,
                responseType: RESPONSE_TYPE,
                scope: SCOPE,
                redirectUri: REDIRECT
            },
            (err, authResult) => {
                // Renewed tokens or error
                if (err) {
                    logout();
                } else {
                    setSession(authResult, false);
                }
            }
        );
    });

    await job;
}

// tslint:disable-next-line:no-any
function startRenewTimer(expiresIn: any) {
  if (renewTimer !== null) {
      clearInterval(renewTimer);
  }
  if (!isNaN(expiresIn) && parseInt(expiresIn, 0) > 0) {
      renewTimer = setTimeout(() => {
          renew();
      }, parseInt(expiresIn, 0));
  }
}

function restartRenewTimer() {
  startRenewTimer( (parseInt(localStorage.getItem('expires_at') as string, 10) - new Date().getTime()) );
}

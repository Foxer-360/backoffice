import { getAccessToken, getAuth0Id, logout } from '@source/services/auth';
import { IUserProfileProperties } from '@source/contexts/UserProfile';

/**
 * Simple helper that returns query for profile for given client id and access token
 *
 * @param {string} clientId
 * @param {string} accessToken
 * @return {string}
 */
const getProfileQuery = (clientId: string, accessToken: string): string => `
  query {
    profile(
      client: { id: "${clientId}" }
      user: { accessToken: "${accessToken}" }
    ) {
      auth0Id
      avatar
      email
      id
      name
      owner
    }
  }
`;

/**
 * Fetch profile from Foxer360 Authorization server
 *
 * @return {Promise<IUserProfileProperties | null>}
 */
const fetchUserProfile = async (): Promise<IUserProfileProperties | null> => {
  const clientId = process.env.REACT_APP_FOXER360_AUTH_CLIENT_ID;
  if (!clientId || clientId.length < 2) {
    throw new Error('Environment variable REACT_APP_FOXER360_AUTH_CLIENT_ID was not specified!');
  }

  const authServer = process.env.REACT_APP_FOXER360_AUTH_SERVER;
  if (!authServer || authServer.length < 2) {
    throw new Error('Environment variable REACT_APP_FOXER360_AUTH_SERVER was not specified!');
  }
  const accessToken = getAccessToken();
  if (!accessToken || accessToken.length < 2) {
    logout();
    return Promise.resolve(null);
  }

  const jsonBody = {
    query: getProfileQuery(clientId, accessToken)
  };

  return fetch(authServer, {
    body: JSON.stringify(jsonBody),
    headers: {
      'content-type': 'application/json'
    },
    method: 'post',
  })
  .then(res => res.json())
  .then(json => {
    if (!json) {
      // tslint:disable-next-line:no-console
      console.log('Error while loading profile from Foxer360 Authorization Server!');
      return Promise.resolve(null);
    }
    if (json.errors) {
      // tslint:disable-next-line:no-console
      console.log('Some errors occured while loading profile from Foxer360 Authorization Server!', json.errors);
      return Promise.resolve(null);
    }

    if (!json.data || !json.data.profile) {
      console.log(`Failed to load profile from Foxer360 Authorization Server! Probably doesn't exists`);
      return Promise.resolve(null);
    }

    return Promise.resolve(json.data.profile);
  });
};

/***/
const updateUserProfileInState = (state: { profile: IUserProfileProperties }, callback: (profile: IUserProfileProperties | null) => void): boolean => {
  const auth0Id = getAuth0Id();
  if (state.profile && state.profile.auth0Id && state.profile.auth0Id === auth0Id) {
    // Allready have profile
    return false;
  }

  // Fetch profile
  fetchUserProfile()
  .then(profile => {
    if (!profile) {
      callback(null);
    }

    callback(profile);
  });

  return true;
};

export {
  fetchUserProfile,
  updateUserProfileInState
};

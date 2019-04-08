import { createContext } from 'react';

export interface IUserProfileProperties {
  auth0Id: string;
  avatar: string;
  email: string;
  id: string;
  name: string;
  owner: boolean;
}

export const defaultValues = {
  auth0Id: '',
  avatar: '',
  email: '',
  id: '',
  name: '',
  owner: false,
} as IUserProfileProperties;

const UserProfile = createContext(defaultValues);

export default UserProfile;

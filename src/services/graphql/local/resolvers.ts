import { ApolloCache } from 'apollo-cache';
import gql from 'graphql-tag';

interface IdVar {
  id: string;
}

interface ProjectWebiste {
  project: string;
  website: string;
}

interface Cache {
  // tslint:disable-next-line:no-any
  cache: ApolloCache<any>;
}

export const resolvers = {
  Mutation: {
    setProject: (_: never, { id }: IdVar, { cache }: Cache): void => {
      cache.writeData({ data: { project: id }});
    },
    resetProject: (_: never, __: never, { cache }: Cache): void => {
      cache.writeData({ data: { project: null } });
    },
    setWebsite: (_: never, { id }: IdVar, { cache }: Cache): void => {
      cache.writeData({ data: { website: id } });
    },
    resetWebsite: (_: never, __: never, { cache }: Cache): void => {
      cache.writeData({ data: { website: null } });
    },
    setLanguage: (_: never, { id }: IdVar, { cache }: Cache): void => {
      cache.writeData({ data: { language: id } });
    },
    resetLanguage: (_: never, __: never, { cache }: Cache): void => {
      cache.writeData({ data: { language: null } });
    },
    setPage: (_: never, { id }: IdVar, { cache }: Cache): void => {
      cache.writeData({ data: { page: id } });
    },
    resetPage: (_: never, __: never, { cache }: Cache): void => {
      cache.writeData({ data: { page: null } });
    }
  }
};

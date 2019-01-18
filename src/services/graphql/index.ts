import ApolloClient from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { withClientState } from 'apollo-link-state';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import { defaults, resolvers, typeDefs } from './local';
import { queries } from './queries';
import { mutations } from './mutations';
import { subscriptions } from './subscriptions';
import { OperationDefinitionNode } from 'graphql';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { message } from 'antd';

const cache = new InMemoryCache();

const stateLink = withClientState({
  cache,
  resolvers,
  defaults,
  typeDefs
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:5001/subscriptions`,
  options: {
    reconnect: true
  }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message: errorMessage, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${errorMessage}, Location: ${locations}, Path: ${path}`
      );
      message.warning(errorMessage, 10);

    });
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const httpLink = new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_SERVER });

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // eslint-disable-next-line no-undef
  const token = typeof window !== 'undefined' && localStorage.getItem('access_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  connectToDevTools: true,
  link: ApolloLink.from([
    errorLink,
    stateLink,
    // new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_SERVER }),
    authLink,
    link,
  ]),
  cache
});

export {
  queries,
  mutations,
  subscriptions
};

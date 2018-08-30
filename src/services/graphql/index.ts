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
import { fragments } from './fragments';
import { subscriptions } from './subscriptions';
import { OperationDefinitionNode } from 'graphql';

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

export const client = new ApolloClient({
  connectToDevTools: true,
  link: ApolloLink.from([
    stateLink,
    // new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_SERVER }),
    link,
  ]),
  cache
});

export {
  fragments,
  queries,
  mutations,
  subscriptions
};

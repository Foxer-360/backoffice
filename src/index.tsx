import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import 'antd/dist/antd.css';
import { ApolloProvider } from 'react-apollo';

import Application from './components/Application';
import Callback from './components/Callback';
import registerServiceWorker from './services/serviceWorker';
import store from './store';
import history from './services/history';
import { connect as socketConnect } from './services/socket';
import './styles/main.scss';
import { client as graphqlClient } from '@source/services/graphql';

ReactDOM.render(
  <ApolloProvider client={graphqlClient}>
  <LocaleProvider locale={enUS}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/callback" exact={true} component={Callback} />
          <Route path="/" component={Application} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  </LocaleProvider>
  </ApolloProvider>,
  document.getElementById('root') as HTMLElement
);

socketConnect(store);
registerServiceWorker();
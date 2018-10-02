import * as React from 'react';
import { Switch, Route } from 'react-router';
import StructureList from './components/StructureList';
import Editor from '@source/scenes/Editor';

const { Component } = React;

export interface Properties {
}

export interface State {
}

class Pages extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
  }

  render() {
    return (
      <Switch>
        <Route path="/pages" component={StructureList} />
        <Route path="/page" component={Editor} />
      </Switch>
    );
  }

}

export default Pages;

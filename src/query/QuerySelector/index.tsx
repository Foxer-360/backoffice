import * as React from 'react';
import QueryComponent from '../QueryComponent';
import { connect } from 'react-redux';

export interface Properties {
  selectors: {
    // tslint:disable-next-line:no-any
    [key: string]: (state: StoreState) => any;
  };
  // tslint:disable-next-line:no-any
  children: React.SFC<any> | React.ReactElement<any> | React.ReactNode[];
}

const QuerySelector = (props: Properties) => {
  const mapStateToProps = (state: StoreState) => {
    const map = {};
    const keys = Object.keys(props.selectors);
    keys.forEach((k: string) => {
      map[k] = props.selectors[k](state);
    }, this);

    return map;
  };

  class Wrapper extends QueryComponent<{}, {}> {

    buildProperties() {
      return this.props;
    }

  }

  const WrappedComponent = connect(
    mapStateToProps,
    null
  )(Wrapper);

  return (<WrappedComponent>{props.children}</WrappedComponent>);
};

export default QuerySelector;

import * as React from 'react';
import { connect } from 'react-redux';

import { actions as pageActions, selectors as pageSelectors } from '@source/models/pages';
import { Dispatch } from 'redux';

export interface InjectedProps {
  types: LooseObject[];
}

interface State {
  called: boolean;
}

const connectWithPageTypes = () => <OriginalProps extends {}>(
  WrappedComponent: (React.ComponentClass<OriginalProps & InjectedProps> |
    React.StatelessComponent<OriginalProps & InjectedProps>)
) => {
  type HOCProps = OriginalProps & InjectedProps & {
    fetchTypes: () => ReduxAction;
  };

  const mapStateToProps = (state: StoreState) => ({
    types: pageSelectors.types(state)
  });

  const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
    fetchTypes: (): ReduxAction => dispatch( pageActions.fetchTypes() )
  });

  const result = class WithPageTypes extends React.Component<HOCProps, State> {

    constructor(props: HOCProps) {
      super(props);

      this.state = {
        called: false
      };
    }

    componentDidMount() {
      if (this.props.types && this.props.types.length > 0) {
        return;
      }

      // Try to fetch types
      if (this.state.called) {
        return;
      }

      this.props.fetchTypes();
      this.setState({
        ...this.state,
        called: true
      });
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }

  };

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(result);
};

export default connectWithPageTypes;

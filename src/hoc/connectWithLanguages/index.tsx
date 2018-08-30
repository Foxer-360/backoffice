import * as React from 'react';
import { connect } from 'react-redux';

import { actions as envActions } from '@source/models/environment';
import { selectors as cacheSelectors } from '@source/models/cache';
import { Dispatch } from 'redux';

export interface InjectedProps {
  languages: LooseObject[];
}

interface State {
  called: boolean;
}

const connectWithLasnguages = () => <OriginalProps extends {}>(
  WrappedComponent: (React.ComponentClass<OriginalProps & InjectedProps> |
    React.StatelessComponent<OriginalProps & InjectedProps>)
) => {
  type HOCProps = OriginalProps & InjectedProps & {
    fetchLanguages: () => ReduxAction;
  };

  const mapStateToProps = (state: StoreState) => ({
    languages: cacheSelectors.getData(state, 'languages') || []
  });

  const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
    fetchLanguages: (): ReduxAction => dispatch( envActions.fetchLanguages() ) as ReduxAction
  });

  const result = class WithLanguages extends React.Component<HOCProps, State> {

    constructor(props: HOCProps) {
      super(props);

      this.state = {
        called: false
      };
    }

    componentDidMount() {
      if (this.props.languages && this.props.languages.length > 0) {
        return;
      }

      // Try to fetch types
      if (this.state.called) {
        return;
      }

      this.props.fetchLanguages();
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

export default connectWithLasnguages;

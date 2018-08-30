import * as React from 'react';
import { connect } from 'react-redux';

import { actions as pageActions, selectors as pageSelectors } from '@source/models/pages';
import { Dispatch } from 'redux';

export interface InjectedProps {
  structures: LooseObject[];
}

interface State {
  called: boolean;
}

const connectWithStructures = () => <OriginalProps extends {}>(
  WrappedComponent: (React.ComponentClass<OriginalProps & InjectedProps> |
    React.StatelessComponent<OriginalProps & InjectedProps>)
) => {
  type HOCProps = OriginalProps & InjectedProps & {
    fetchStructures: () => ReduxAction;
  };

  const mapStateToProps = (state: StoreState) => ({
    structures: pageSelectors.getStructuresTable(state)
  });

  const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
    fetchStructures: (): ReduxAction => dispatch( pageActions.fetchStructures() )
  });

  const result = class WithStructures extends React.Component<HOCProps, State> {

    constructor(props: HOCProps) {
      super(props);

      this.state = {
        called: false
      };
    }

    componentDidMount() {
      if (this.props.structures && this.props.structures.length > 0) {
        return;
      }

      // Try to fetch types
      if (this.state.called) {
        return;
      }

      this.props.fetchStructures();
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

export default connectWithStructures;

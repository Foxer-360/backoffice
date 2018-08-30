import { connect, Dispatch } from 'react-redux';
import { push, RouterAction } from 'react-router-redux';

import Application from './Application';

const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
  logoutCallback: (): RouterAction => dispatch( push('/') )
});

export default connect(
  null,
  mapDispatchToProps
)(Application);

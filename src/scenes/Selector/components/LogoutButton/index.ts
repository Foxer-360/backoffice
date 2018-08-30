import { connect, Dispatch } from 'react-redux';
import { push, RouterAction } from 'react-router-redux';

import LogoutButton from './LogoutButton';

const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
  logoutCallback: (): RouterAction => dispatch( push('/') )
});

export default connect(
  null,
  mapDispatchToProps
)(LogoutButton);

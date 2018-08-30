import { connect, Dispatch } from 'react-redux';
import { push, RouterAction } from 'react-router-redux';

import Callback from './Callback';

const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
  goHome: (): RouterAction => dispatch( push('/') )
});

export default connect(
  null,
  mapDispatchToProps
)(Callback);

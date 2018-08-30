import { connect, Dispatch } from 'react-redux';
import { push, RouterAction } from 'react-router-redux';

import Header from './Header';

import { selectors as envSelectors } from '../../../../models/environment';

const mapStateToProps = (state: StoreState) => ({
  project: <LooseObject> envSelectors.getProjectObject(state),
  website: <LooseObject> envSelectors.getWebsiteObject(state)
});

const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
  logoutCallback: (): RouterAction => dispatch( push('/') ),
  goToSelector: (): RouterAction => dispatch( push('/selector') )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);

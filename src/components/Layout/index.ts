import { connect } from 'react-redux';

import Layout from './Layout';
import { selectors as routerSelectors } from '../../models/router';

const mapStateToProps = (state: StoreState) =>  ({
  path: routerSelectors.parsePathname(state, '/:env/:select')
});

export default connect(
  mapStateToProps,
  null
)(Layout);

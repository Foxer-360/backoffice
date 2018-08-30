import { connect } from 'react-redux';
import StructureList from './StructureList';
import connectWithStructures from '@source/hoc/connectWithStructures';
import { actions as pageActions } from '@source/models/pages';
import { push } from 'react-router-redux';
import { flow } from 'lodash';
import { Dispatch } from 'redux';

const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
  removePage: (id: number) => dispatch( pageActions.removePage(id) ),
  editPage: (id: number) => dispatch( pageActions.selectPage(id) )
});

export default flow([
  connectWithStructures(),
  connect(null, mapDispatchToProps)
])(StructureList);

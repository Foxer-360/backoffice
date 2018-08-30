import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import PageTypes from './PageTypes';
import { actions as pagesActions } from '@source/models/pages';
import { flow } from 'lodash';
import connectWithPageTypes from '@source/hoc/connectWithPageTypes';

const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
  edit: (id: number, name: string) => dispatch( pagesActions.editType(id, name) ),
  remove: (id: number) => dispatch( pagesActions.removeType(id) ),
  add: (name: string) => dispatch( pagesActions.addType(name) )
});

export default flow([
  connect(null, mapDispatchToProps),
  connectWithPageTypes()
])(PageTypes);

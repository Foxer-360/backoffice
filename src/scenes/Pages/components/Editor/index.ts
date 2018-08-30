import { connect, Dispatch } from 'react-redux';
import { push } from 'react-router-redux';
import Editor from './Editor';
import { actions as pagesActions, selectors as pagesSelectors } from '@source/models/pages';
import { selectors as envSelectors } from '@source/models/environment';
import { actions as composerActions, selectors as composerSelectors } from '@source/models/composer';

const mapDispatchToProps = (dispatch: Dispatch<{}>) => ({
  cancel: () => dispatch( push('/pages') ),
  save: (content: LooseObject) => dispatch( pagesActions.updatePage(content) ),
  prepareForComposer: () => dispatch( pagesActions.prepareForComposer() ),
  startEditing: (id: number) => dispatch( composerActions.startEditComponent(id) ),
  stopEditing: (id: number) => dispatch( composerActions.stopEditComponent(id) ),
  resetPageId: () => dispatch( composerActions.resetPageId() )
});

const mapStateToProps = (state: StoreState) => ({
  languageId: envSelectors.languageId(state),
  name: pagesSelectors.getNameForStructure(state),
  content: composerSelectors.getContent(state),
  locked: pagesSelectors.getLockedComponents(state) as number[],
  pageId: composerSelectors.getPageId(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);

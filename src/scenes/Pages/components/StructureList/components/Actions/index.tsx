import * as React from 'react';
import Actions from './Actions';

type ActionCallback = (id: string) => void;

/*
 * This component is used in table, so it can be wrapped by function
 * with params text and record, than we parse props for Actions
 * component from record param...
 */
const recordWrapper = (handleAddPage: ActionCallback,
  handleEditPage: ActionCallback) => (text: string, record: LooseObject) => (
  <Actions
    id={record.id}
    url={`${record.urlPrefix}${record.fullUrl}`}
    handleAddPage={handleAddPage}
    handleEditPage={handleEditPage}
  />
);

export default recordWrapper;

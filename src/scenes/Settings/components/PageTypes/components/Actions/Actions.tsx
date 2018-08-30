import * as React from 'react';
import { Button, Popconfirm } from 'antd';

export interface Properties {
  id: string;
  edit: (id: string) => void;
  remove: (id: string) => void;
}

const Actions = ({id, edit, remove}: Properties) => (
  <>
    <Button size="small" onClick={() => edit(id)}>Edit</Button>
    <Popconfirm
      title="Are you sure, you want to remove this page type ?"
      onConfirm={() => remove(id)}
    >
      <Button size="small" style={{ marginLeft: 6 }} type="danger">Remove</Button>
    </Popconfirm>
  </>
);

export default Actions;

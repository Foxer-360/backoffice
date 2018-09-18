import * as React from 'react';
import { Button, Popconfirm } from 'antd';

export interface Properties {
  id: string;
  edit: (id: string) => void;
  build: (id: string) => void;
  remove: (id: string) => void;
}

const style = { marginLeft: 6 };

const Actions = ({id, edit, remove, build}: Properties) => (
  <>
    <Button type="primary" size="small" onClick={() => build(id)}>Build navigation</Button>
    <Button size="small" style={style} onClick={() => edit(id)}>Edit</Button>
    <Popconfirm
      title="Are you sure, you want to remove this page type ?"
      onConfirm={() => remove(id)}
    >
      <Button size="small" style={style} type="danger">Remove</Button>
    </Popconfirm>
  </>
);

export default Actions;

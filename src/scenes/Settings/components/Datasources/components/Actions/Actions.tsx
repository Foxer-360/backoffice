import * as React from 'react';
import { Button, Popconfirm } from 'antd';

export interface Properties {
  id: string;
  edit: (id: string) => void;
  remove: (id: string) => void;
}

const style = { marginLeft: 6 };

const Actions = ({id, edit, remove}: Properties) => (
  <>
    <Popconfirm
      title="Are you sure, you want to remove this tag ?"
      onConfirm={() => remove(id)}
    >
      <Button size="small" style={style} type="danger">Remove</Button>
    </Popconfirm>
  </>
);

export default Actions;

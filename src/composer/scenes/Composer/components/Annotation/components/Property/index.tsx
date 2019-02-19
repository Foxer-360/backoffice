import * as React from 'react';
import { Button, Col, Input, Row } from 'antd';

export interface Properties {
  name: string;
  value: string;

  isNew: boolean;
  isDeleted: boolean;

  onNameChange?: (key: string, name: string) => void;
  onValueChange?: (key: string, value: string) => void;
  onDelete?: (key: string) => void;
}

const callIfExists = (key: string, handler: (key: string, value: string) => void | null) => {
  if (!handler || handler == null) {
    return null;
  }

  return (e: React.ChangeEvent<HTMLInputElement>) => {
    handler(key, e.target.value);
  };
};

const Property = ({name, value, isNew, isDeleted, onNameChange, onValueChange, onDelete}: Properties) => (
  <Row style={{ marginBottom: '10px' }}>
    <Col span={8}>
      <label>Key</label>
      <Input
        disabled={!isNew || isDeleted}
        value={name}
        onChange={callIfExists(name, onNameChange)}
      />
    </Col>
    <Col span={1} />
    <Col span={11}>
      <label>Value</label>
      <Input
        disabled={isDeleted}
        value={value}
        onChange={callIfExists(name, onValueChange)}
      />
    </Col>
    <Col span={1} />
    <Col span={3}>
      <Button
        type={isDeleted ? 'dashed' : 'danger'}
        style={{ marginTop: '20px'}}
        onClick={() => onDelete ? onDelete(name) : null}
      >
        {isDeleted ? 'Restore' : 'Delete'}
      </Button>
    </Col>
  </Row>
);

export default Property;

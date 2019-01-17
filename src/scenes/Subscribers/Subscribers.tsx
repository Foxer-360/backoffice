import * as React from 'react';
import { Table } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const { Component } = React;

export interface Properties {

}

export interface State {

}

const SUBSCRIBERS = gql`
  query {
    subscribers {
      id
      email
      url
      createdAt
      ip
    }
  }
`;

const columns = [{
  title: 'Email',
  dataIndex: 'email',
  key: 'email',
}, {
  title: 'Url',
  dataIndex: 'url',
  key: 'url',
}, {
  title: 'Created at',
  dataIndex: 'createdAt',
  key: 'createdAt',
}, {
  title: 'Ip',
  dataIndex: 'ip',
  key: 'ip',
}];

class Subscribers extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
  }

  render() {
    return (
      <div>
        <Query query={SUBSCRIBERS} >
        {({ data, loading, error }) => {
          if (loading) { return 'Loading...'; }
          if (error) { return 'Error...'; }

          const { subscribers } = data;

          return <Table columns={columns} dataSource={subscribers} />;
        }}</Query>
      </div>
    );
  }

}

export default Subscribers;
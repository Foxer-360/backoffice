import * as React from 'react';
import { Table, Icon } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const { Component } = React;

export interface Properties {

}

export interface State {

}

const INQUIRIES = gql`
  query {
    inquiries {
      id
      message
      url
      createdAt
      formType
      ip
    }
  }
`;

const columns = [
  {
    title: 'Subject',
    dataIndex: 'message.subject',
    key: 'message.subject',
  }, {
    title: 'Created at',
    dataIndex: 'createdAt',
    key: 'createdAt',
  }, {
    title: 'Form type',
    dataIndex: 'formType',
    key: 'formType',
  },
  {
    title: 'Ip',
    dataIndex: 'ip',
    key: 'ip',
  },
];

class Inquiries extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
  }

  expandedRowRender = (row) => {
    return (
      <div style={{ padding: '30px' }}>
        <p>{row.message.firstName} {row.message.lastName}</p>
        <p>{row.message.email}</p>
        <p>{row.message.phone}</p>
        <p><strong>Message:</strong></p>
        <p>{row.message.text}</p>
        {row.message.attachment && <p>
          <a href={row.message.attachment} target={'_blank'}>
          <Icon type="download" /> Download attachment
          </a>
        </p>}
      </div>
    );
  }
  render() {
    return (
      <div>
        <Query query={INQUIRIES} >
        {({ data, loading, error }) => {
          if (loading) { return 'Loading...'; }
          if (error) { return 'Error...'; }

          const { inquiries } = data;

          return <Table
            className="inquiries"
            columns={columns}
            dataSource={inquiries}
            expandedRowRender={this.expandedRowRender}
          />;
        }}</Query>
      </div>
    );
  }

}

export default Inquiries;
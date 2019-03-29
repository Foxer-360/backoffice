import * as React from 'react';
import { Table, Popconfirm, Button } from 'antd';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { CSVLink, CSVDownload } from 'react-csv';
import moment from 'moment';

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

const DELETE_SUBSCRIBER = gql`
  mutation deleteSubscriber($id: ID!) {
    deleteSubscriber(where: { id: $id }) {
      id
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
}, {
  title: 'Actions', key: 'actions', width: 200,
  render: (unused, record) => (
    <Mutation 
      mutation={DELETE_SUBSCRIBER}
      update={(cache, { data: { deleteSubscriber } }) => {
        const { subscribers } = cache.readQuery({ query: SUBSCRIBERS });
        cache.writeQuery({
          query: SUBSCRIBERS,
          data: { subscribers: subscribers.filter(sub => sub.id !== deleteSubscriber.id )}
        });
      }}
    >
    {(deleteSubscriber) =>
      <Popconfirm title="Are you sure, you want to remove this page ?" onConfirm={() => deleteSubscriber({ variables: { id: record.id } })}>
        <Button size="small" ghost={true} icon="delete" style={{ marginLeft: 6 }} type="danger" />
      </Popconfirm>}
    </Mutation>)
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

          const csvData = [
          ];

          if (subscribers && subscribers.length > 0) {
            csvData.push(Object.keys(subscribers[0]).filter(key => !['id', '__typename'].includes(key)));
            subscribers.forEach(subscriber => 
              csvData.push(Object.keys(subscriber).filter(key => !['id', '__typename'].includes(key)).map(key => subscriber[key])));
          }
          return <>
            <Table columns={columns} dataSource={subscribers} />
            <Button>
              <CSVLink 
                data={csvData}
                filename={`subscribers-${moment().format()}.csv`}
              >
                Download csv
              </CSVLink>
            </Button>
          </>;
        }}</Query>
      </div>
    );
  }

}

export default Subscribers;
import * as React from 'react';
import { Table, Popconfirm, Icon, Button } from 'antd';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { CSVLink, CSVDownload } from 'react-csv';
import moment from 'moment';

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

const DELETE_INQUIRY = gql`
  mutation deleteInquiry($id: ID!) {
    deleteInquiry(where: { id: $id }) {
      id
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
    title: 'Ip',
    dataIndex: 'ip',
    key: 'ip',
  }, {
    title: 'Actions', key: 'actions', width: 200,
    render: (unused, record) => (
      <Mutation 
        mutation={DELETE_INQUIRY}
        update={(cache, { data: { deleteInquiry } }) => {
          const { inquiries } = cache.readQuery({ query: INQUIRIES });
          cache.writeQuery({
            query: INQUIRIES,
            data: { inquiries: inquiries.filter(sub => sub.id !== deleteInquiry.id )}
          });
        }}
      >
      {(deleteSubscriber) =>
        <Popconfirm title="Are you sure, you want to remove this page ?" onConfirm={() => deleteSubscriber({ variables: { id: record.id } })}>
          <Button size="small" ghost={true} icon="delete" style={{ marginLeft: 6 }} type="danger" />
        </Popconfirm>}
      </Mutation>)
  }];

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

          const csvData = [
          ];

          if (inquiries && inquiries.length > 0) {
            csvData.push(
                [
                  ...Object.keys(inquiries[0]).filter(key => !['id', '__typename', 'message'].includes(key)),
                  ...Object.keys(inquiries[0].message)
                ]);
            inquiries.forEach(inquiry => 
              csvData.push(
                [
                  ...Object.keys(inquiry)
                    .filter(key => !['id', '__typename', 'message'].includes(key)).map(key => inquiry[key]), 
                  ...Object.keys(inquiry.message)
                    .map(key => inquiry.message[key])
                ]
              )
            );
          }

          return <><Table
            className="inquiries"
            columns={columns}
            dataSource={inquiries}
            expandedRowRender={this.expandedRowRender}
          />
            <Button>
              <CSVLink 
                data={csvData}
                filename={`subscribers-${moment().format()}.csv`}
              >
                Download csv
              </CSVLink>
            </Button>
            <CSVDownload data={csvData} target="_blank" />
          </>;
        }}</Query>
      </div>
    );
  }

}

export default Inquiries;
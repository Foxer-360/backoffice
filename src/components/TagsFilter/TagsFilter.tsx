import * as React from 'react';
import { Popover, Tag, Card, Icon } from 'antd';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import { Link } from 'react-router-dom';

const { Component } = React;

const GET_TAGS = gql`
  query {
    tags {
      id
      name
      color
      displayInNavigation
    }
  }
`;

const SELECT_TAG_ID = gql`{
  tag @client
}`;

const ComposedQuery = adopt({
  tags: ({ render }) => (
    <Query query={GET_TAGS}>{
      (data) => render(data)
    }</Query>
  ),
  selectedTagId: ({ render }) => (
    <Query 
      query={SELECT_TAG_ID}
    >
      {({ data }) => render(data && data.tag)}
    </Query>
  ),
});

export interface Properties {
  pageId?: string;
  popOver?: boolean;
  filteredTags?: boolean;
}

export interface State {
  expanded: boolean;
}

class Tags extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      expanded: false
    };
  }

  render(): JSX.Element {
    const { pageId, popOver } = this.props;

    return (
      <div>
        <ComposedQuery>{
        ({ tags: { data, loading, error }, selectedTagId }) => {

            if (loading) { return 'Loading...'; }
            if (error) { return 'Error...'; }

            const { tags } = data;
            if (this.props.filteredTags) {
              return this.renderFilteredTags(tags, selectedTagId);
            }

            return this.renderTags(tags, selectedTagId);
        }}</ComposedQuery>
      </div>
    );
  }

  renderFilteredTags = (tags, selectedTagId) => (
    <Card
      style={{ background: 'transparent', border: 'none' }}
    >
    {tags
        .filter(({ displayInNavigation }) => displayInNavigation)
        .map(({ id, name, color }, key) => {
        return (
          <Tag
            key={id}
            {...(selectedTagId === id ? { color } : {})}
          >
            <Link 
              to={`/pages?tag=${id}`}
            >
              {name}
            </Link>
          </Tag>
        );
      })}
    </Card>)
  
  renderTags = (tags, selectedTagId) => {
    
    const content = <div>{this.getUninsertedTags(tags, selectedTagId)}</div>;

    return (
    <div>
    {tags
        .filter(({ id }) => id === selectedTagId)
        .map(({ color, name, pages, id: tagId }, key) => {
          return (
            <Tag
              key={key}
              color={color}
            >
              {name}
            </Tag>
          );
        })}

    <Popover content={content} trigger="click" placement="top">
      <Popover content={content} trigger="hover" placement="top">
          <Tag style={{ background: '#fff', borderStyle: 'dashed' }}>
            <Icon type="plus" /> Select tag
          </Tag>
      </Popover>
    </Popover>
    </div>);
  }

  getUninsertedTags(tags: Array<LooseObject>, selectedTagId: String) {
    const { pageId } = this.props;

    return tags
      .filter(({ id }) => selectedTagId !== id)
      .map(({ color, name, id }, key) => {
        return (
          <Tag
            key={key}
            color={color}
          >
            <Link 
              to={`/pages?tag=${id}`}
            >
              {name}
            </Link>
          </Tag>
        );
      });
  }
}

export default Tags;
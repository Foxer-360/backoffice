import * as React from 'react';
import { Tag } from 'antd';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';

const { Component } = React;

const UPDATE_TAG = gql`
mutation($connectedPages: [PageWhereUniqueInput!], $disconnectedPages: [PageWhereUniqueInput!], $tagId: ID!) {
  updateTag(data: { pages: { connect: $connectedPages, disconnect: $disconnectedPages}}, where: { id: $tagId }) {
		id
    name
    pages {
      id
    }
    color
  }
}
`;

const GET_TAGS = gql`
query {
  tags {
    id
    name
    pages {
      id
    }
    color
  }
}
`;

const ComposedQuery = adopt({
  tags: ({ render }) => (
    <Query query={GET_TAGS}>
      {(tags) => render(tags)}
    </Query>
  ),
  updateTag: ({ render }) => (
    <Mutation 
      mutation={UPDATE_TAG}
      
      update={(cache, { data: { updateTag } }) => {

        const { tags } = cache.readQuery({ query: GET_TAGS });

        cache.writeQuery({
          query: GET_TAGS,
          data: { tags: tags.map(tag => {
            if (tag.id === updateTag.id ) {
              return updateTag;
            } else {
              return tag;
            }
          })}
        });
      }}
    >
      {(updateTag) => render(updateTag)}
    </Mutation>
  )
});

export interface Properties {
  pageId?: string;
}

export interface State {}

class Tags extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
  }

  render(): JSX.Element {
    const { pageId } = this.props;

    return (
      <div>
        <ComposedQuery query={GET_TAGS}>{
          ({ 
            tags: { 
              data: { 
                tags 
              }, 
              error, 
              loading 
            },
            updateTag
          }) => {

            if (error) { return 'Error...'; }
            if (loading) { return 'Loading...'; }

            return tags.map(({ color, name, pages, id: tagId }, key) => {
              const isTagSelected = pages.some(({ id }) => pageId === id );
              return <Tag
                key={key} 
                {...(isTagSelected ? { color } : {})}
                onClick={() => {
                  updateTag({ variables: { ...(isTagSelected ? { 
                    disconnectedPages: [{ id: pageId }]
                  } : {
                    connectedPages: [{ id: pageId }]
                  }), tagId } });
                }}
              >
                {name}
              </Tag>;
            });
          }}
        </ComposedQuery>
      </div>
    );
  }

}

export default Tags;

import * as React from 'react';

import gql from 'graphql-tag';

import { Popover, Tag, Icon } from 'antd';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';

const { Component } = React;

const UPDATE_TAG = gql`
  mutation($connectedPages: [PageWhereUniqueInput!], $disconnectedPages: [PageWhereUniqueInput!], $tagId: ID!) {
    updateTag(data: { pages: { connect: $connectedPages, disconnect: $disconnectedPages } }, where: { id: $tagId }) {
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
  tags: ({ render }) => <Query query={GET_TAGS}>{tags => render(tags)}</Query>,
  updateTag: ({ render }) => (
    <Mutation
      mutation={UPDATE_TAG}
      update={(cache, { data: { updateTag } }) => {
        const { tags } = cache.readQuery({ query: GET_TAGS });

        cache.writeQuery({
          query: GET_TAGS,
          data: {
            tags: tags.map(tag => {
              if (tag.id === updateTag.id) {
                return updateTag;
              } else {
                return tag;
              }
            }),
          },
        });
      }}
    >
      {updateTag => render(updateTag)}
    </Mutation>
  ),
});

export interface Properties {
  pageId?: string;
  popOver?: boolean;
}

export interface State {}

class Tags extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
  }

  isTagSelected(pages: Array<LooseObject>, pageId: string) {
    return pages.some(({ id }) => pageId === id);
  }

  getUninsertedTags(tags: Array<LooseObject>, updateTag: Function) {
    const { pageId } = this.props;

    return tags
      .filter(({ pages }) => !this.isTagSelected(pages, pageId))
      .map(({ color, name, pages, id: tagId }, key) => {
        return (
          <Tag
            key={key}
            color={color}
            onClick={() => {
              updateTag({
                variables: {
                  ...(this.isTagSelected(pages, pageId)
                    ? {
                        disconnectedPages: [{ id: pageId }],
                      }
                    : {
                        connectedPages: [{ id: pageId }],
                      }),
                  tagId,
                },
              });
            }}
          >
            {name}
          </Tag>
        );
      });
  }

  render(): JSX.Element {
    const { pageId, popOver } = this.props;

    return (
      <div>
        <ComposedQuery query={GET_TAGS}>
          {({ tags: { data, error, loading }, updateTag }) => {
            if (error) {
              return 'Error...';
            }
            if (loading) {
              return 'Loading...';
            }

            const content = <div>{this.getUninsertedTags(data.tags && data.tags, updateTag)}</div>;
            const numberOfUnselectedTags =
              data.tags && data.tags.filter(({ pages }) => !this.isTagSelected(pages, pageId)).length;
            return (
              <div>
                {data.tags &&
                  data.tags
                    .filter(({ pages }) => this.isTagSelected(pages, pageId))
                    .map(({ color, name, pages, id: tagId }, key) => {
                      return (
                        <Tag
                          onClick={() => {
                            updateTag({
                              variables: {
                                ...(this.isTagSelected(pages, pageId)
                                  ? {
                                      disconnectedPages: [{ id: pageId }],
                                    }
                                  : {
                                      connectedPages: [{ id: pageId }],
                                    }),
                                tagId,
                              },
                            });
                          }}
                          key={key}
                          color={color}
                        >
                          {name}
                        </Tag>
                      );
                    })}

                <Popover content={content} trigger="click" placement="bottomLeft">
                  <Popover content={content} trigger="hover" placement="bottomLeft">
                    {numberOfUnselectedTags > 0 && (
                      <Tag style={{ background: '#fff', borderStyle: 'dashed' }}>
                        <Icon type="plus" /> New Tag
                      </Tag>
                    )}
                  </Popover>
                </Popover>
              </div>
            );
          }}
        </ComposedQuery>
      </div>
    );
  }
}

export default Tags;

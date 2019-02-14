import * as React from 'react';
import { Popover, Tag, Icon } from 'antd';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import { GET_TAGS } from '@source/services/graphql/queries/system';

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

export interface State {
  itemsToShow: number;
  expanded: boolean;
}

class Tags extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      itemsToShow: 5,
      expanded: false
    };

    this.showMore = this.showMore.bind(this);
  }

  showMore(tagsLength: number) {
    this.state.itemsToShow === 5 ? (
      this.setState({ itemsToShow: tagsLength, expanded: true })
    ) : (
      this.setState({ itemsToShow: 5, expanded: false })
    );
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
                    .slice(0, this.state.itemsToShow)
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

                {numberOfUnselectedTags < 5 && data.tagsLength > 0 && (
                  <Icon 
                    type={'ellipsis'} 
                    style={{ color: 'grey', cursor: 'pointer' }}
                    onClick={() => this.showMore(data.tagsLength)}
                  />
                )}
              </div>
            );
          }}
        </ComposedQuery>
      </div>
    );
  }
}

export default Tags;
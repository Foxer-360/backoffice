import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import { Modal, Button } from 'antd';
import NavigationBuilder from './NavigationBuilder';
import './style.css';

const { Component, createRef } = React;

import {
  PageTranslation,
  RawNavigationPage,
  NavigationPage,
  NavigationNode,
  NavigationNodeWithJoin,
  NavigationStructure,
  QueryVariables
} from '../../interfaces';

const NavigationBuilderQM = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data }) => {
        return render(data.website);
      }}
    </Query>
  ),
  language: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_LANGUAGE}>
      {({ data }) => {
        return render(data.language);
      }}
    </Query>
  ),
  nodes: ({ render, id }) => {
    if (!id) {
      return render(null);
    }

    return (
      <Query query={queries.NAVIGATION_NODES} variables={{ navigation: id }}>
        {({ loading, data, error }) => {
          if (loading || error) {
            return render(null);
          }

          const nodes: NavigationNode[] = data.navigationNodes && data.navigationNodes.map((node: NavigationNode) => {
            const model: NavigationNode = {
              page: node.page,
              title: node.title,
              link: node.link,
              order: node.order,
              parent: node.parent
            };
            return model;
          });

          return render(nodes);
        }}
      </Query>
    );
  },
  pages: ({ language, website, render }) => {
    if (!website) {
      return render(null);
    }

    return (
      <Query query={queries.NAVIGATION_PAGE_LIST} variables={{ website }}>
        {({ loading, data, error }) => {
          if (loading || error) {
            return render(null);
          }

          const pages: NavigationPage[] = data.pages.map((p: RawNavigationPage) => {
            const model: NavigationPage = {
              id: p.id,
              name: null as string,
              url: null as string,
              parent: p.parent ? p.parent.id : null
            };

            const translation = p.translations.find((t: PageTranslation) => {
              if (t.language.id === language) {
                return true;
              }
              return false;
            });

            if (translation) {
              model.name = translation.name;
              model.url = translation.url;
            }

            return model;
          });

          return render(pages);
        }}
      </Query>
    );
  },
  createNavigationStructure: ({ render, id }) => (
    <Mutation
      mutation={mutations.CREATE_NAVIGATION_STRUCTURE}
      update={(cache, { data: { createNavigationStructure } }) => {
        cache.writeQuery({
          query: queries.NAVIGATION_NODES,
          variables: { navigation: id },
          data: { navigationNodes: createNavigationStructure }
        });
      }}
    >
      {createNavigationStructure => render(createNavigationStructure)}
    </Mutation>
  )
});

interface Properties {
  visible: boolean;
  id: string;
  onCancel: () => void;
  onSave: () => void;
}

interface State {
  current: number;
}

class ModalWindow extends Component<Properties, State> {

  private child: React.RefObject<NavigationBuilder>;

  constructor(props: Properties) {
    super(props);
    this.state = { current: 0 };
    this.child = createRef();
  }

  buildUrl(page: NavigationPage, pages: NavigationPage[]): string {
    let url: string = page.url;
    if (page.parent) {
      url = `${this.buildUrl(pages.find(parent => page.parent === parent.id), pages)}/${url}`;
    }
    return url;
  }

  createUrls(data: NavigationPage[]): NavigationPage[] {
    return data.map((page) => ({
      ...page,
      url: this.buildUrl(page, data)
    }));
  }

  next(): void {
    let { current } = this.state;
    current++;
    this.setState({ current });
  }

  prev(): void {
    let { current } = this.state;
    current--;
    this.setState({ current });
  }

  render() {
    const { current } = this.state;
    const footer = [];
    if (current === 0) {
      footer.push(<Button key="cancel" onClick={() => this.props.onCancel()}>Cancel</Button>);
      footer.push(<Button key="next" type="primary" onClick={() => this.next()}>Next</Button>);
    } else {
      footer.push(<Button key="cancel" onClick={() => this.props.onCancel()}>Cancel</Button>);
      footer.push(<Button key="back" onClick={() => this.prev()}>Back</Button>);
      footer.push(<Button key="save" type="primary" onClick={() => this.child.current.saveStructure()}>Save</Button>);
    }

    return (
      <Modal
        title={'Navigation structure builder'}
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        footer={footer}
        className="wideModal"
      >
        <NavigationBuilderQM id={this.props.id}>
          {(input: {
            pages: NavigationPage[],
            nodes: NavigationNode[],
            createNavigationStructure: (data: QueryVariables<NavigationStructure>) => Promise<void>
          }) => {
            const { pages, nodes, createNavigationStructure } = input;

            if (!pages || !nodes) {
              return (
                <div>Loading Content</div>
              );
            }

            if (!pages.length) {
              return (
                <div>There are no pages</div>
              );
            }

            return (
              <NavigationBuilder
                ref={this.child}
                navigationID={this.props.id}
                current={this.state.current}
                pages={this.createUrls(pages)}
                nodes={nodes}
                onSave={async (data: NavigationNodeWithJoin[]) => {
                  await createNavigationStructure({ variables: { data, id: this.props.id } });
                  this.props.onSave();
                }}
              />
            );
          }}
        </NavigationBuilderQM>
      </Modal>
    );
  }

}

export default ModalWindow;

import * as React from 'react';
import { Button, Popconfirm, Table, Card } from 'antd';
import CreatePageModal from './components/CreatePageModal';
import Actions from './components/Actions';
import { Query } from 'react-apollo';
import { queries } from '@source/services/graphql';
import { adopt } from 'react-adopt';

const { Component } = React;

export interface Page {
  id: string;
  name: string;
  parent: string | null;
  type: string;
  url: string;
}

export interface TablePage {
  id: string;
  key: string;
  name: string;
  parent: string | null;
  type: string;
  url: string;
  urlPrefix?: string;
  fullUrl?: string;
  children?: Array<TablePage>;
}

export interface Properties {
  structures: LooseObject[];

  editPage: (id: number) => ReduxAction;
  removePage: (id: number) => ReduxAction;
}

export interface State {
  modal: {
    visible: boolean;
    parentId: string | null;
  };
}

const PageList = adopt({
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
  fullWebsite: ({ website, render }) => (
    <Query query={queries.WEBSITE_DETAIL} variables={{ id: website }}>
      {({ data }) => {
        return render(data.website);
      }}
    </Query>
  ),
  pages: ({ language, website, render }) => {
    if (!website) {
      return render([]);
    }

    return (
      <Query query={queries.PAGE_LIST} variables={{ website }}>
        {({ loading, data, error }) => {
          if (loading || error) {
            return render([]);
          }

          // Transform data into language depend
          const pages = data.pages.map((p: LooseObject) => {
            const model = {
              id: p.id,
              type: p.type.name,
              parent: p.parent ? p.parent.id : null,
              name: null as string,
              url: null as string,
            };
            const translation = p.translations.find((t: LooseObject) => {
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
});

interface PageListObject {
  website?: string;
  language?: string;
  fullWebsite?: LooseObject;
  pages?: Array<Page>;
}

class StructureList extends Component<Properties, State> {

  private readonly INITIAL_STATE: State = {
    modal: {
      visible: false,
      parentId: null
    }
  };

  private readonly COLUMNS = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Url', dataIndex: 'url', key: 'url'},
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Actions', key: 'actions',
      render: Actions(this.handleAddPage.bind(this), this.handleEditPage.bind(this)) }
  ];

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.INITIAL_STATE
    };

    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleAddPage = this.handleAddPage.bind(this);
    this.handleEditPage = this.handleEditPage.bind(this);
  }

  handleCloseModal() {
    this.setState({
      ...this.state,
      modal: {
        ...this.state.modal,
        visible: false
      }
    });
  }

  handleAddPage(parentId: string | null) {
    this.setState({
      ...this.state,
      modal: { visible: true, parentId }
    });
  }

  handleEditPage(id: string) {
    // this.props.editPage(id);
  }

  removeEmptyChildrens(page: TablePage): TablePage {
    if (page.children.length) {
      for (let i = 0; i < page.children.length; i++) {
        page.children[i] = this.removeEmptyChildrens(page.children[i]);
      }
    } else {
      delete page.children;
    }
    return page;
  }

  pagesToTree(list: Array<TablePage>): Array<TablePage> {
    let map: LooseObject = {},
      node: TablePage,
      roots: Array<TablePage> = [];
    // Prepare
    for (let i = 0; i < list.length; i++) {
      map[list[i].id] = i;
      list[i].children = [];
    }
    // Make tree structure
    for (let i = 0; i < list.length; i++) {
      node = list[i];
      if (node.parent) {
        list[map[node.parent]].children.push(node);
      } else {
        roots.push(node);
      }
    }
    // Clear
    for (let i = 0; i < roots.length; i++) {
      roots[i] = this.removeEmptyChildrens(roots[i]);
      this.resolveFullUrls(roots[i], null);
    }
    return roots;
  }

  resolveFullUrls(node: TablePage, parentUrl: string | null) {
    node.fullUrl = parentUrl ? `${parentUrl}/${node.url}` : `${node.url.length > 0 ? `/${node.url}` : ``}`;

    if (node.children === null || node.children === undefined) {
      return;
    }
    if (node.children.length < 1) {
      return;
    }

    node.children.forEach((child: TablePage) => {
      this.resolveFullUrls(child, node.fullUrl);
    }, this);
  }

  getUrlPrefix(website: LooseObject, language: string) {
    let lang = null;
    if (website && website.languages) {
      lang = website.languages.find((l: LooseObject) => {
        if (l.id === language) {
          return true;
        }

        return false;
      });
    }

    let websiteMask = (website && website.urlMask ? website.urlMask : '/');
    if (websiteMask[websiteMask.length - 1] === '/') {
      websiteMask = websiteMask.slice(0, -1);
    }

    if (!lang) {
      return websiteMask;
    }

    return `${websiteMask}/${lang.code}`;
  }

  render() {
    return (
      <>
        <PageList >
          {({ fullWebsite, language, pages }: PageListObject) => {
            if (!pages || pages.length < 1) {
              return (
                <>
                 <Card title={'No page found. Create your first.'}loading={true} />
                  <div>
                  <br />
                  <Button icon="plus-circle-o" onClick={() => this.handleAddPage(null)} type="primary">
                    Add first page
                  </Button>
                </div>
                </>
              );
            }

            // const keysToExpand = [] as string[];
            const urlPrefix = this.getUrlPrefix(fullWebsite, language);
            const data: Array<TablePage> = this.pagesToTree(pages.map((page: Page) => {
              const res: TablePage = {
                ...page,
                key: page.id,
                urlPrefix,
              };
              return res;
            }));
            return (
              <Table
                columns={this.COLUMNS}
                dataSource={data}
                defaultExpandAllRows={true}
              />
            );
          }}
        </PageList>

        <CreatePageModal
          visible={this.state.modal.visible}
          onOk={this.handleCloseModal}
          onCancel={this.handleCloseModal}
          parentId={this.state.modal.parentId}
        />
      </>
    );
  }

}

export default StructureList;

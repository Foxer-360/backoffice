import * as React from 'react';
import { 
  Button,
  Popconfirm,
  Table,
  Card,
  Row,
  Col,
  Input
} from 'antd';
import CreatePageModal from './components/CreatePageModal';
import Actions from './components/Actions';
import { Query } from 'react-apollo';
import { queries } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import Tags from './../../../../components/Tags';
import TagsFilter from '@source/components/TagsFilter';

const { Component } = React;
const Search = Input.Search;

export interface Page {
  id: string;
  name: string;
  parent: string | null;
  type: string;
  url: string;
  tags: Array<LooseObject>;
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
  tags: Array<LooseObject>;
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
  searchedText: string;
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
        return render(data && data.website);
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

          if (error) { return 'Error...'; }
          // Transform data into language depend
          const pages = data && data.pages && data.pages.map((p: LooseObject) => {
            const model = {
              id: p.id,
              type: p.type.name,
              parent: p.parent ? p.parent.id : null,
              name: null as string,
              url: null as string,
              translations: p.translations,
              tags: p.tags,
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
  selectedTagId: ({ render }) => (
    <Query 
      query={gql`{
        tag @client
      }`}
    >
      {({ data }) => {
        return render(data && data.tag);
      }}
    </Query>
  ),
});

interface PageListObject {
  website?: string;
  language?: string;
  fullWebsite?: LooseObject;
  pages?: Array<Page>;
  selectedTagId?: string;
}

class StructureList extends Component<Properties, State> {
  private readonly INITIAL_STATE: State = {
    modal: {
      visible: false,
      parentId: null,
    },
    searchedText: null,
  };
  private readonly COLUMNS = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 550,
      render: (name, row) => {
        return (
          <div style={{ display: 'inline-block' }}>
            <p style={{ marginBottom: '5px' }}>{name}</p>
            <p style={{ fontSize: '0.9em' }}>
              url: {row.url && row.url || '/'}
            </p>
          </div>
        );
      }
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (value, { id }) => {
        return <Tags popOver={true} pageId={id} />;
      }
    },
    { title: 'Actions', key: 'actions', width: 200,
      render: Actions(this.handleAddPage.bind(this), this.handleEditPage.bind(this)) }
  ];

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.INITIAL_STATE,
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
        visible: false,
      },
    });
  }

  handleAddPage(parentId: string | null) {
    this.setState({
      ...this.state,
      modal: { visible: true, parentId },
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
    node.fullUrl = parentUrl ? `${parentUrl}/${node.url}` : `${node.url && node.url.length > 0 ? `/${node.url}` : ``}`;

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

    let websiteMask = website && website.urlMask ? website.urlMask : '/';
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
        <div className="pages-filter-header">
          <Row type="flex" justify="end">
            <Col span={6}>
                <TagsFilter />
            </Col>
            <Col span={14} />
            <Col span={4}>
              <Search
                placeholder="search text"
                onChange={({ target: { value: searchedText } }) => this.setState({ searchedText })}
                onSearch={searchedText => this.setState({ searchedText })}
              />
            </Col>
          </Row>
        </div>
        <PageList>
          {({ fullWebsite, language, pages, selectedTagId }: PageListObject) => {
            if (!pages || pages.length < 1) {
              return (
                <>
                  <Card title={'No page found. Create your first.'} loading={true} />
                  <div>
                    <br />
                    <Button icon="plus-circle-o" onClick={() => this.handleAddPage(null)} type="primary">
                      Add first page
                    </Button>
                  </div>
                </>
              );
            }

            const urlPrefix = this.getUrlPrefix(fullWebsite, language);
            const pagesWithUrlPrefix = pages.map((page: Page) => {
              const res: TablePage = {
                ...page,
                key: page.id,
                urlPrefix,
                tags: page.tags
              };
              return res;
            });
            const data: Array<TablePage> = (!this.state.searchedText && !selectedTagId) ? 
              this.pagesToTree(pagesWithUrlPrefix) :
              pagesWithUrlPrefix.filter(page => {
                if (this.state.searchedText && !JSON.stringify(page).toLowerCase().includes(this.state.searchedText.toLowerCase())) {
                  return false;
                }
                if (selectedTagId && !page.tags.some(({ id }) => selectedTagId === id)) {
                  return false;
                }
                return true;
              });

            return <Table columns={this.COLUMNS} dataSource={data} defaultExpandAllRows={true} />;
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
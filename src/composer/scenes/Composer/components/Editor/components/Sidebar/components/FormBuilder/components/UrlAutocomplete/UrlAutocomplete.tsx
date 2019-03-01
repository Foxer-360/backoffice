import React from 'react';
import { AutoComplete, Input, Checkbox, Drawer, Button, Icon, Card, Collapse } from 'antd';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { adopt } from 'react-adopt';
import UploadTabs from '../MediaLibrary/Components/UploadTabs';
import GalleryTabs from '../MediaLibrary/Components/GalleryTabs';

const GET_CONTEXT = gql`
  {
    languageData @client
    websiteData @client
  }
`;

const Panel = Collapse.Panel;

const GET_PAGES_URLS = gql`
  query pagesUrls($language: ID!, $websiteId: ID!) {
    pagesUrls(where: { language: $language, websiteId: $websiteId }) {
      id
      page
      url
      name
      description
    }
  }
`;

const ComposedQuery = adopt({
  context: ({ render }) => <Query query={GET_CONTEXT}>{({ data }) => render(data)}</Query>,
  getPagesUrls: ({ render, context: { languageData, websiteData } }) => {
    if (!(languageData && websiteData)) {
      return render({ loading: true });
    }
    return (
      <Query query={GET_PAGES_URLS} variables={{ language: languageData.id, websiteId: websiteData.id }}>
        {data => {
          return render(data);
        }}
      </Query>
    );
  },
});

export interface IUrlAutocomplete {
  name: string;
  label: string;
  notitle?: boolean;
  value?: {
    url: string;
    urlNewWindow: boolean;
    pageId?: string;
    pageSourcedUrl?: boolean;
  };
  placeholder?: string;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
  pageSourceAvailable?: boolean;
}

export interface IState {
  urlNewWindow: boolean;
  pageSourcedUrl: boolean;
  visible: boolean;
  drawerType: string;
}

class UrlAutocomplete extends React.Component<IUrlAutocomplete, IState> {
  constructor(props: IUrlAutocomplete) {
    super(props);

    this.state = {
      urlNewWindow: false,
      pageSourcedUrl: false,
      visible: false,
      drawerType: 'editor',
    };
  }

  onChange = (newVal, pagesUrls?: Array<LooseObject>) => {
    let pageUrlObj;
    if (newVal.url && pagesUrls) {
      pageUrlObj = pagesUrls.find(u => u.url === newVal.url);
    }

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...(this.props.value || {}),
          ...newVal,
          ...(pageUrlObj ? { pageId: pageUrlObj.page } : {}),
        },
      },
    });
  }

  onFileSelected = ({ value: data }: LooseObject) => {
    const baseUrl = 'http://foxer360-media-library.s3.eu-central-1.amazonaws.com/';

    this.closeDrawer();

    if (data && data.filename) {
      let originalUrl = baseUrl + data.category + data.hash + '_' + data.filename;

      this.props.onChange({
        target: {
          name: this.props.name,
          value: {
            url: originalUrl,
            mediaData: data,
            urlNewWindow: this.props.value.urlNewWindow
          },
        },
      });
    } else {
      return null;
    }
  }

  public onClose = () => {
    this.setState({
      visible: false,
    });
  }

  public closeDrawer = () => {
    this.setState({
      visible: false,
    });
  }

  public showDrawer = (type: string) => {
    this.setState({
      drawerType: type,
      visible: true,
    });
  }

  render() {
    const { onChange, value, pageSourceAvailable } = this.props;

    return (
      <ComposedQuery>
        {({ getPagesUrls: { data, loading: urlsLoading }, loading, error }) => {
          if (loading || urlsLoading) {
            return 'Loading...';
          }

          if (error) {
            return `Error: ${error}`;
          }
          const { pagesUrls } = data;

          let pageUrlObj;
          if (value && value.url && value.pageId && pagesUrls) {
            pageUrlObj = pagesUrls.find(u => u.page === value.pageId);
          }

          return (
            <div style={{ paddingBottom: '5px' }}>
              {this.props.notitle && this.props.notitle === true ? null : <label>{this.props.label}</label>}
              {pagesUrls && pagesUrls.length > 0 && (
                <div>
                  {(!value || (value && !value.pageSourcedUrl)) && (
                    <>
                      <div className="url-autocomplete-input">
                        <AutoComplete
                          dataSource={pagesUrls.map(source => source.url).filter(u => u !== '')}
                          filterOption={(inputValue, { props: { children } }: LooseObject) =>
                            children.toUpperCase().includes(inputValue.toUpperCase())}
                          defaultValue={pageUrlObj && pageUrlObj ? pageUrlObj.url : value && value.url}
                          value={pageUrlObj && pageUrlObj ? pageUrlObj.url : value && value.url}
                          onSearch={newUrl => this.onChange({ url: newUrl }, pagesUrls)}
                          onSelect={newUrl => this.onChange({ url: newUrl }, pagesUrls)}
                          size="default"
                        />
                        <div>
                          <Button 
                            size="default"
                            onClick={() => this.showDrawer('gallery')}
                          >
                            <Icon type={'search'} />
                          </Button>
                          <Button 
                            size="default"
                            onClick={() => this.showDrawer('editor')}
                          >
                            <Icon type={'upload'} />
                          </Button>
                        </div>
                      </div>
                      <Checkbox
                        checked={value && value.urlNewWindow}
                        onChange={() => {
                          this.setState({ urlNewWindow: !this.state.urlNewWindow }, () => {
                            this.onChange({ urlNewWindow: this.state.urlNewWindow });
                          });
                        }}
                      >
                        Open in New window
                      </Checkbox>
                      <Drawer
                        title="Media Library"
                        placement="right"
                        closable={true}
                        onClose={this.onClose}
                        visible={this.state.visible}
                        width={500}
                        destroyOnClose={true}
                      >
                        {this.state.drawerType === 'editor' ? (
                          <UploadTabs
                            onChange={this.onFileSelected}
                            name={this.props.name}
                            mediaData={pageUrlObj && pageUrlObj.mediaData}
                            closeDrawer={this.closeDrawer}
                          />
                        ) : (
                          <GalleryTabs 
                            placeMedia={this.onFileSelected}
                            name={this.props.name} 
                            media={pageUrlObj && pageUrlObj.mediaData}
                          />
                        )}
                      </Drawer>
                    </>
                  )}

                  {pageSourceAvailable && (
                    <Checkbox
                      style={{ margin: '0.6em 0 0.5em' }}
                      checked={value && value.pageSourcedUrl}
                      onChange={() => {
                        this.setState({ pageSourcedUrl: !this.state.pageSourcedUrl }, () => {
                          this.onChange({ pageSourcedUrl: this.state.pageSourcedUrl });
                        });
                      }}
                    >
                      Use dynamic page as source.
                    </Checkbox>
                  )}
                </div>
              )}
              {pagesUrls && pagesUrls.length === 0 && (
                <Input
                  type="text"
                  id="url"
                  value={value && value.url}
                  onChange={e =>
                    onChange({
                      target: {
                        name: this.props.name,
                        value: {
                          ...(value || {}),
                          url: e.target.value,
                        },
                      },
                    })
                  }
                />
              )}
            </div>
          );
        }}
      </ComposedQuery>
    );
  }
}

export default UrlAutocomplete;

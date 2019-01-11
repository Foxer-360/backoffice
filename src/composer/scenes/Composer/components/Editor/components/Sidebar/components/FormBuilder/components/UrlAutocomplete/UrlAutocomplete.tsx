import React from 'react';
import { AutoComplete, Input, Checkbox } from 'antd';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { canNotDefineSchemaWithinExtensionMessage } from 'graphql/validation/rules/LoneSchemaDefinition';

const GET_PAGES_URLS = gql`
  query pagesUrls($language: ID!) {
    pagesUrls(where: { language: $language }) {
      id
      page
      url
      name
    }
  }
`;

export interface IUrlAutocomplete {
  name: string;
  label: string;
  language: string;
  notitle?: boolean;
  value?: {
    url: string;
    urlNewWindow: boolean;
    pageId?: string;
  };
  placeholder?: string;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export interface IState {
  urlNewWindow: boolean;
}

class UrlAutocomplete extends React.Component<IUrlAutocomplete, IState> {
  constructor(props: IUrlAutocomplete) {
    super(props);

    this.state = {
      urlNewWindow: false,
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

  render() {
    const { onChange, value } = this.props;

    return (
      <Query query={GET_PAGES_URLS} variables={{ language: this.props.language }}>
        {({ data: { pagesUrls }, loading, error }) => {
          if (loading) {
            return 'Loading...';
          }

          if (error) {
            return `Error: ${error}`;
          }

          let pageUrlObj;
          if (value && value.url && value.pageId && pagesUrls) {
            pageUrlObj = pagesUrls.find(u => u.page === value.pageId);
          }

          return (
            <div style={{ paddingBottom: '5px' }}>
              {this.props.notitle && this.props.notitle === true ? null : <label>{this.props.label}</label>}
              {pagesUrls && pagesUrls.length > 0 && (
                <div>
                  <AutoComplete
                    dataSource={pagesUrls.map(source => source.url).filter(u => u !== '')}
                    filterOption={(inputValue, { props: { children } }: LooseObject) =>
                      children.toUpperCase().includes(inputValue.toUpperCase()) !== -1}
                    defaultValue={pageUrlObj && pageUrlObj ? pageUrlObj.url : value && value.url}
                    onSearch={newUrl => this.onChange({ url: newUrl }, pagesUrls)}
                    onSelect={newUrl => this.onChange({ url: newUrl }, pagesUrls)}
                  />

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
      </Query>
    );
  }
}

export default UrlAutocomplete;

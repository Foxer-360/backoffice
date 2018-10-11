import React, { Component } from 'react';
import { Select, AutoComplete, Input, Checkbox } from 'antd';
const Option = Select.Option;
const InputGroup = Input.Group;

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_PAGES_URLS = gql`
  query {
    pagesUrls(where: { language: "cjm69cpmg000m08728qa5oy02"}) {
      url
      name
    }
  }
`;

export interface IUrlAutocomplete {
  name: string;
  label: string;
  notitle?: boolean;
  value?: {
    url: string,
    urlNewWindow: boolean
  };
  placeholder?: string;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export interface IState {
  urlNewWindow: boolean;
}

class UrlAutocomplete extends React.Component<IUrlAutocomplete, IState> {

  render() {
    const { onChange, value: { url, urlNewWindow } } = this.props;

    return (
      <Query query={GET_PAGES_URLS}>
      {({ data: { pagesUrls }, loading, error}) => {

        if (loading) {
          return 'Loading...';
        }

        if (error) {
          return `Error: ${error}`;
        }
      return (<div style={{ paddingBottom: '5px' }}>
        {this.props.notitle && this.props.notitle === true ? null
          : <label>{this.props.label}</label>}
        {pagesUrls && pagesUrls > 0 && (
          <InputGroup compact={true}>
            <AutoComplete
              style={{ width: '66%' }}
              dataSource={pagesUrls.map(source => source.url).filter(u => u !== '')}
              filterOption={(inputValue, { props: { children }}: LooseObject) => children.toUpperCase().includes(inputValue.toUpperCase()) !== -1}
              defaultValue={url}
              onSearch={newUrl => onChange({ target: { name: this.props.name, value: { url: newUrl } } })}
              onSelect={newUrl => onChange({ target: { name: this.props.name, value: { url: newUrl } } })}
            />

            <Checkbox
              checked={urlNewWindow}
              onChange={() => {
                this.setState({ urlNewWindow: !this.state.urlNewWindow });
                onChange({ target: { name: this.props.name, value: { urlNewWindow: this.state.urlNewWindow } } });
                
              }}
            >
              Open in New window
            </Checkbox>
          </InputGroup>
        )}
        {pagesUrls &&
          pagesUrls.length === 0 &&
          <Input 
            type="text" 
            id="url" 
            value={url} 
            onChange={e => 
              onChange({ 
                target: { 
                  name: this.props.name,
                  value: { 
                    url: e.target.value 
                  } 
                } 
              })} 
          />}
      </div>); 
      }}</Query>);
  }
}

export default UrlAutocomplete;
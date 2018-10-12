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

  constructor(props: IUrlAutocomplete) {
    super(props);

    this.state = {
      urlNewWindow: false
    };
  }

  onChange = (newVal) => 
    this.props.onChange({ 
      target: { 
        name: this.props.name, 
        value: { ...(this.props.value || {}), ...newVal } 
      } 
    })
  render() {
    const { onChange, value } = this.props;

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
        {pagesUrls && pagesUrls.length > 0 && (
          <div>
            <AutoComplete
              dataSource={pagesUrls.map(source => source.url).filter(u => u !== '')}
              filterOption={(inputValue, { props: { children }}: LooseObject) => children.toUpperCase().includes(inputValue.toUpperCase()) !== -1}
              defaultValue={value && value.url}
              onSearch={newUrl => this.onChange({ url: newUrl })}
              onSelect={newUrl => this.onChange({ url: newUrl })}
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
        {pagesUrls &&
          pagesUrls.length === 0 &&
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
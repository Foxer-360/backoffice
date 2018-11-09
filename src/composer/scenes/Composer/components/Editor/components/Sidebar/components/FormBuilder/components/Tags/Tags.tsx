import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Select, Spin } from 'antd';

const Option = Select.Option;

const GET_FILTER_TAGS = gql`
  query {
    tags {
      id
      name
    }
  }
`;

interface Tag {
  id: string;
  name: string;
}

export interface TagsProps {
  language: string;
  label: string;
  name: string;
  value?: Array<Tag>;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export interface TagsState {}

class Tags extends React.Component<TagsProps, TagsState> {
  constructor(props: TagsProps) {
    super(props);
  }

  // tslint:disable-next-line:no-any
  createValue(tags: Array<Tag>, values: any) {
    let data = [];

    values.forEach(value => {
      let matchTag = tags.filter(tag => tag.name === value);
      data.push({ id: matchTag[0].id, name: value });
    });

    return data;
  }

  getValue() {
    let data = [];

    if (this.props.value) {
      this.props.value.forEach(value => {
        data.push(value.name);
      });
    }

    return data;
  }

  render() {
    const { language, label, onChange, name } = this.props;

    return (
      <div>
        <Query query={GET_FILTER_TAGS} variables={{ language }}>
          {({ data: { tags }, loading, error }) => {
            if (loading) {
              return <Spin />;
            }

            if (error) {
              return `Error: ${error}`;
            }

            if (tags && tags.length < 2) {
              return null;
            }

            return (
              <div style={{ paddingBottom: '5px' }}>
                <label>{label}</label>

                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Please select"
                  value={this.getValue()}
                  onChange={optionValue => {
                    onChange({
                      target: {
                        name: name,
                        value: this.createValue(tags, optionValue),
                      },
                    });
                  }}
                >
                  {tags &&
                    tags.map((tag, index) => (
                      <Option key={index} value={tag.name}>
                        {tag.name}
                      </Option>
                    ))}
                </Select>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default Tags;

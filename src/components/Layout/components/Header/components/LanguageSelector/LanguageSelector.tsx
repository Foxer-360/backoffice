import * as React from 'react';
import { Select } from 'antd';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from 'services/graphql';
import { adopt } from 'react-adopt';

const { Component } = React;
const { Option } = Select;

const ComposedQuery = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data }) => render(data.website)}
    </Query>
  ),
  language: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_LANGUAGE}>
      {({ data }) => render(data.language)}
    </Query>
  ),
  languages: ({ website, render }) => {
    if (!website || website === null) {
      return render([]);
    }

    return (
      <Query query={queries.WEBSITE_DETAIL} variables={{ id: website }}>
        {({ loading, data, error }) => {
          if (loading) {
            return render([]);
          }

          if (error) {
            return render([]);
          }

          return render(data.website.languages);
        }}
      </Query>
    );
  },
  selectLanguage: ({ render }) => (
    <Mutation mutation={mutations.LOCAL_SELECT_LANGUAGE}>
      {selectLanguage => render(selectLanguage)}
    </Mutation>
  ),
});

interface ComposedVars {
  language: string;
  languages: LooseObject[];
  selectLanguage: (options: LooseObject) => void;
}

class LanguageSelector extends Component<{}, {}> {

  render() {
    return (
      <ComposedQuery>
        {({ language, languages, selectLanguage }: ComposedVars) => {
          return (
            <Select
              style={{ width: '160px', marginRight: '12px' }}
              placeholder="Select language"
              onChange={(val: string) => {
                selectLanguage({ variables: { id: val } });
              }}
              notFoundContent="Loading..."
              defaultValue={language}
            >
              {languages.map((lang: LooseObject) => (
                <Option key={lang.id} value={lang.id}>{lang.name}</Option>
              ))}
            </Select>
          );
        }}
      </ComposedQuery>
    );
  }

}

export default LanguageSelector;

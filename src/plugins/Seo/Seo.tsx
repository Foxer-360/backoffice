import * as React from 'react';
import { adopt } from 'react-adopt';
import { Query } from 'react-apollo';
import { queries } from '@source/services/graphql';
import SeoForm from './components/SeoForm';

import './styles.css';

const PagePluginQuery = adopt({
  language: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_LANGUAGE}>
      {({ data: { language } }) => {
        return render(language);
      }}
    </Query>
  ),
  page: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_PAGE}>
      {({ data: { page }}) => {
        return render(page);
      }}
    </Query>
  ),
  plugin: ({ page, language, render }) => (
    <Query
      query={queries.PAGE_PLUGINS}
      variables={{ page, language, plugin: 'seo' }}
    >
      {({ loading, data: { pagePlugins }, error }) => {
        if (loading || error) {
          return render(loading);
        }

        let plugin: {} = null;

        pagePlugins.forEach((pagePlugin: LooseObject) => {
          if (plugin === null) {
            if (pagePlugin.language && pagePlugin.language.id === language && pagePlugin.content) {
              plugin = pagePlugin;
            }
          }
        });

        return render(plugin);
      }}
    </Query>
  )
});

interface SeoProps {
  currentPage: string;
  onChange: (data: LooseObject) => void;
  initData: LooseObject;
  loading: boolean;
}

interface SeoState {
  pages: LooseObject[];
}

export interface SeoPluginData {
  title: string;
  description: string;
  focusKeyword: string;
  url: string;
  // fb
  facebookTitle: string;
  facebookPublisher: string;
  facebookDescription: string;
  facebookImage: string;
  // twitter
  twitterTitle: string;
  twitterPublisher: string;
  twitterDescription: string;
  twitterImage: string;
  // google plus
  googlePlusTitle: string;
  googlePlusPublisher: string;
  googlePlusImage: string;
}

class Seo extends React.Component<SeoProps, SeoState> {

  constructor(props: SeoProps) {
    super(props);

    this.state = {
      pages: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    return (
      <PagePluginQuery>
        {(data: LooseObject) => {
          const pluginData = (data && data.plugin && data.plugin.content ? data.plugin.content : null);

          return (
            <SeoForm
              {...this.props}
              page={data.page}
              language={data.language}
              loading={this.props.loading}
              data={pluginData}
              pages={this.state.pages}
              onChangeData={this.handleChange}
              useSocialMetaForAll={true}
            />
          );
        }}
      </PagePluginQuery>
    );
  }

  handleChange(data: LooseObject) {
    if (this.props.onChange) {
      this.props.onChange(data);
    }
  }
}

export default Seo;

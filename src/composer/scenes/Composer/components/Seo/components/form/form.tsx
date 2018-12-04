import * as React from 'react';
import { Component } from 'react';

import { Alert, Card } from 'antd';
import { adopt } from 'react-adopt';
import { Mutation, Query } from 'react-apollo';

import { mutations, queries } from '@source/services/graphql';
import { SeoFormDataAndOperations, SeoFormQM, SeoFormState } from '../../interfaces';

import FormController from './formController';

const QueriesAndMutations = adopt({
  language: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_LANGUAGE}>
      {({ data: { language } }) => render(language)}
    </Query>
  ),
  page: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_PAGE}>
      {({ data: { page } }) => render(page)}
    </Query>
  ),
  seo: ({ render, page, language, plugin }) => (
    <Query query={queries.PAGE_PLUGINS} variables={{ page, language, plugin }}>
      {({ data, loading, error }) => render({ data, loading, error })}
    </Query>
  ),
  createSeo: ({ render, page, language, plugin }) => (
    <Mutation
      mutation={mutations.CREATE_PAGE_PLUGIN}
      variables={{ page, language, plugin }}
      update={(cache, { data }) => {
        const { pagePlugins } = cache.readQuery({ query: queries.PAGE_PLUGINS, variables: { page, language, plugin } });
        const index = pagePlugins.findIndex(p => p.id === data.createPagePlugin.id);
        if (index) { pagePlugins.splice(index, 1); }
        pagePlugins.push(data.createPagePlugin);
        cache.writeQuery({
          query: queries.PAGE_PLUGINS,
          data: { pagePlugins }
        });
      }}
      refetchQueries={[{
        query: queries.PAGE_PLUGINS,
        variables: { page, language, plugin }
      }]}
    >
      {(createSeo) => render((newVariables) => createSeo({ variables: { ...newVariables, page, language, plugin } }))}
    </Mutation>
  ),
  updateSeo: ({ render }) => (
    <Mutation mutation={mutations.UPDATE_PAGE_PLUGIN}>
      {(updateSeo) => render(updateSeo)}
    </Mutation>
  )
});

interface Properties {
  children: (data: SeoFormDataAndOperations) => JSX.Element;
}

class SeoForm extends Component<Properties> {

  readonly PLUGIN_NAME: string = 'seo';

  public getSeoFormState({ seo, updateSeo, createSeo }: SeoFormQM): SeoFormState {
    const seoData = seo.data.pagePlugins && seo.data.pagePlugins.find(a => a.plugin === this.PLUGIN_NAME);
    return {
      error: seo.error,
      loading: seo.loading,
      seo: seoData,
      updateSeo,
      createSeo
    };
  }

  public render() {
    return (
      <QueriesAndMutations plugin={this.PLUGIN_NAME}>
        {(seoData: SeoFormQM) => {
          const formatedSeoData = this.getSeoFormState(seoData);

          const { loading, error } = formatedSeoData;

          if (loading) { return <Card loading={loading} />; }

          if (error) {
            return (
              <div style={{ padding: 15 }}>
                <Alert
                  message={error.name}
                  description={error.message}
                  type="error"
                />
              </div>
            );
          }

          return (
            <FormController seoData={formatedSeoData}>
              {this.props.children}
            </FormController>
          );
        }}
      </QueriesAndMutations>
    );
  }

}

export default SeoForm;

/*

+-------------------------------------------------+
|          SEO plugin content interface           |
+-------------------------------------------------+

interface SeoContent {
  title: string; // <title><CONTENT></title>
  description: string; // <meta name="description" content="<CONTENT>">
  themeColor: string; // <meta name="theme-color" content="<CONTENT>">
  keywords: string; // <meta name="keywords" content="<CONTENT>">
  focusKeyword: string; // Main keyword that should be in title and keywords 
  defaultImage: string; // URL to default image -> used when there is not facebook/twitter image set
  facebook: {
    title: string; // <meta property="og:title" content="<CONTENT>">
    description: string; // <meta property="og:description" content="<CONTENT>">
    image: string; // <meta property="og:image" content="<CONTENT>">
  };
  twitter: {
    title: string; // <meta name="twitter:title" content="<CONTENT>">
    description: string; // <meta name="twitter:description" content="<CONTENT>">
    image: string; // <meta name="twitter:image" content="<CONTENT>">
  };
}

*/
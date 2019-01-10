import * as React from 'react';
import { adopt } from 'react-adopt';
import { Query, Mutation } from 'react-apollo';
import { queries, client } from '@source/services/graphql';
import gql from 'graphql-tag';

export interface ILooseObject { // tslint:disable-line:interface-name
  [key: string]: any; // tslint:disable-line:no-any
}

const InformationGatherer = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data: { website } }) => {
        return render(website);
      }}
    </Query>
  ),
  websiteData: ({ render, website }) => {
    if (!website) {
      return render({ loading: true });
    }
    return (
      <Query query={queries.WEBSITE_DETAIL} variables={{ id: website }}>
        {({ loading, error, data }) => {
          return render({
            loading,
            error,
            data: data && data.website || null,
          });
        }}
      </Query>);
  },
  project: ({ render, websiteData }) => {
    if (!websiteData.data) {
      return render(null);
    }

    return render(websiteData.data.project.id);
  },
  projectData: ({ render, project }) => {
    if (!project) {
      return render({ loading: true });
    }

    return (
    <Query query={queries.GET_PROJECT} variables={{ id: project }}>
      {({ loading, error, data }) => {
        return render({
          loading,
          error,
          data: data.project || null,
        });
      }}
    </Query>);
  },
  language: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_LANGUAGE}>
      {({ data: { language } }) => {
        return render(language);
      }}
    </Query>
  ),
  languageData: ({ render, language }) => (
    <Query query={queries.LANGUAGES}>
      {({ loading, error, data }) => {
        if (loading || error) {
          return render({
            loading,
            error,
            data: null,
          });
        }
        const found = data.languages && data.languages.find((lang: ILooseObject) => {
          if (lang.id === language) {
            return true;
          }

          return false;
        });

        if (!found) {
          return render({
            loading,
            error,
            data: null,
          });
        }

        return render({
          loading,
          error,
          data: { ...found },
        });
      }}
    </Query>
  ),
  page: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_PAGE}>
      {({ data: { page } }) => {
        return render(page);
      }}
    </Query>
  ),
  pageData: ({ render, page }) => {

    if (!page) {
      return render({ loading: true });
    }
    return (
    <Query query={queries.PAGE_DETAIL} variables={{ id: page }}>
      {({ loading, error, data }) => {
        return render({
          loading,
          error,
          data: data.page || null,
        });
      }}
    </Query>);
  },
  pageType: ({ render, pageData }) => {
    if (!pageData.data) {
      return render(null);
    }

    return render(pageData.data.type.id);
  },
  pageTypeData: ({ render, pageType, website }) => {

    if (!pageType || !website) {
      return render({ loading: true });
    }

    return (
    <Query query={queries.PAGE_TYPE_LIST} variables={{ website }}>
      {({ loading, error, data }) => {
        if (loading || error) {
          return render({
            loading,
            error,
            data: null,
          });
        }

        if (!data.pageTypes) {
          return render({
            loading,
            error,
            data: null,
          });
        }

        const found = data.pageTypes.find((type: ILooseObject) => {
          if (type.id === pageType) {
            return true;
          }

          return false;
        });

        return render({
          loading,
          error,
          data: found,
        });
      }}
    </Query>);
  },
  pageTranslationData: ({ render, pageData, language }) => {
    if (!pageData.data) {
      return render(null);
    }

    const found = pageData.data.translations.find((trans: ILooseObject) => {
      if (trans.language.id === language) {
        return true;
      }

      return false;
    });

    return render(found);
  },
  pageTranslation: ({ render, pageTranslationData }) => {
    if (!pageTranslationData) {
      return render(null);
    }

    return render(pageTranslationData.id);
  },
  navigationsData: ({ render, website }) => {
    if (!website) {
      return render({
        loading: true
      });
    }
    return (
      <Query
        query={gql`query($website: ID!) {
          navigations(where: { website: { id: $website }}) {
            id
            name
            nodes {
              id
              page
              title
              link
              order
              parent
              __typename
            }
            __typename
          }
        }`} 
        variables={{ website }}
      >
        {({ loading, error, data }) => {
          return render({
            loading,
            error,
            data: data.navigations || null,
          });
        }}
      </Query>);
  }
});

interface AsyncData {
  loading: boolean;
  error: any; // tslint:disable-line:no-any
  data: ILooseObject | null;
}

interface InformationGathererData {
  project: string;
  projectData: AsyncData;
  website: string;
  websiteData: AsyncData;
  language: string;
  languageData: AsyncData;
  page: string;
  pageData: AsyncData;
  navigationsData: AsyncData;
  pageType: string;
  pageTypeData: AsyncData;
  pageTranslation: string;
  pageTranslationData: ILooseObject;
}

const validator = (data: InformationGathererData) => {
  const errors = [];
  let loading = false;
  let someNull = false;

  if (data.projectData.loading) {
    loading = true;
  }
  if (data.websiteData.loading) {
    loading = true;
  }
  if (data.pageData.loading) {
    loading = true;
  }
  if (data.navigationsData.loading) {
    loading = true;
  }
  if (data.pageTypeData.loading) {
    loading = true;
  }

  if (data.projectData.error) {
    errors.push(data.projectData.error);
  }
  if (data.websiteData.error) {
    errors.push(data.websiteData.error);
  }
  if (data.pageData.error) {
    errors.push(data.pageData.error);
  }
  if (data.navigationsData.error) {
    errors.push(data.navigationsData.error);
  }
  if (data.pageTypeData.error) {
    errors.push(data.pageTypeData.error);
  }

  if (data.project === null) {
    someNull = true;
  }
  if (data.website === null) {
    someNull = true;
  }
  if (data.language === null) {
    someNull = true;
  }
  if (data.page === null) {
    someNull = true;
  }
  if (data.pageType === null) {
    someNull = true;
  }
  if (data.pageTranslation === null) {
    someNull = true;
  }
  if (data.pageTranslationData === null) {
    someNull = true;
  }

  if (data.projectData.data === null) {
    someNull = true;
  }
  if (data.websiteData.data === null) {
    someNull = true;
  }
  if (data.languageData.data === null) {
    someNull = true;
  }
  if (data.pageData.data === null) {
    someNull = true;
  }
  if (data.navigationsData.data === null) {
    someNull = true;
  }
  if (data.pageTypeData.data === null) {
    someNull = true;
  }

  if (someNull !== true) {
    const {
      pageData: {
        data: pageData
      },
      websiteData: {
        data: websiteData
      },
      languageData: {
        data: languageData
      },
      navigationsData: {
        data: navigationsData
      }
    } = data;

    const query = gql`
      query {
        languageData,
        languagesData,
        pageData,
        websiteData,
        navigationsData
      }
    `;
    client.writeQuery({
      query,
      data: {
        languageData,
        languagesData: websiteData.languages,
        pageData,
        websiteData,
        navigationsData,
      },
    });
  } 
  return {
    errors,
    loading,
    someNull,
  };
};

const editorWrapper = () => (Editor: typeof React.Component) => {

  class WrappedEditor extends React.Component<{}, {}> {

    public render() {
      return (
        <InformationGatherer>
          {(data: InformationGathererData) => {
            const validation = validator(data);
            if (validation.loading || validation.errors.length > 0 || validation.someNull) {
              return null;
            }
            const EditorProperties = {
              projectId: data.project,
              project: data.projectData.data,
              websiteId: data.website,
              website: data.websiteData.data,
              languageId: data.language,
              language: data.languageData.data,
              pageId: data.page,
              pageTypeId: data.pageType,
              pageType: data.pageTypeData.data,
              pageTranslationId: data.pageTranslation,
              pageTranslation: data.pageTranslationData,
            };
            return <Editor {...EditorProperties} />;
          }}
        </InformationGatherer>
      );
    }

  }

  return WrappedEditor;

};

export default editorWrapper;

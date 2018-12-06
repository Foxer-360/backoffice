import * as React from 'react';
import { adopt } from 'react-adopt';
import { Query, Mutation } from 'react-apollo';
import { queries } from '@source/services/graphql';

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
  websiteData: ({ render, website }) => (
    <Query query={queries.WEBSITE_DETAIL} variables={{ id: website }}>
      {({ loading, error, data }) => {
        return render({
          loading,
          error,
          data: data.website || null,
        });
      }}
    </Query>
  ),
  project: ({ render, websiteData }) => {
    if (!websiteData.data) {
      return render(null);
    }

    return render(websiteData.data.project.id);
  },
  projectData: ({ render, project }) => (
    <Query query={queries.GET_PROJECT} variables={{ id: project }}>
      {({ loading, error, data }) => {
        return render({
          loading,
          error,
          data: data.project || null,
        });
      }}
    </Query>
  ),
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
        console.log(data);
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
  pageData: ({ render, page }) => (
    <Query query={queries.PAGE_DETAIL} variables={{ id: page }}>
      {({ loading, error, data }) => {
        console.log(page);
        return render({
          loading,
          error,
          data: data.page || null,
        });
      }}
    </Query>
  ),
  pageType: ({ render, pageData }) => {
    if (!pageData.data) {
      return render(null);
    }

    return render(pageData.data.type.id);
  },
  pageTypeData: ({ render, pageType, website }) => (
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
    </Query>
  ),
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
  pageType: string;
  pageTypeData: AsyncData;
  pageTranslation: string;
  pageTranslationData: ILooseObject;
}

const validator = (data: InformationGathererData) => {
  const errors = [];
  let loading = false;
  let someNull = false;

  console.log(data);
  
  if (data.projectData.loading) {
    loading = true;
  }
  if (data.websiteData.loading) {
    loading = true;
  }
  if (data.pageData.loading) {
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
  if (data.pageTypeData.data === null) {
    someNull = true;
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
              console.log('someNull');
              return null;
            }
            console.log('inside gatherer.');
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

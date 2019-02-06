import * as React from 'react';
import { adopt } from 'react-adopt';
import { Query, Mutation } from 'react-apollo';
import { queries, client } from '@source/services/graphql';
import gql from 'graphql-tag';

import AnnotationForm from './components/AnnotationForm';
import { ChangesOnSave } from './components/AnnotationForm/AnnotationForm';

const { Component } = React;

const QUERY_ANNOTATIONS = gql`
  query getPageAnnotations($translation: ID!) {
    pageAnnotations(
      where: {
        pageTranslation: {
          id: $translation
        }
      }
    ) {
      id
      key
      value
    }
  }
`;

const CREATE_ANNOTATION = gql`
  mutation createAnnotation(
    $translation: ID!
    $key: String!
    $value: String!
  ) {
    createPageAnnotation(
      data: {
        pageTranslation: {
          connect: { id: $translation }
        }
        key: $key
        value: $value
      }
    ) {
      id
      key
      value
    }
  }
`;

const UPDATE_ANNOTATION = gql`
  mutation updateAnnotation(
    $id: ID!
    $value: String!
  ) {
    updatePageAnnotation(
      where: {
        id: $id
      }
      data: {
        value: $value
      }
    ) {
      id
      key
      value
    }
  }
`;

const DELETE_ANNOTATION = gql`
  mutation deleteAnnotation(
    $id: ID!
  ) {
    deletePageAnnotation(
      where: {
        id: $id
      }
    ) {
      id
      key
      value
    }
  }
`;

const AnnotationData = adopt({
  language: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_LANGUAGE}>
      {({ data: { language } }) => {
        return render(language);
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
          data: (data && data.page) || null,
        });
      }}
    </Query>);
  },
  pageTranslationData: ({ render, pageData, language }) => {
    if (!pageData.data) {
      return render(null);
    }

    const found = pageData.data.translations.find((trans: LooseObject) => {
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
  pageAnnotations: ({ render, pageTranslation}) => {
    if (!pageTranslation || pageTranslation === '') {
      return render(null);
    }

    return (
      <Query query={QUERY_ANNOTATIONS} variables={{ translation: pageTranslation }}>
        {({ loading, error, data }) => {
          return render({
            loading,
            error,
            data: data || null
          });
        }}
      </Query>
    );
  },
  addAnnotation: ({ render, pageTranslation }) => {
    return (
      <Mutation
        mutation={CREATE_ANNOTATION}
        update={(cache, { data: { createPageAnnotation } }) => {
          const { pageAnnotations } = cache.readQuery({ query: QUERY_ANNOTATIONS, variables: { translation: pageTranslation } });
          cache.writeQuery({
            query: QUERY_ANNOTATIONS,
            variables: { translation: pageTranslation },
            data: {
              pageAnnotations: pageAnnotations.concat(createPageAnnotation),
            }
          });
        }}
      >
        {createAnnotation => {
          const fce = (key: string, value: string) => {
            return createAnnotation({
              variables: {
                key,
                value,
                translation: pageTranslation
              }
            });
          };
          return render(fce);
        }}
      </Mutation>
    );
  },
  updateAnnotation: ({ render, pageTranslation }) => {
    return (
      <Mutation
        mutation={UPDATE_ANNOTATION}
        update={(cache, { data: { updatePageAnnotation } }) => {
          const { pageAnnotations } = cache.readQuery({ query: QUERY_ANNOTATIONS, variables: { translation: pageTranslation } });
          cache.writeQuery({
            query: QUERY_ANNOTATIONS,
            variables: { translation: pageTranslation },
            data: {
              pageAnnotations: pageAnnotations.map((ann) => {
                if (ann.id === updatePageAnnotation.id) {
                  return updatePageAnnotation;
                }

                return ann;
              })
            }
          });
        }}
      >
        {updateAnnotation => {
          const fce = (id: string, value: string) => {
            return updateAnnotation({
              variables: {
                id,
                value
              }
            });
          };

          return render(fce);
        }}
      </Mutation>
    );
  },
  deleteAnnotation: ({ render, pageTranslation }) => {
    return (
      <Mutation
        mutation={DELETE_ANNOTATION}
        update={(cache, { data: { deletePageAnnotation } }) => {
          const { pageAnnotations } = cache.readQuery({ query: QUERY_ANNOTATIONS, variables: { translation: pageTranslation } });
          cache.writeQuery({
            query: QUERY_ANNOTATIONS,
            variables: { translation: pageTranslation },
            data: {
              pageAnnotations: pageAnnotations.filter((ann) => ann.id !== deletePageAnnotation.id)
            }
          });
        }}
      >
        {deleteAnnotation => {
          const fce = (id: string) => {
            return deleteAnnotation({
              variables: { id }
            });
          };

          return render(fce);
        }}
      </Mutation>
    );
  }
});

interface AsyncData {
  loading: boolean;
  error: any; // tslint:disable-line:no-any
  data: LooseObject | null;
}

type AddFce = (key: string, value: string) => void;
type UpdateFce = (id: string, value: string) => void;
type DeleteFce = (id: string) => void;

interface AnnotationData {
  language: string;
  page: string;
  pageData: AsyncData;
  pageTranslation: string;
  pageTranslationData: LooseObject;
  pageAnnotations: AsyncData;
  addAnnotation: AddFce;
  updateAnnotation: UpdateFce;
  deleteAnnotation: DeleteFce;
}

const processUpdate = (add: AddFce, update: UpdateFce, del: DeleteFce) => (changes: ChangesOnSave) => {
  // #1 Add annotations
  changes.add.forEach((rec) => {
    add(rec.key, rec.value);
  });

  // #2 Update annotations
  changes.update.forEach((rec) => {
    update(rec.id, rec.value);
  });

  // #3 Remove annotations
  changes.remove.forEach((rec) => {
    del(rec.id);
  });
};

class Annotation extends Component<{}, {}> {

  render() {
    return (
      <div>
        <AnnotationData>
          {(data: AnnotationData) => {
            if (data.pageAnnotations.loading) {
              return (<span>Loading...</span>);
            }

            if (data.pageAnnotations.error) {
              return (<span>Error while loading data from server</span>);
            }

            if (!data.pageAnnotations.data || !data.pageAnnotations.data.pageAnnotations) {
              return (<span>Error while loading data from server</span>);
            }

            const annotations = data.pageAnnotations.data.pageAnnotations;

            return (
              <AnnotationForm
                records={annotations}
                onSave={processUpdate(data.addAnnotation, data.updateAnnotation, data.deleteAnnotation)}
              />
            );
          }}
        </AnnotationData>
      </div>
    );
  }

}

export default Annotation;

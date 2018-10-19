import * as React from 'react';
import { Button, Popconfirm } from 'antd';
import { Mutation, Query } from 'react-apollo';
import { mutations, queries } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import history from '@source/services/history';

export interface Properties {
  id: string;
  url: string;

  handleAddPage: (id: string) => void;
  handleEditPage: (id: string) => void;
}

const RemovePageMutation = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data }) => {
        return render(data.website);
      }}
    </Query>
  ),
  removePage: ({ website, render }) => (
    <Mutation
      mutation={mutations.REMOVE_PAGE}
      update={(cache, { data: { deletePage } }) => {
        const { pages } = cache.readQuery({ query: queries.PAGE_LIST, variables: { website } });
        const filtered = pages.filter((p: LooseObject) => {
          if (p.id === deletePage.id) {
            return false;
          }

          return true;
        });

        cache.writeQuery({
          query: queries.PAGE_LIST,
          variables: { website },
          data: { pages: filtered }
        });
      }}
    >
      {removePage => {
        const fce = (id: string) => {
          removePage({ variables: { id } });
        };
        return render(fce);
      }}
    </Mutation>
  )
});

/**
 * Assume that in env.REACT_APP_FRONTEND_URL is specified server
 *
 * @param  {string} url relative
 * @return {string} url abosulute
 */
const getFrontendUrl = (url: string) => {

  const server = process.env.REACT_APP_FRONTEND_URL;
  if (url[0] !== '/') {
    url = `/${url}`;
  }

  if (!server || server === undefined || server === null || server.length < 2) {
    return url;
  }

  return `${server}${url}`;
}; 

const Actions = (props: Properties) => (
  <>
    <Button size="small" icon="plus-circle-o" onClick={() => props.handleAddPage(props.id)} />
    <Button size="small" icon="edit" style={{ marginLeft: 6 }} onClick={() => history.push('/page?page=' + props.id)} />
    <RemovePageMutation>
      {({ removePage }: { removePage: (id: string) => void }) => (
        <Popconfirm title="Are you sure, you want to remove this page ?" onConfirm={() => removePage(props.id)}>
          <Button size="small" ghost={true} icon="delete" style={{ marginLeft: 6 }} type="danger" />
        </Popconfirm>
      )}
    </RemovePageMutation>
    <a href={getFrontendUrl(props.url)} target="_blank">
      <Button size="small" icon="eye" style={{ marginLeft: 6 }} />
    </a>
  </>
);

export default Actions;

import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from '@source/services/graphql';

const { Component } = React;

class Test extends Component<{}, {}> {

  render() {
    return (
      <>
        <h2>Welcome in Testing zone</h2>
        <Query query={queries.LANGUAGES_FOR_PROJECT} variables={{ id: 'cjk89thvo000o0a34axlg570m' }}>
          {({ loading, data }) => {
            if (loading) {
              return <span>Loading...</span>;
            }

            // tslint:disable-next-line:no-console
            console.log('QUERY', data);

            return (
              <>
                {data.project.languages.map((lang: {name: string, code: string}) => (
                  <p>Name: <b>{lang.name}</b>, Code: <b>{lang.code}</b></p>
                ))}
              </>
            );
          }}
        </Query>
        <br />
        <Query query={queries.LOCAL_SELECTED_PROJECT}>
          {({ loading, data }) => {
            if (loading) {
              return <span>Loading...</span>;
            }

            return <span>Selected project: <b>{data.selectedProject}</b></span>;
          }}
        </Query>
        <Mutation mutation={mutations.LOCAL_SELECT_PROJECT} variables={{ id: 'Hovno' }}>
          {setProject => (<button style={{ marginLeft: '18px' }} onClick={() => setProject()}>Set Project</button>)}
        </Mutation>
      </>
    );
  }

}

export default Test;

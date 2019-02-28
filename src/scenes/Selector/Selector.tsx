import * as React from 'react';
import { Alert, Button, Carousel, Divider, Layout, Spin, List, Icon } from 'antd';
import { Mutation, Query, ApolloConsumer } from 'react-apollo';
import InfiniteScroll from 'react-infinite-scroller';

import LogoutButton from './components/LogoutButton';
import ProjectForm from './components/ProjectForm';
import ScrollList from './components/ScrollList';
import WebsiteForm from './components/WebsiteForm';
import { queries, mutations } from '@source/services/graphql';
import './selector.css';
import history from '@source/services/history';

const { Component } = React;
const { Content } = Layout;

interface Properties {
}

interface State {
  projectToEdit: string | null;
  websiteToEdit: string | null;
  selectedProject: string | null;
  selectedWebsite: string | null;
}

class Selector extends Component<Properties, State> {

  // tslint:disable-next-line:no-any
  private carousel: any;

  // constants for Carousel pages (slides)
  private PROJECT_FORM_PAGE = 0;
  private PROJECT_SELECT_PAGE = 1;
  private WEBSITE_FORM_PAGE = 3;
  private WEBSITE_SELECT_PAGE = 2;

  constructor(props: Properties) {
    super(props);

    this.state = {
      projectToEdit: null,
      websiteToEdit: null,
      selectedProject: null,
      selectedWebsite: null
    };

    // Bind methods for project
    this.handleSelectProject = this.handleSelectProject.bind(this);
    this.handleCreateProject = this.handleCreateProject.bind(this);
    this.handleEditProject = this.handleEditProject.bind(this);
    this.onProjectCancel = this.onProjectCancel.bind(this);
    this.onProjectSave = this.onProjectSave.bind(this);

    // Bind methods for website
    this.handleSelectWebsite = this.handleSelectWebsite.bind(this);
    this.handleCreateWebsite = this.handleCreateWebsite.bind(this);
    this.handleEditWebsite = this.handleEditWebsite.bind(this);
    this.onWebsiteCancel = this.onWebsiteCancel.bind(this);
    this.onWebsiteSave = this.onWebsiteSave.bind(this);

    // Bind others
    this.goBackToProjectSelect = this.goBackToProjectSelect.bind(this);
  }

  render() {
    return (
      <Layout className="layout">
        <Content className="content-wrap">
          <div className="content">
            <Carousel
              accessibility={false}
              dots={false}
              ref={node => this.carousel = node}
              initialSlide={this.PROJECT_SELECT_PAGE}
            >
              {/* PROJECT FORM */}
              <div>
                <div className="carousel-box">
                  {this.state.projectToEdit ?
                    <Query query={queries.GET_PROJECT} variables={{ id: this.state.projectToEdit }}>
                      {({ loading, data, error}) => {
                        if (loading) {
                          return <Spin size="large" />;
                        }

                        if (error) {
                          return (
                            <>
                              <Alert
                                message="Network Error"
                                description="Loading details of this project failed. Please try it again."
                                type="error"
                              />
                              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Button onClick={this.onProjectCancel}>Back</Button>
                                <LogoutButton style={{ marginLeft: '12px' }} />
                              </div>
                            </>
                          );
                        }

                        return (
                          <Mutation
                            mutation={mutations.UPDATE_PROJECT}
                            update={(cache, { data: { updateProject } }) => {
                              let { projects } = cache.readQuery({ query: queries.GET_PROJECTS });
                              projects = projects.map((project: LooseObject) => {
                                if (project.id === updateProject.id) {
                                  return updateProject;
                                }

                                return project;
                              });
                              cache.writeQuery({
                                query: queries.GET_PROJECTS,
                                data: { projects }
                              });
                            }}
                          >
                            {updateProject => (
                              <ProjectForm
                                data={data.project}
                                onCancel={this.onProjectCancel}
                                onSave={(newData: LooseObject) => {
                                  updateProject({ variables: { id: this.state.projectToEdit, ...newData } });
                                  this.onProjectSave();
                                }}
                              />
                            )}
                          </Mutation>
                        );
                      }}
                    </Query>
                  :
                    <Mutation
                      mutation={mutations.CREATE_PROJECT}
                      update={(cache, { data: { createProject } }) => {
                        const { projects } = cache.readQuery({ query: queries.GET_PROJECTS });
                        cache.writeQuery({
                          query: queries.GET_PROJECTS,
                          data: { projects: projects.concat([createProject]) }
                        });
                      }}
                    >
                      {createProject => (
                        <ProjectForm
                          onCancel={this.onProjectCancel}
                          onSave={(newData: LooseObject) => {
                            createProject({ variables: newData });
                            this.onProjectSave();
                          }}
                        />
                      )}
                    </Mutation>
                  }
                </div>
              </div>

              {/* PROJECT SELECT */}
              <div>
                <div className="carousel-box">
                  <div style={{ textAlign: 'center' }}>
                    <h1>Select Project</h1>
                  </div>
                  <Query query={queries.GET_PROJECTS}>
                    {({ loading, data, error }) => {
                      if (loading) {
                        return (
                          <ScrollList
                            loading={true}
                          />
                        );
                      }

                      if (error) {
                        return (
                          <Alert
                            message="Network Error"
                            description="Loading projects failed. Please try it again."
                            type="error"
                          />
                        );
                      }

                      return (
                        <Mutation
                          mutation={mutations.REMOVE_PROJECT}
                          update={(cache, { data: { deleteProject } }) => {
                            let { projects } = cache.readQuery({ query: queries.GET_PROJECTS });
                            projects = projects.filter((project: LooseObject) => {
                              if (project.id === deleteProject.id) {
                                return false;
                              }

                              return true;
                            });

                            cache.writeQuery({
                              query: queries.GET_PROJECTS,
                              data: { projects }
                            });
                          }}
                        >
                          {removeProject => (
                            <ScrollList
                              emptyText="No projects..."
                              data={data.projects}
                              onSelect={this.handleSelectProject}
                              type="book"
                              onEdit={this.handleEditProject}
                              onRemove={(id: string) => {
                                removeProject({ variables: { id }});
                              }}
                            />
                          )}
                        </Mutation>
                      );
                    }}
                  </Query>
                  <Divider style={{ padding: '0px 20px' }} dashed={false}>Or</Divider>
                  <div style={{ textAlign: 'center' }}>
                    <Button type="primary" onClick={this.handleCreateProject}>Create new Project</Button>
                    <LogoutButton style={{ marginLeft: '12px' }} />
                  </div>
                </div>
              </div>

              {/* WEBSITE SELECT */}
              <div>
                <div className="carousel-box">
                  <div style={{ textAlign: 'center' }}>
                    <h1>Select Website</h1>
                  </div>
                  {this.state.selectedProject ?
                    <Query query={queries.GET_PROJECT} variables={{ id: this.state.selectedProject }}>
                      {({ loading, data, error }) => {
                        if (loading) {
                          return (
                            <ScrollList
                              loading={true}
                            />
                          );
                        }

                        if (error) {
                          return (
                            <Alert
                              message="Network Error"
                              description="Loading websites failed. Please try it again."
                              type="error"
                            />
                          );
                        }

                        return (
                          <Mutation
                            mutation={mutations.REMOVE_WEBSITE}
                            update={(cache, { data: { deleteWebsite } }) => {
                              const { project } = cache.readQuery({
                                query: queries.GET_PROJECT,
                                variables: { id: this.state.selectedProject }
                              });

                              project.websites = project.websites.filter((web: LooseObject) => {
                                if (web.id === deleteWebsite.id) {
                                  return false;
                                }

                                return true;
                              });

                              cache.writeQuery({
                                query: queries.GET_PROJECT,
                                variables: { id: this.state.selectedProject },
                                data: { project }
                              });
                            }}
                          >
                            {removeWebsite => (
                              <Mutation
                                mutation={mutations.LOCAL_SELECT_PROJECT_WEBSITE}
                              >
                                {setProjectWebsite => (
                                  <ScrollList
                                    emptyText="No websites..."
                                    data={data.project.websites}
                                    onSelect={(id: string) => {
                                      setProjectWebsite({
                                        variables: {
                                          project: this.state.selectedProject,
                                          website: id
                                        }
                                      });
                                      const web = data.project.websites.find((w: LooseObject) => {
                                        if (w.id === id) {
                                          return true;
                                        }
                                        return false;
                                      });
                                      // tslint:disable-next-line:no-console
                                      this.handleSelectWebsite(id, web.defaultLanguage.id);
                                    }}
                                    type="profile"
                                    onEdit={this.handleEditWebsite}
                                    onRemove={(id: string) => {
                                      removeWebsite({ variables: { id }});
                                    }}
                                  />
                                )}
                              </Mutation>
                            )}
                          </Mutation>
                        );
                      }}
                    </Query>
                  :
                    <Alert
                      message="Select Project"
                      description="Please select project first to show websites for this project."
                      type="info"
                    />
                  }
                  <Divider style={{ padding: '0px 20px' }} dashed={false}>Or</Divider>
                  <div style={{ textAlign: 'center' }}>
                    <Button style={{ marginRight: '12px' }} onClick={this.goBackToProjectSelect}>Back</Button>
                    <Button type="primary" onClick={this.handleCreateWebsite}>Create new Website</Button>
                    <LogoutButton style={{ marginLeft: '12px' }} />
                  </div>
                </div>
              </div>

              {/* WEBSITE FORM */}
              <div>
                <div className="carousel-box">
                  {this.state.websiteToEdit ?
                    <Query query={queries.WEBSITE_DETAIL} variables={{ id: this.state.websiteToEdit }}>
                      {({ loading, data, error }) => {
                        if (loading) {
                          return <Spin size="large" />;
                        }

                        if (error) {
                          return (
                            <>
                              <Alert
                                message="Network Error"
                                description="Loading details of this website failed. Please try it again."
                                type="error"
                              />
                              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Button onClick={this.onWebsiteCancel}>Back</Button>
                                <LogoutButton style={{ marginLeft: '12px' }} />
                              </div>
                            </>
                          );
                        }

                        return (
                          <Mutation
                            mutation={mutations.UPDATE_WEBSITE}
                            update={(cache, { data: { updateWebsite } }) => {
                              const { project } = cache.readQuery({
                                query: queries.GET_PROJECT, variables: { id: this.state.selectedProject } });
                              project.websites = project.websites.map((web: LooseObject) => {
                                if (web.id === updateWebsite.id) {
                                  return updateWebsite;
                                }

                                return web;
                              });

                              cache.writeQuery({
                                query: queries.GET_PROJECT,
                                variables: { id: this.state.selectedProject },
                                data: { project }
                              });
                            }}
                          >
                            {updateWebsite => {
                              return (
                                <WebsiteForm
                                  data={data.website}
                                  projectId={this.state.selectedProject}
                                  onCancel={this.onWebsiteCancel}
                                  onSave={(newData: LooseObject) => {
                                    updateWebsite({ variables: { id: this.state.websiteToEdit, ...newData } });
                                    this.onWebsiteSave(newData);
                                  }}
                                />
                              );
                            }}
                          </Mutation>
                        );
                      }}
                    </Query>
                  :
                    <Mutation
                      mutation={mutations.CREATE_WEBSITE}
                      update={(cache, { data: { createWebsite }}) => {
                        const { project } = cache.readQuery({
                          query: queries.GET_PROJECT, variables: { id: this.state.selectedProject } });
                        project.websites.push(createWebsite);

                        cache.writeQuery({
                          query: queries.GET_PROJECT,
                          variables: { id: this.state.selectedProject },
                          data: { project }
                        });
                      }}
                    >
                      {createWebsite => (
                        <WebsiteForm
                          projectId={this.state.selectedProject}
                          onCancel={this.onWebsiteCancel}
                          onSave={(newData: LooseObject) => {
                            createWebsite({ variables: newData });
                            this.onWebsiteSave(newData);
                          }}
                        />
                      )}
                    </Mutation>
                  }
                </div>
              </div>
            </Carousel>
          </div>
        </Content>
      </Layout>
    );
  }

  private handleCreateProject() {
    this.carousel.goTo(this.PROJECT_FORM_PAGE);

    // Reset project to edit
    this.setState({
      projectToEdit: null
    });
  }

  private onProjectCancel() {
    this.carousel.goTo(this.PROJECT_SELECT_PAGE);

    // Reset project to edit
    this.setState({
      projectToEdit: null
    });
  }

  private onProjectSave() {
    this.carousel.goTo(this.PROJECT_SELECT_PAGE);

    // Reset project to edit
    this.setState({
      projectToEdit: null
    });
  }

  private handleEditProject(id: string) {
    this.carousel.goTo(this.PROJECT_FORM_PAGE);

    // Set project ID
    // tslint:disable-next-line:no-console
    console.log(id);
    this.setState({
      projectToEdit: id
    });
  }

  private handleSelectProject(id: string) {
    this.carousel.goTo(this.WEBSITE_SELECT_PAGE);

    // Save selected project
    this.setState({
      selectedProject: id
    });
  }

  private goBackToProjectSelect() {
    this.carousel.goTo(this.PROJECT_SELECT_PAGE);
  }

  private handleSelectWebsite(id: string, lang: string) {
    // Go to home
    history.push(`/?website=${id}&language=${lang}`);

    // Save selected website
    this.setState({
      selectedWebsite: id
    });
  }

  private handleCreateWebsite() {
    this.carousel.goTo(this.WEBSITE_FORM_PAGE);

    // Just reset website ID
    this.setState({
      websiteToEdit: null
    });
  }

  private handleEditWebsite(id: string) {
    this.carousel.goTo(this.WEBSITE_FORM_PAGE);

    // Set website ID
    this.setState({
      websiteToEdit: id
    });
  }

  private onWebsiteSave(data: LooseObject) {
    this.carousel.goTo(this.WEBSITE_SELECT_PAGE);

    // Deselect website ID
    this.setState({
      websiteToEdit: null
    });
  }

  private onWebsiteCancel() {
    this.carousel.goTo(this.WEBSITE_SELECT_PAGE);

    // Deselect website ID
    this.setState({
      websiteToEdit: null
    });
  }

}

export default Selector;

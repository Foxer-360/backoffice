import * as React from 'react';
import { Alert, Col, Form, Input, Modal, Row, Select } from 'antd';
import { urlize } from 'urlize';
import './style.css';
import { adopt } from 'react-adopt';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from '@source/services/graphql';

const { Component } = React;
const FormItem = Form.Item;

const PageTypes = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data }) => {
        return render(data.website);
      }}
    </Query>
  ),
  pageTypes: ({ render, website }) => (
    <Query query={queries.PAGE_TYPE_LIST} variables={{ website }}>
      {({ loading, data, error }) => {
        if (loading || error) {
          return render([]);
        }

        return render(data.pageTypes);
      }}
    </Query>
  ),
});

const CreateMutation = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data }) => {
        return render(data.website);
      }}
    </Query>
  ),
  createPage: ({ render, website }) => (
    <Mutation
      mutation={mutations.CREATE_PAGE}
      variables={{ website: { connect: { id: website } } }}
      update={(cache, { data: { createPage } }) => {
        const { pages } = cache.readQuery({ query: queries.PAGE_LIST, variables: { website } });
        cache.writeQuery({
          query: queries.PAGE_LIST,
          variables: { website },
          data: { pages: pages.concat([createPage]) }
        });
      }}
    >
      {createPage => {
        return render(createPage);
      }}
    </Mutation>
  ),
});

export interface Properties {
  visible: boolean;
  parentId: string | null;

  onOk?: () => void;
  onCancel?: () => void;
}

export interface State {
  typeId: string;
  name: string;
  url: string;
  status: string;

  urlChanged: boolean;
  alert: string;

  nameErr: boolean;
  typeErr: boolean;
}

class CreatePageModal extends Component<Properties, State> {

  private readonly INITIAL_STATE: State = {
    typeId: null,
    name: '',
    url: '',
    status: 'DRAFT',

    urlChanged: false,
    alert: 'alert-enter',

    nameErr: false,
    typeErr: false
  };

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.INITIAL_STATE
    };

    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChangeType = this.handleChangeType.bind(this);
    this.handleChangeStatus = this.handleChangeStatus.bind(this);
  }

  handleOk(website: string, createPage: (...args: LooseObject[]) => void) {

    const { name, typeId } = this.state;

    if (!name || !typeId) {
      this.setState({
        ...this.state,
        nameErr: !name ? true : false,
        typeErr: !typeId ? true : false,
      });
      return;
    } 
    // Prepare data
    const variables = {
      website: {
        connect: { id: website }
      },
      parent: null as LooseObject,
      name: this.state.name,
      status: this.state.status,
      url: this.state.url,
      content: [] as LooseObject[],
      type: {
        connect: { id: this.state.typeId }
      }
    };

    if (this.props.parentId) {
      variables.parent = {
        connect: { id: this.props.parentId }
      };
    }

    createPage({ variables });

    if (this.props.onOk) {
      this.props.onOk();
    }

    this.setState({
      ...this.INITIAL_STATE,
    });
  }

  handleCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }

    this.setState({
      ...this.INITIAL_STATE,
    });
  }

  handleChangeName(name: string) {
    let url = this.state.url;
    if (!this.state.urlChanged) {
      url = urlize(name);
    }

    this.setState({
      ...this.state,
      name,
      url
    });
  }

  handleChangeUrl(url: string) {
    if (url === '') {
      this.setState({
        ...this.state,
        url: '',
        urlChanged: false
      });

      return;
    }

    const urlSanitized = urlize(url);
    this.setState({
      ...this.state,
      url: urlSanitized,
      urlChanged: true
    });
  }

  handleChangeType(value: string) {
    this.setState({
      typeId: value
    });
  }

  handleChangeStatus(value: string) {
    this.setState({
      status: value
    });
  }

  handleUrlBlur() {
    if (this.state.url === '' && this.state.name.length > 0) {
      // Use name as url
      const url = urlize(this.state.name);
      this.setState({
        ...this.state,
        url,
        alert: 'alert-enter alert-enter-active'
      });

      // Animate alert
      setTimeout((() => {
        this.setState({
          ...this.state,
          alert: 'alert-leave alert-leave-active'
        });
      }).bind(this), 1300);
    }
  }

  render() {
    const labelSize = 4;
    const labelStyle = { padding: '5px 12px 0px 0px' };
    const rowMargin = { marginBottom: '16px' };

    return (
      <CreateMutation>
        {({ website, createPage }: { website: string, createPage: (...args: LooseObject[]) => void}) => (
          <Modal
            title="Create new page"
            onOk={() => this.handleOk(website, createPage)}
            onCancel={this.handleCancel}
            visible={this.props.visible}
          >
            <Row style={rowMargin}>
              <Col span={labelSize} style={{ textAlign: 'right' }}>
                <div style={labelStyle}>
                  <span>Type:</span>
                </div>
              </Col>
              <Col span={24 - labelSize}>
                <PageTypes>
                  {({ pageTypes }: { pageTypes: LooseObject[] }) => (
                    <FormItem 
                      {...(
                        (this.state.typeErr && {
                          validateStatus: 'error',
                          help: 'Page type must be selected.'
                        }) || {}
                      )}
                    >
                      <Select
                        style={{ width: 'auto', minWidth: '200px' }}
                        onChange={this.handleChangeType}
                        value={this.state.typeId ? this.state.typeId : undefined}
                        placeholder="Select page type"
                      >
                        {pageTypes.map((type: LooseObject) => (
                          <Select.Option key={type.id} value={type.id}>{type.name}</Select.Option>
                        ))}
                      </Select>
                    </FormItem>
                  )}
                </PageTypes>
              </Col>
            </Row>

            <Row style={rowMargin}>
              <Col span={labelSize} style={{ textAlign: 'right' }}>
                <div style={labelStyle}>
                  <span>Name:</span>
                </div>
              </Col>
              <Col span={24 - labelSize}>
                <div style={{ paddingRight: '16px' }}>
                  <FormItem 
                    {...(
                      (this.state.nameErr && {
                        validateStatus: 'error',
                        help: 'Name must be filled.'
                      }) || {}
                    )}
                  >
                    <Input
                      value={this.state.name}
                      onChange={(e) => this.handleChangeName(e.target.value)}
                    />
                  </FormItem>
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={labelSize} style={{ textAlign: 'right' }}>
                <div style={labelStyle}>
                  <span>URL:</span>
                </div>
              </Col>
              <Col span={24 - labelSize}>
                <div style={{ paddingRight: '16px' }}>
                  <Input
                    value={this.state.url}
                    onChange={(e) => this.handleChangeUrl(e.target.value)}
                    onBlur={() => this.handleUrlBlur()}
                  />
                </div>
              </Col>
            </Row>

            <Row className={this.state.alert} style={rowMargin}>
              <Col span={24}>
                <Alert
                  message="Using name as url..."
                  type="info"
                  style={{ margin: '0px 20px' }}
                />
              </Col>
            </Row>

            <Row>
              <Col span={labelSize} style={{ textAlign: 'right' }}>
                <div style={labelStyle}>
                  <span>Status:</span>
                </div>
              </Col>
              <Col span={24 - labelSize}>
                <Select
                  style={{ minWidth: '200px' }}
                  defaultValue="DRAFT"
                  value={this.state.status}
                  onChange={this.handleChangeStatus}
                >
                  <Select.Option key="DRAFT" value="DRAFT">Draft</Select.Option>
                  <Select.Option key="PENDING" value="PENDING">Pending</Select.Option>
                  <Select.Option key="PUBLISHED" value="PUBLISHED">Published</Select.Option>
                </Select>
              </Col>
            </Row>
          </Modal>
        )}
      </CreateMutation>
    );
  }

}

export default CreatePageModal;

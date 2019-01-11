import * as React from 'react';
import { Button, Input, Row, Col, Tooltip, Select } from 'antd';
import { indexOf } from 'lodash';
import { CreateProjectDto } from '../../../../services/api/resources/environment';
import { Query } from 'react-apollo';
import { queries, mutations } from '@source/services/graphql';
import { ApolloClient } from 'apollo-client';

const { Component } = React;

interface Properties {
  id?: string;
  // tslint:disable-next-line:no-any
  client?: ApolloClient<any>;
  data?: LooseObject;

  onSave?: (data: LooseObject) => void;
  onCancel?: () => void;
}

interface State {
  name: string;
  defName: string;
  langs: Array<string>;
  defLang: string | null;

  nameError: boolean;
  langsError: boolean;
  defLangError: boolean;
}

class ProjectForm extends Component<Properties, State> {

  private RESET_ERROR_VALUES = {
    nameError: false,
    langsError: false,
    defLangError: false
  };

  private RESET_STATE_VALUES: State = {
    name: '',
    defName: '',
    langs: [],
    defLang: null,

    ...this.RESET_ERROR_VALUES
  };

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.RESET_STATE_VALUES
    };

    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  public componentDidMount() {
    // Setup data if we have some
    if (this.props.data) {
      this.updateData(this.props.data);
    }
  }

  public componentWillReceiveProps(nextProps: Properties) {
    // Setup data if we have some
    if (this.props.data !== nextProps.data) {
      this.updateData(nextProps.data);
    }
  }

  handleSave() {
    const errors = {
      nameError: false,
      langsError: false,
      defLangError: false,
    };
    let someError = false;

    if (this.state.name.length < 1) {
      errors.nameError = true;
      someError = true;
    }
    if (this.state.langs.length < 1) {
      errors.langsError = true;
      someError = true;
    }
    if (!this.state.defLang) {
      errors.defLangError = true;
      someError = true;
    }

    if (someError) {
      this.setState({
        ...errors
      });

      return;
    }

    // Make differences in langs
    let languages = {} as LooseObject;
    if (!this.props.data || !this.props.data.languages) {
      languages = {
        connect: this.state.langs.map((lang: string) => ({ id: lang }))
      };
    } else {
      const langs = this.props.data.languages.map((lang: LooseObject) => {
        return lang.id;
      });

      // connect - Find what is new
      const connect = this.state.langs.filter((lang: string) => {
        if (langs.indexOf(lang) > -1) {
          return false;
        }

        return true;
      }).map((lang: string) => ({ id: lang }));

      // disconnect - Find what is missing
      const disconnect = langs.filter((lang: string) => {
        if (this.state.langs.indexOf(lang) > -1) {
          return false;
        }

        return true;
      }).map((lang: string) => ({ id: lang }));

      if (connect.length > 0) {
        languages.connect = connect;
      }

      if (disconnect.length > 0) {
        languages.disconnect = disconnect;
      }
    }

    const data = {
      name: this.state.name,
      defaultName: this.state.defName,
      languages,
      defaultLanguage: { id: this.state.defLang },
    };

    if (this.props.onSave) {
      this.props.onSave(data);
    }

    this.setState({
      ...this.RESET_STATE_VALUES
    });
  }

  handleCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }

    this.setState({
      ...this.RESET_STATE_VALUES
    });
  }

  handleInputChange(name: string, value: string) {
    this.setState({
      ...this.state,
      [name]: value
    });
  }

  handleSelectChange(name: string, value: Array<string> | string) {
    if (name === 'langs') {
      if (indexOf(value, this.state.defLang) < 0) {
        this.setState({
          [name]: value as string[],
          defLang: null
        });

        return;
      }
    }

    this.setState({
      ...this.state,
      [name]: value
    });
  }

  render() {
    const isNew = !this.props.data;
    const labelStyle = {
      textAlign: 'right',
      paddingTop: '4px',
      paddingRight: '8px'
    } as React.CSSProperties;
    const labelSize = 6;

    return (
      <>
        <div style={{ textAlign: 'center' }}>
        {isNew ?
          <h1>Create Project</h1>
        :
          <h1>Edit Project</h1>
        }
        </div>

        <div style={{ margin: '12px 0px 18px 0px', padding: '0px 20px' }}>
          <Row>
            <Col span={labelSize} style={labelStyle}>
              <span>Name:</span>
            </Col>
            <Col span={24 - labelSize}>
              <Input value={this.state.name} onChange={(e) => this.handleInputChange('name', e.target.value)} />
            </Col>
          </Row>
          <Row style={{ paddingTop: '6px', display: this.state.nameError ? '' : 'none' }}>
            <Col span={labelSize} />
            <Col span={24 - labelSize} style={{ textAlign: 'center' }}>
                <span style={{ color: 'red' }}>Please enter some name!</span>
            </Col>
          </Row>
          <Row style={{ marginTop: '8px' }}>
            <Col span={labelSize} style={labelStyle}>
              <Tooltip title="Name of project in default language">
                <span>Default name:</span>
              </Tooltip>
            </Col>
            <Col span={24 - labelSize}>
              <Input value={this.state.defName} onChange={(e) => this.handleInputChange('defName', e.target.value)} />
            </Col>
          </Row>
          <Row style={{ marginTop: '8px' }}>
            <Col span={labelSize} style={labelStyle}>
              <span>Languages:</span>
            </Col>
            <Col span={24 - labelSize}>
              <Query query={queries.LANGUAGES}>
                {({ loading, data, error }) => {
                  if (loading) {
                    return (
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Loading languages..."
                        disabled={true}
                      />
                    );
                  }

                  if (error) {
                    return (
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Error while loading languages..."
                        disabled={true}
                      />
                    );
                  }

                  return (
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="Please select languages"
                      onChange={(val) => this.handleSelectChange('langs', val as Array<string>)}
                      value={this.state.langs}
                    >
                      {data.languages && data.languages.map((lang: LooseObject) => {
                        return <Select.Option key={lang.id}>{lang.name}</Select.Option>;
                      })}
                    </Select>
                  );
                }}
              </Query>
            </Col>
          </Row>
          <Row style={{ paddingTop: '6px', display: this.state.langsError ? '' : 'none' }}>
            <Col span={labelSize} />
            <Col span={24 - labelSize} style={{ textAlign: 'center' }}>
                <span style={{ color: 'red' }}>Please select at least one language!</span>
            </Col>
          </Row>
          <Row style={{ marginTop: '8px' }}>
            <Col span={labelSize} style={labelStyle}>
              <span>Default language:</span>
            </Col>
            <Col span={24 - labelSize}>
              <Query query={queries.LANGUAGES}>
                {({ loading, data, error }) => {
                  if (loading) {
                    return (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Loading languages..."
                        disabled={true}
                      />
                    );
                  }

                  if (error) {
                    return (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Error while loading languages..."
                        disabled={true}
                      />
                    );
                  }

                  return (
                    <Select
                      style={{ width: '100%' }}
                      onChange={(val) => this.handleSelectChange('defLang', val as string)}
                      value={[this.state.defLang]}
                      notFoundContent="Please select firstly some languages"
                    >
                      {data.languages && data.languages.map((lang: LooseObject) => {
                        if (indexOf(this.state.langs, lang.id) > -1) {
                          return <Select.Option key={lang.id}>{lang.name}</Select.Option>;
                        }

                        return null;
                      })}
                    </Select>
                  );
                }}
              </Query>
            </Col>
          </Row>
          <Row style={{ paddingTop: '6px', display: this.state.defLangError ? '' : 'none' }}>
            <Col span={labelSize} />
            <Col span={24 - labelSize} style={{ textAlign: 'center' }}>
                <span style={{ color: 'red' }}>Please select default language!</span>
            </Col>
          </Row>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button type="primary" onClick={this.handleSave}>{isNew ? 'Create' : 'Save'}</Button>
          <Button style={{ marginLeft: '12px' }} onClick={this.handleCancel}>Cancel</Button>
        </div>
      </>
    );
  }

  private updateData(data: LooseObject) {
    // Parse languages
    const langs = data.languages.map((lang: LooseObject) => {
      return lang.id;
    });
    // Parse default language
    const defLang = data.defaultLanguage.id;

    // Update local state of values for form
    this.setState({
      name: data.name,
      defName: data.defaultName,
      langs,
      defLang
    });
  }

}

export default ProjectForm;

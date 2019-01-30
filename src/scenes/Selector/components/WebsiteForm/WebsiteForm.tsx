import * as React from 'react';
import { Button, Input, Row, Col, Tooltip, Select, Alert } from 'antd';
import { indexOf } from 'lodash';
import { CreateWebsiteDto } from '../../../../services/api/resources/environment';
import { queries } from '@source/services/graphql';
import { Query } from 'react-apollo';

const { Component } = React;

interface Properties {
  projectId: string;
  data?: LooseObject;

  onSave?: (data: LooseObject) => void;
  onCancel?: () => void;
}

interface State {
  title: string;
  langs: string[];
  defLang: string;
  urlMask: string;

  titleError: boolean;
  langsError: boolean;
  defLangError: boolean;
  urlMaskError: boolean;
}

class WebsiteForm extends Component<Properties, State> {
  private RESET_ERROR_VALUES = {
    titleError: false,
    langsError: false,
    defLangError: false,
    urlMaskError: false,
  };

  private RESET_STATE_VALUES: State = {
    title: '',
    langs: [],
    defLang: null,
    urlMask: '',

    ...this.RESET_ERROR_VALUES,
  };

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.RESET_STATE_VALUES,
    };

    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentWillReceiveProps(nextProps: Properties) {
    if (this.props.data !== nextProps.data) {
      this.updateData(nextProps.data);
    }
  }

  componentDidMount() {
    if (this.props.data) {
      this.updateData(this.props.data);
    }
  }

  handleSave() {
    const errors = {
      titleError: false,
      langsError: false,
      defLangError: false,
      urlMaskError: false,
    };
    let someError = false;

    if (this.state.title.length < 1) {
      errors.titleError = true;
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
    if (this.state.urlMask.length < 1) {
      errors.urlMaskError = true;
      someError = true;
    }

    if (someError) {
      this.setState({
        ...this.state,
        ...errors,
      });

      return;
    }

    // Make differences in langs
    let languages = {} as LooseObject;
    if (!this.props.data || !this.props.data.languages) {
      languages = {
        connect: this.state.langs.map((lang: string) => ({ id: lang })),
      };
    } else {
      const langs = this.props.data.languages.map((lang: LooseObject) => {
        return lang.id;
      });

      // connect - Find what is new
      const connect = this.state.langs
        .filter((lang: string) => {
          if (langs.indexOf(lang) > -1) {
            return false;
          }

          return true;
        })
        .map((lang: string) => ({ id: lang }));

      // disconnect - Find what is missing
      const disconnect = langs
        .filter((lang: string) => {
          if (this.state.langs.indexOf(lang) > -1) {
            return false;
          }

          return true;
        })
        .map((lang: string) => ({ id: lang }));

      if (connect.length > 0) {
        languages.connect = connect;
      }

      if (disconnect.length > 0) {
        languages.disconnect = disconnect;
      }
    }

    const data = {
      title: this.state.title,
      project: this.props.projectId,
      languages,
      defaultLanguage: { id: this.state.defLang },
      urlMask: this.state.urlMask,
    };

    if (this.props.onSave) {
      this.props.onSave(data);
    }

    this.setState({
      ...this.RESET_STATE_VALUES,
    });
  }

  handleCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }

    this.setState({
      ...this.RESET_STATE_VALUES,
    });
  }

  handleInputChange(name: string, value: string) {
    this.setState({
      ...this.state,
      [name]: value,
    });
  }

  handleSelectChange(name: string, value: Array<string> | string) {
    if (name === 'langs') {
      if (indexOf(value, this.state.defLang) < 0) {
        this.setState({
          [name]: value as string[],
          defLang: null,
        });

        return;
      }
    }

    this.setState({
      ...this.state,
      [name]: value,
    });
  }

  public render() {
    const isNew = !this.props.data;
    const labelStyle = {
      textAlign: 'right',
      paddingTop: '4px',
      paddingRight: '8px',
    } as React.CSSProperties;
    const labelSize = 6;

    if (!this.props.projectId) {
      return (
        <Alert message="Error" description="No project was selected. Please first select some project." type="error" />
      );
    }

    return (
      <>
        <div style={{ textAlign: 'center' }}>{isNew ? <h1>Create Website</h1> : <h1>Edit Website</h1>}</div>

        <div style={{ margin: '12px 0px 18px 0px', padding: '0px 20px' }}>
          <Row>
            <Col span={labelSize} style={labelStyle}>
              <span>Project:</span>
            </Col>
            <Col span={24 - labelSize}>
              <Query query={queries.GET_PROJECT} variables={{ id: this.props.projectId }}>
                {({ loading, data }) => {
                  if (loading) {
                    return <Input value="Loading..." disabled={true} />;
                  }

                  return <Input value={data.project.name} disabled={true} />;
                }}
              </Query>
            </Col>
          </Row>
          <Row style={{ marginTop: '8px' }}>
            <Col span={labelSize} style={labelStyle}>
              <span>Title:</span>
            </Col>
            <Col span={24 - labelSize}>
              <Input value={this.state.title} onChange={e => this.handleInputChange('title', e.target.value)} />
            </Col>
          </Row>
          <Row style={{ paddingTop: '6px', display: this.state.titleError ? '' : 'none' }}>
            <Col span={labelSize} />
            <Col span={24 - labelSize} style={{ textAlign: 'center' }}>
              <span style={{ color: 'red' }}>Please enter some title!</span>
            </Col>
          </Row>
          <Row style={{ marginTop: '8px' }}>
            <Col span={labelSize} style={labelStyle}>
              <span>Languages:</span>
            </Col>
            <Col span={24 - labelSize}>
              <Query query={queries.GET_PROJECT} variables={{ id: this.props.projectId }}>
                {({ loading, data }) => {
                  if (loading) {
                    return (
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Loading..."
                        value={this.state.langs}
                      />
                    );
                  }

                  return (
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="Please select languages"
                      onChange={val => this.handleSelectChange('langs', val as Array<string>)}
                      value={this.state.langs}
                    >
                      {data.project.languages.map((lang: LooseObject) => {
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
              <Query query={queries.GET_PROJECT} variables={{ id: this.props.projectId }}>
                {({ loading, data }) => {
                  if (loading) {
                    return <Select style={{ width: '100%' }} placeholder="Loading..." value={this.state.langs} />;
                  }

                  return (
                    <Select
                      style={{ width: '100%' }}
                      onChange={(val) => this.handleSelectChange('defLang', val as string[])}
                      value={[this.state.defLang]}
                      notFoundContent="Please select firstly some languages"
                    >
                      {data.project.languages.map((lang: LooseObject) => {
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
          <Row style={{ marginTop: '8px' }}>
            <Col span={labelSize} style={labelStyle}>
              <Tooltip title="Base URL mask for this website (prefix)">
                <span>URL mask:</span>
              </Tooltip>
            </Col>
            <Col span={24 - labelSize}>
              <Input value={this.state.urlMask} onChange={e => this.handleInputChange('urlMask', e.target.value)} />
            </Col>
          </Row>
          <Row style={{ paddingTop: '6px', display: this.state.urlMaskError ? '' : 'none' }}>
            <Col span={labelSize} />
            <Col span={24 - labelSize} style={{ textAlign: 'center' }}>
              <span style={{ color: 'red' }}>Please enter url mask!</span>
            </Col>
          </Row>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button type="primary" onClick={this.handleSave}>
            {isNew ? 'Create' : 'Save'}
          </Button>
          <Button style={{ marginLeft: '12px' }} onClick={this.handleCancel}>
            Cancel
          </Button>
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
      title: data.title,
      langs,
      defLang,
      urlMask: data.urlMask,
    });
  }
}

export default WebsiteForm;

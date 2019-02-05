import * as React from 'react';
import { Alert, Button, Col, Input, Modal, Row } from 'antd';

import UploadImage from '../../../Seo/components/MediaLibrary';
import { deepEqual, getImgUrl } from '@source/composer/utils';
import Property from '../Property';

const { Component } = React;
const { confirm } = Modal;

interface CustomProperty {
  key: string;
  value: string;
  isDeleted: boolean;
  isNew: boolean;
}

export interface State {
  // Basic information
  title: string;
  perex: string;
  image: string;

  // Custom properties
  properties: CustomProperty[];

  // MediaLibrary
  mediaData: LooseObject | null;

  // Handle errors
  hasError: boolean;
}

interface Record {
  key: string;
  value: string;
}

interface ChangesOnSave {
  add: Record[];
  remove: Record[];
  update: Record[];
}

export interface Properties {
  records?: Record[];

  onSave?: (changes: ChangesOnSave) => void;
}

class AnnotationForm extends Component<Properties, State> {

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  constructor(props: Properties) {
    super(props);

    this.state = {
      title: '',
      perex: '',
      image: '',

      properties: [],

      mediaData: null,

      hasError: false,
    };

    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleAddNewProperty = this.handleAddNewProperty.bind(this);
    this.handleDeleteProperty = this.handleDeleteProperty.bind(this);
    this.handleChangePropertyKey = this.handleChangePropertyKey.bind(this);
    this.handleChangePropertyValue = this.handleChangePropertyValue.bind(this);
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleChangePerex = this.handleChangePerex.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleImageChange(mediaData: LooseObject) {
    let image = '';
    if (mediaData && mediaData.filename) {
      image = getImgUrl(mediaData);
    }

    this.setState({ mediaData, image });
  }

  handleAddNewProperty() {
    const count = this.state.properties.length + 1;

    const newProp = {
      key: 'New Property #' + count,
      value: '',
      isNew: true,
      isDeleted: false
    } as CustomProperty;

    this.setState(state => {
      const properties = [
        ...state.properties,
        newProp
      ];

      return {
        properties
      };
    });
  }

  handleDeleteProperty(key: string) {
    this.setState(state => {
      const properties = state.properties.map((p: CustomProperty) => {
        if (p.key !== key) {
          return p;
        }

        // Remove new property from list, otherwise just mark as deleted
        if (p.isNew) {
          return null;
        }

        return {
          ...p,
          isDeleted: !p.isDeleted
        };
      }).filter((v: CustomProperty) => v !== null);

      return {
        properties
      };
    });
  }

  handleChangePropertyKey(key: string, newKey: string) {
    this.setState(state => {
      const properties = state.properties.map((p: CustomProperty) => {
        if (p.key !== key) {
          return p;
        }

        return {
          ...p,
          key: newKey
        };
      });

      return {
        properties
      };
    });
  }

  handleChangePropertyValue(key: string, value: string) {
    this.setState(state => {
      const properties = state.properties.map((p: CustomProperty) => {
        if (p.key !== key) {
          return p;
        }

        return {
          ...p,
          value
        };
      });

      return {
        properties
      };
    });
  }

  handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      title: e.target.value
    });
  }

  handleChangePerex(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({
      perex: e.target.value
    });
  }

  componentDidMount() {
    if (this.props.records && this.props.records.length > 0) {
      this.processDataIntoState(this.props.records);
    }
  }

  componentDidUpdate(prevProps: Properties) {
    // No changes on props
    if (deepEqual(prevProps.records, this.props.records)) {
      return;
    }

    // Check if state is different from new props
    const rec = [];
    rec.push({ key: 'title', value: this.state.title });
    rec.push({ key: 'perex', value: this.state.perex });
    rec.push({ key: 'image', value: this.state.image });

    this.state.properties.forEach((p: CustomProperty) => {
      rec.push({ key: p.key, value: p.value });
    });

    // Nothing to change
    if (deepEqual(this.props.records, rec)) {
      return;
    }

    console.log(rec, prevProps.records, this.props.records);

    // Otherwise ask, if user wants to refresh data
    const onOk = () => {
      this.processDataIntoState(this.props.records);
    };

    confirm({
      title: 'Do you want to refresh data?',
      content: `Some changes on the server were made and there are new annotation
      data for this page. Do you want to refresh these data or you want to keep your changes?`,
      onOk,
    });
  }

  processDataIntoState(data: Record[]) {
    const result = {
      title: '',
      perex: '',
      image: '',

      properties: [],
    };

    data.forEach((r: Record) => {
      switch (r.key) {
        case 'title':
        case 'perex':
        case 'image':
          result[r.key] = r.value;
          break;
        default:
          const p = {
            key: r.key,
            value: r.value,
            isNew: false,
            isDeleted: false,
          };
          result.properties.push(p);
          break;
      }
    });

    this.setState(result);
  }

  handleSave() {
    if (!this.props.onSave) {
      return;
    }

    const add = [] as Record[];
    const remove = [] as Record[];
    const update = [] as Record[];

    // Check if we get title, perex and image in props, otherwise create them
    let isTitleNew = true, isPerexNew = true, isImageNew = true;
    this.props.records.forEach((p: Record) => {
      switch (p.key) {
        case 'title':
          isTitleNew = false;
          break;
        case 'perex':
          isPerexNew = false;
          break;
        case 'image':
          isImageNew = false;
          break;
        default:
          break;
      }
    });

    if (isTitleNew) {
      add.push({ key: 'title', value: this.state.title });
    } else {
      update.push({ key: 'title', value: this.state.title });
    }

    if (isPerexNew) {
      add.push({ key: 'perex', value: this.state.perex });
    } else {
      update.push({ key: 'perex', value: this.state.perex });
    }

    if (isImageNew) {
      add.push({ key: 'image', value: this.state.image });
    } else {
      update.push({ key: 'image', value: this.state.image });
    }

    this.state.properties.forEach((p: CustomProperty) => {
      if (p.isNew && !p.isDeleted) {
        add.push({ key: p.key, value: p.value });
        return;
      }

      if (!p.isNew && p.isDeleted) {
        remove.push({ key: p.key, value: p.value });
        return;
      }

      update.push({ key: p.key, value: p.value });
    });

    const changeObject = { add, remove, update };
    // Update changes
    this.setState(state => {
      const properties = state.properties.map((p: CustomProperty) => {
        p.isNew = false;
        return p;
      });

      return {
        properties
      };
    }, () => {
      this.props.onSave(changeObject);
    });
  }

  render() {
    // Show error message
    if (this.state.hasError) {
      return (
        <Alert
          message="Form for annotations cannot be displayed because of error. Please try to reload the page."
          type="error"
          showIcon={true}
        />
      );
    }

    return (
      <>
        <Row gutter={48}>
          <Col span={12}>
            <h2>Basic Information</h2>
            <Row style={{ marginBottom: '10px' }}>
              <label>Title</label>
              <Input
                value={this.state.title}
                onChange={this.handleChangeTitle}
              />
            </Row>
            <Row style={{ marginBottom: '10px' }}>
              <label>Perex</label>
              <Input.TextArea
                value={this.state.perex}
                onChange={this.handleChangePerex}
              />
            </Row>
            <Row style={{ marginBottom: '10px' }}>
              <label>Image</label>
              <UploadImage
                mediaData={this.state.mediaData}
                onChange={this.handleImageChange}
                mediaUrl={this.state.image}
              />
            </Row>
          </Col>
          <Col span={12}>
            <h2>Custom Properties</h2>
            {this.state.properties.map((property: CustomProperty, index: number) => (
              <Property
                key={index}
                name={property.key}
                value={property.value}

                isNew={property.isNew}
                isDeleted={property.isDeleted}

                onNameChange={this.handleChangePropertyKey}
                onValueChange={this.handleChangePropertyValue}
                onDelete={this.handleDeleteProperty}
              />
            ))}
            <Button
              icon="plus-circle"
              onClick={this.handleAddNewProperty}
              style={{ marginTop: '10px' }}
            >
              Add property
            </Button>
          </Col>
        </Row>
        <Row style={{ marginTop: '24px' }}>
          <Button
            style={{ float: 'right' }}
            type="primary"
            icon="save"
            onClick={this.handleSave}
          >
            Save
          </Button>
        </Row>
      </>
    );
  }

}

export default AnnotationForm;

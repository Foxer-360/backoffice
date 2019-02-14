import * as React from 'react';
import { IFormSchemaElement } from '../../FormBuilder';
import ButtonGroup from '../ButtonGroup';
import CheckBox from '../CheckBox';
import Input from '../Input';
import MediaLibrary from '../MediaLibrary';
import RadioGroup from '../RadioGroup';
import Select from '../Select';
import TextArea from '../TextArea';
import UrlAutocomplete from '../UrlAutocomplete';
import Tags from '../Tags';
import MarkDown from '@source/composer/scenes/Composer/components/Editor/components/Sidebar/components/FormBuilder/components/MarkDown';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

interface InputRendererProps {
  id?: string;
  name: string;
  // tslint:disable-next-line:no-any
  value?: any;
  language: string;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent | any) => void;
  // tslint:disable-next-line:no-any
  mediaLibraryChange: (value: any) => void;
  schemaPaths?: Array<string>;
  pageSourceAvailable?: boolean;
}

class InputRenderer extends React.Component<InputRendererProps & IFormSchemaElement, {}> {
  public render() {
    if (!this.props.type) {
      return null;
    }

    switch (this.props.type.toLowerCase()) {
      case 'text':
      case 'string':
      case 'phone':
      case 'email':
      case 'password':
      case 'number':
        return (
          <Input
            type={this.props.type}
            label={this.props.title ? this.props.title : ''}
            name={this.props.name}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.props.onChange}
            schemaPaths={this.props.schemaPaths}
          />
        );

      case 'checkbox':
      case 'boolean':
        return (
          <CheckBox
            label={this.props.title ? this.props.title : ''}
            name={this.props.name}
            value={this.props.value && this.props.value.toString() === 'true'}
            onChange={this.props.onChange}
          />
        );

      case 'enum':
      case 'select':
      case 'multiselect':
        return (
          <Select
            label={this.props.title ? this.props.title : ''}
            name={this.props.name}
            placeholder={this.props.placeholder}
            options={this.props.options ? this.props.options : []}
            value={this.props.value}
            onChange={this.props.onChange}
          />
        );

      case 'textarea':
        return (
          <TextArea
            label={this.props.title ? this.props.title : ''}
            notitle={this.props.notitle}
            name={this.props.name}
            rows={this.props.rows}
            value={this.props.value}
            onChange={this.props.onChange}
          />
        );

      case 'radiogroup':
        return (
          <RadioGroup
            label={this.props.title ? this.props.title : ''}
            notitle={this.props.notitle}
            name={this.props.name}
            options={this.props.options ? this.props.options : []}
            value={this.props.value}
            onChange={this.props.onChange}
          />
        );

      case 'buttongroup':
        return (
          <ButtonGroup
            label={this.props.title ? this.props.title : ''}
            notitle={this.props.notitle}
            name={this.props.name}
            options={this.props.options ? this.props.options : []}
            value={this.props.value}
            onChange={this.props.onChange}
          />
        );

      case 'image':
      case 'file':
        return (
          <MediaLibrary name={this.props.name} mediaData={this.props.value} onChange={this.props.mediaLibraryChange} />
        );

      case 'urlautocomplete':
        return (
          <UrlAutocomplete
            label={this.props.title ? this.props.title : ''}
            name={this.props.name}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.props.onChange}
            pageSourceAvailable={this.props.pageSourceAvailable}
          />
        );

      case 'tags':
        return (
          <Tags
            name={this.props.name}
            language={this.props.language}
            label={this.props.title ? this.props.title : ''}
            onChange={this.props.onChange}
            value={this.props.value}
          />
        );

      case 'markdown':
        return (
          <MarkDown
            id={`${this.props.id}`}
            label={this.props.title ? this.props.title : ''}
            name={this.props.name}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.props.onChange}
          />
        );

      default:
        return null;
    }
  }
}

export default InputRenderer;

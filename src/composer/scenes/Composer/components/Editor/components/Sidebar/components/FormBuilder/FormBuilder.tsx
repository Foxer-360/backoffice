import { ILooseObject } from '@source/composer/types';
import * as React from 'react';
import ArrayInputs from './components/ArrayInputs';
import InputRenderer from './components/InputRenderer';
import Section from './components/Section';
import { SelectOption } from './components/Select';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IFormSchemaElement {
  type?: string | 'text';
  title?: string;
  notitle?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  rows?: number;
  properties?: IFormSchemaElement[];
}

export interface IFormSchema {
  properties: Array<{ [elementName: string]: IFormSchemaElement }>;
}

interface IFormBuilderProps {
  form?: {
    schema: IFormSchema;
  };
  data?: ILooseObject;
  onChange: (data: ILooseObject) => void;
}

class FormBuilder extends React.Component<IFormBuilderProps> {
  constructor(props: IFormBuilderProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.mediaLibraryChange = this.mediaLibraryChange.bind(this);
  }

  // tslint:disable-next-line:no-any
  public handleChange(e: React.ChangeEvent | any) {
    const newData = {
      ...this.props.data,
      [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement).value,
    };
    this.props.onChange(newData);
  }

  public mediaLibraryChange(media: { value: object; name: string }) {
    const value = { recommendedSizes: this.props.data[media.name].recommendedSizes, ...media.value };
    const newData = { ...this.props.data, [media.name]: value };

    this.props.onChange(newData);
  }

  public renderElements(schema: IFormSchema, pass?: number): JSX.Element[] | null {
    if (schema && schema.properties) {
      return Object.keys(schema.properties).map((elementName: string, index: number) => {
        const element = schema.properties[elementName];

        switch (element.type.toLowerCase()) {
          case 'section':
            return (
              <Section key={index} title={element.title}>
                {element && this.renderElements(element, index + 1)}
              </Section>
            );

          case 'array':
            return (
              <ArrayInputs
                key={index}
                name={elementName}
                title={element.title}
                items={element.items}
                data={(this.props.data && this.props.data[elementName]) || []}
                onChange={this.handleChange}
                activeTab={this.props.data.activeTab || 0}
              />
            );

          default:
            return (
              <InputRenderer
                id={pass ? index + pass : index}
                key={index}
                name={elementName}
                {...element}
                value={this.props.data && this.props.data[elementName] ? this.props.data[elementName] : null}
                onChange={this.handleChange}
                mediaLibraryChange={this.mediaLibraryChange}
              />
            );
        }
      });
    }

    return null;
  }

  public render() {
    return <form>{this.props.form && this.props.form.schema && this.renderElements(this.props.form.schema)}</form>;
  }
}

export default FormBuilder;

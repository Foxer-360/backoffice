import * as React from 'react';
import InputRenderer from './components/InputRenderer';
import { SelectOption } from './components/Select';
import Section from './components/Section';
import ArrayInputs from './components/ArrayInputs';

export interface FormSchemaElement {
  type?: string | 'text';
  title?: string;
  notitle?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  rows?: number;
  properties?: FormSchemaElement[];
}

export interface FormSchema {
  properties: {[elementName: string]: FormSchemaElement}[];
}

interface FormBuilderProps {
  form?: {
    schema: FormSchema
  };
  data?: LooseObject;
  onChange: (data: LooseObject) => void;
}

class FormBuilder extends React.Component<FormBuilderProps> {

  constructor(props: FormBuilderProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  // tslint:disable-next-line:no-any
  handleChange(e: React.ChangeEvent | any) {
    const newData = {
      ...this.props.data,
      [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement).value
    };

    this.props.onChange(newData);
  }

  renderElements(schema: FormSchema): JSX.Element[] {
    if (schema && schema.properties) {
      return Object.keys(schema.properties).map((elementName: string, index: number) => {
        const element = schema.properties[elementName];
        switch (element.type.toLowerCase()) {
          case 'section':
            return (
              <Section
                key={index}
                title={element.title}
              >
                {element &&
                  this.renderElements(element)}
              </Section>);

          case 'array':
            return (
              <ArrayInputs
                key={index}
                name={elementName}
                title={element.title}
                items={element.items}
                data={this.props.data && this.props.data[elementName] || []}
                onChange={this.handleChange}
              />);

          default:
            return (
              <InputRenderer
                key={index}
                name={elementName}
                {...element}
                value={this.props.data && this.props.data[elementName] ? this.props.data[elementName] : null}
                onChange={this.handleChange}
              />);
        }
      });
    }

    return null;
  }

  render() {
    return (
      <form>
        {this.props.form && this.props.form.schema &&
          this.renderElements(this.props.form.schema)}
      </form>
    );
  }
}

export default FormBuilder;
import TextArea from 'antd/es/input/TextArea';
import * as React from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'simplemde/dist/simplemde.min.css';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

interface IMyTextAreaProps {
  id?: string;
  type?: string | 'text';
  label: string;
  notitle?: boolean;
  name: string;
  value?: string;
  placeholder?: string;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export default class MarkDown extends React.Component<IMyTextAreaProps, {}> {

  onChange = (value) => 
  this.props.onChange({ 
    target: { 
      name: this.props.name, 
      value
    } 
  })

  public render() {
    return (
      <div style={{ paddingBottom: '5px' }}>
        <SimpleMDE
          id={`markdown_${this.props.id}`}
          label={this.props.notitle && this.props.notitle === true ? null
            : this.props.label}
          onChange={this.onChange}
          value={this.props.value || ''}
          options={{
            spellChecker: false
          }}
        />
      </div>
    );
  }
}

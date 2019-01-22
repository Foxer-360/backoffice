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

interface IContent {
  content: string;
}

export default class MarkDown extends React.Component<IMyTextAreaProps, IContent> {
  constructor(props: IMyTextAreaProps) {
    super(props);
    this.state = {
      content: '',
    };
  }

  componentDidMount() {
    this.setState({ content: this.props.value });
  }

  onChange = value =>
    this.props.onChange({
      target: {
        name: this.props.name,
        value,
      },
    })

  handleChange = value => {
    this.onChange(value);
  }

  public render() {
    const { id, type, label, notitle, name, placeholder, value } = this.props;

    return (
      <div style={{ paddingBottom: '5px' }}>
        <SimpleMDE
          id={`markdown_${id}`}
          label={notitle && notitle === true ? null : label}
          onChange={this.handleChange}
          value={this.state.content || ''}
          options={{
            spellChecker: false,
            placeholder: placeholder,
          }}
        />
      </div>
    );
  }
}
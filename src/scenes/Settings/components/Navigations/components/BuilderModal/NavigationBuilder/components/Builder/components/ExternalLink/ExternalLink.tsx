import * as React from 'react';
import { Input, Button } from 'antd';

interface ExternalLinkProps {
  onCreateNew: Function;
}

interface ExternalLinkState {
  title: string;
  link: string;
}

class ExternalLink extends React.Component<ExternalLinkProps, ExternalLinkState> {

  constructor(props: ExternalLinkProps) {
    super(props);

    this.state = {
      title: null,
      link: null,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  // tslint:disable-next-line:no-any
  onChange(e: any) {
    this.setState({
      ...this.state, [e.target.name]: e.target.value
    });
  }

  // tslint:disable-next-line:no-any
  onSubmit(e: any) {
    if (this.state.title && this.state.title !== '' && this.state.link && this.state.link !== '') {
      this.props.onCreateNew({
        title: this.state.title,
        link: this.state.link,
      });
      this.setState({
        title: null,
        link: null,
      });
    }
  }

  render() {
    return (
      <>
        <strong>Add external link</strong>
        <Input
          type="text"
          name="title"
          placeholder="Link title"
          value={this.state.title ? this.state.title : ''}
          style={{ margin: '10px 0 5px 0' }}
          onChange={(e) => this.onChange(e)}
        />
        <Input
          type="text"
          name="link"
          placeholder="Link URL"
          value={this.state.link ? this.state.link : ''}
          style={{ margin: '10px 0 10px 0' }}
          onChange={(e) => this.onChange(e)}
        />
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={this.onSubmit}>Add link</Button>
        </div>
      </>
    );
  }
}

export default ExternalLink;
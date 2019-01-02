import { Button, Col, Row, Input } from 'antd';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IEmbedVideoEditorProps {
  // tslint:disable:no-any
  onChange?: (media: object) => void;
  closeEditor?: () => void;
  name: string;
}

export interface IEmbedVideoEditorState {
  // tslint:disable:no-any
  embeddedVideoUrl: string;
}

class EmbedVideoEditor extends React.Component<IEmbedVideoEditorProps, IEmbedVideoEditorState> {
  constructor(props: IEmbedVideoEditorProps) {
    super(props);
    this.state = { embeddedVideoUrl: null };
  }

  componentWillUnmount() {
    this.setState({
      embeddedVideoUrl: null,
    });
  }

  handleInputChange = value => {
    this.setState({
      embeddedVideoUrl: value,
    });
  }

  public render() {
    return (
      <div className="mediaLibrary__editor">
        <>
          <Row>
            <Col span={24}>
              <label>Video Url:</label>
              <Input onChange={e => this.handleInputChange(e.target.value)} style={{ marginTop: '10px' }} />
            </Col>
          </Row>
          <hr className={'hSep'} />

          <Row>
            <Col span={24}>
              <iframe
                src={this.state.embeddedVideoUrl}
                style={{
                  width: '100%',
                  height: '300px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                }}
              />
            </Col>
          </Row>
          <hr className={'hSep'} />

          <Row>
            <Col span={24}>
              <Button
                type={'primary'} // tslint:disable:no-console
                onClick={() =>
                  this.props.onChange({
                    value: {
                      type: 'embeddedVideo',
                      url: this.state.embeddedVideoUrl,
                    },
                    name: this.props.name,
                  })
                }
                style={{ marginRight: '16px' }}
              >
                Embed
              </Button>

              <Button
                type="danger"
                onClick={() => {
                  if (this.props.closeEditor) {
                    this.props.closeEditor();
                  }
                }}
              >
                Close
              </Button>
            </Col>
          </Row>
        </>
      </div>
    );
  }
}

export default EmbedVideoEditor;

import React, { Component } from 'react';
import { Row, Col, Form, Input } from 'antd';
// import MediaLibrary from 'components/MediaLibrary';
import TwitterSnippet from '../partials/TwitterSnippet';

const placeholder = 'https://www.collaboraoffice.com/wp-content/' +
  'plugins/post-grid/assets/frontend/css/images/placeholder.png';

interface TwitterControlProps {
  image: string;
  title: string;
  description: string;
  publisher: string;

  updateTitle: Function;
  updatePublisher: Function;
  updateDescription: Function;
  updateImage: Function;

  rowFormItemLayout: LooseObject;
}

class TwitterControl extends Component<TwitterControlProps> {

  static defaultProps = {
    url: 'https://www.koh-i-noor.cz/',
    image: placeholder,
  };

  isReady(props: TwitterControlProps) {
    if (props.image && props.title && props.description) {
      return true;
    }

    return false;
  }

  gatherTwitterData(props: TwitterControlProps) {
    return {
      title: props.title,
      text: props.description,
      image: props.image ? props.image : placeholder,
    };
  }

  render() {
    return (
      <div>
        <Row>
          <Col span={12}>
            <h2>Social media - Twitter</h2>

            <Form.Item {...this.props.rowFormItemLayout} label="Publisher">
              <Input value={this.props.publisher} onChange={(e) => this.props.updatePublisher(e.target.value)} />
            </Form.Item>

            <Form.Item {...this.props.rowFormItemLayout} label="Title">
              <Input value={this.props.title} onChange={(e) => this.props.updateTitle(e.target.value)} />
            </Form.Item>

            <Form.Item {...this.props.rowFormItemLayout} label="Description">
              <Input
                type="textarea"
                value={this.props.description}
                onChange={(e) => this.props.updateDescription(e.target.value)}
              />
            </Form.Item>

            {/*<Form.Item {...this.props.rowFormItemLayout} label="Image">
              <div className="pageSeo__socialPhotoWrap">
                <MediaLibrary updateComponent={this.props.updateImage} selectedMedia={{ url : this.props.image }} />
              </div>
            </Form.Item>*/}
          </Col>

          <Col span={12}>
            <TwitterSnippet {...this.gatherTwitterData(this.props)} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default TwitterControl;

import React  from 'react';
import { Row, Col, Form, Input } from 'antd';
// import MediaLibrary from 'components/MediaLibrary';
import FacebookSnippet from '../partials/FacebookSnippet';

const placeholder = 'https://www.collaboraoffice.com/wp-content/' +
  'plugins/post-grid/assets/frontend/css/images/placeholder.png';

interface FacebookControlProps {
  image: string;
  title: string;
  description: string;
  publisher: string;
  url?: string;

  updateTitle: Function;
  updatePublisher: Function;
  updateDescription: Function;
  updateImage: Function;

  rowFormItemLayout: LooseObject;
}

class FacebookControl extends React.Component<FacebookControlProps> {

  static defaultProps = {
    url: 'https://www.koh-i-noor.cz/',
    image: placeholder,
  };

  isReady(props: FacebookControlProps) {
    if (props.image && props.title && props.description) {
      return true;
    }

    return false;
  }

  gatherFacebookData(props: FacebookControlProps) {
    return {
      image: props.image ? props.image : placeholder,
      title: props.title,
      description: props.description,
      author: props.publisher,
      url: props.url,
    };
  }

  render() {
    return (
      <div>
        <h2>Social media - Facebook</h2>
        <Row>
          <Col span={12}>
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
            <FacebookSnippet {...this.gatherFacebookData(this.props)} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default FacebookControl;

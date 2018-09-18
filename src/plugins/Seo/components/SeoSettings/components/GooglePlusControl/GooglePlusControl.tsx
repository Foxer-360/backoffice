import React from 'react';
import { Row, Col, Form, Input } from 'antd';
// import MediaLibrary from 'components/MediaLibrary';
import GooglePlusSnippet from '../partials/GooglePlusSnippet';

const placeholder = 'https://www.collaboraoffice.com/wp-content/' +
  'plugins/post-grid/assets/frontend/css/images/placeholder.png';

interface GooglePlusControlProps {
  image: string;
  title: string;
  publisher: string;
  url?: string;

  updateTitle: Function;
  updatePublisher: Function;
  updateImage: Function;

  rowFormItemLayout: LooseObject;
}

class GooglePlusControl extends React.Component<GooglePlusControlProps> {

  static defaultProps = {
    url: 'https://www.koh-i-noor.cz/',
    image: placeholder
  };

  isReady(props: GooglePlusControlProps) {
    if (props.image && props.title) {
      return true;
    }

    return false;
  }

  gatherGooglePlusData(props: GooglePlusControlProps) {
    return {
      title: props.title,
      image: props.image ? props.image : placeholder,
      url: props.url
    };
  }

  render() {
    return (
      <div>
        <Row>
          <Col span={12}>
            <h2>Social media - Google+</h2>

            <Form.Item {...this.props.rowFormItemLayout} label="Publisher">
              <Input value={this.props.publisher} onChange={(e) => this.props.updatePublisher(e.target.value)}/>
            </Form.Item>

            <Form.Item {...this.props.rowFormItemLayout} label="Title">
              <Input value={this.props.title} onChange={(e) => this.props.updateTitle(e.target.value)} />
            </Form.Item>

            {/*<Form.Item {...this.props.rowFormItemLayout} label="Image">
               <div className="pageSeo__socialPhotoWrap">
                  <MediaLibrary updateComponent={ this.props.updateImage } selectedMedia={{ url : this.props.image }} />
               </div>
            </Form.Item>*/}
          </Col>

          <Col span={12}>
            <GooglePlusSnippet {...this.gatherGooglePlusData(this.props)} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default GooglePlusControl;

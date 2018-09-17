import React from 'react';
import { Row, Col, Form, Input } from 'antd';

import GoogleSnippet from '../partials/GoogleSnippet';
import SeoWidget from '../SeoWidget';

const placeholder = 'https://www.collaboraoffice.com/wp-content/' +
  'plugins/post-grid/assets/frontend/css/images/placeholder.png';

interface GoogleControlProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  fullUrl?: string;

  currentPage?: string;
  pages?: LooseObject[];

  focusKeyword?: string;

  updateTitle: Function;
  updateDescription: Function;
  updateFocusKeyword: Function;

  rowFormItemLayout: LooseObject;
}

class GoogleControl extends React.Component<GoogleControlProps> {

  static defaultProps = {
    url: 'https://www.koh-i-noor.cz/',
    image: placeholder,
  };

  isReady(props: GoogleControlProps) {
    return props.description && props.title;
  }

  gatherGoogleData(props: GoogleControlProps) {
    return {
      title: props.title,
      description: props.description,
      url: props.url,
      image: props.image ? props.image : placeholder,
    };
  }

  render() {
    const {
      // actionUseMetaForAll,
      currentPage,
      description,
      focusKeyword,
      fullUrl,
      rowFormItemLayout,
      title,
      pages,
    } = this.props;

    /*const pagesWithSameKeyword = pages.filter((p: LooseObject) =>
      p.seo.focusKeyword && 
      focusKeyword &&
      p.seo.focusKeyword.toLowerCase().trim() === focusKeyword.toLowerCase().trim() &&
      p.id !== currentPage.id);*/

    return (
      <div>
        <h2>SEO meta information</h2>
        <Row>
          <Col span={12} md={24} lg={12}>

            <Form.Item {...rowFormItemLayout} label="Title">
              <Input defaultValue={title} onChange={(e) => this.props.updateTitle(e.target.value)} />
            </Form.Item>

            <Form.Item {...rowFormItemLayout} label="Description">
              <Input defaultValue={description} onChange={(e) => this.props.updateDescription(e.target.value)} />
            </Form.Item>

            <Form.Item {...rowFormItemLayout} label="Focus keyword">
              <Input defaultValue={focusKeyword} onChange={(e) => this.props.updateFocusKeyword(e.target.value)} />
            </Form.Item>

            <Form.Item>
              <SeoWidget
                title={title}
                description={description || ''}
                duplicated={false}
                focusKeyword={focusKeyword || ''}
                fullUrl={fullUrl}
                pagesWithSameKeyword={[]} // pagesWithSameKeyword}
              />
            </Form.Item>
          </Col>

          <Col span={12} md={24} lg={12}>
            <GoogleSnippet {...this.gatherGoogleData(this.props)} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default GoogleControl;

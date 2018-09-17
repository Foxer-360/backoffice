import * as React from 'react';
import { Row, Col, Tabs } from 'antd';

import FacebookControl from './components/FacebookControl';
import TwitterControl from './components/TwitterControl';
import GooglePlusControl from './components/GooglePlusControl';
import GoogleControl from './components/GoogleControl';
// import SaveSeoButton from '../../components/SaveSeoButton';

const rowFormItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
  },
};

interface SeoSettingsProps {
  currentPage: string;
  currentLanguage: string;

  url: string;
  image?: string;

  title: string;
  description: string;
  focusKeyword: string;
  // fb
  facebookTitle: string;
  facebookPublisher: string;
  facebookDescription: string;
  facebookImage: string;
  // twitter
  twitterTitle: string;
  twitterPublisher: string;
  twitterDescription: string;
  twitterImage: string;
  // google plus
  googlePlusTitle: string;
  googlePlusPublisher: string;
  googlePlusImage: string;

  // seznam všech stránek
  pages: LooseObject[];
  // ?
  loading: boolean;

  updateTitle: Function;
  updateDescription: Function;
  updateFocusKeyword: Function;
  // fb
  updateFacebookPublisher: Function;
  updateFacebookTitle: Function;
  updateFacebookDescription: Function;
  updateFacebookImage: Function;
  // twitter
  updateTwitterPublisher: Function;
  updateTwitterTitle: Function;
  updateTwitterDescription: Function;
  updateTwitterImage: Function;
  // google plus
  updateGooglePlusTitle: Function;
  updateGooglePlusPublisher: Function;
  updateGooglePlusImage: Function;

  // actionUseMetaForAll: Function;

  useSocialMetaForAll: boolean;
}

class SeoSettings extends React.Component<SeoSettingsProps> {

  render() {
    const props = this.props;

    const {
      currentPage,
      url,
      currentLanguage,
      pages,
    } = props;

    return (
      <div className="pageSeo">

        <Tabs type="card">
          <Tabs.TabPane tab="Seo" key="1">
            <GoogleControl
              currentPage={currentPage}
              pages={pages}

              image={props.image}

              title={props.title}
              description={props.description}
              focusKeyword={props.focusKeyword}

              updateTitle={props.updateTitle}
              updateDescription={props.updateDescription}
              updateFocusKeyword={props.updateFocusKeyword}
              rowFormItemLayout={rowFormItemLayout}

              // url={props.url}
              /*fullUrl={process.env.SEO_WIDGET_ADDRESS +
                '/' + currentRegion.externalId.toLowerCase() +
                '/' + currentLanguage.code.toLowerCase() +
                currentPage.url}*/
              // fullUrl={defaultUrl}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Facebook" key="2">
            <FacebookControl
              // useSocialMetaForAll={props.useSocialMetaForAll}

              title={props.facebookTitle}
              publisher={props.facebookPublisher}
              description={props.facebookDescription}
              image={props.facebookImage}

              updateTitle={props.updateFacebookTitle}
              updatePublisher={props.updateFacebookPublisher}
              updateDescription={props.updateFacebookDescription}
              updateImage={props.updateFacebookImage}

              rowFormItemLayout={rowFormItemLayout}
              // actionUseSocialMetaForAll={props.actionUseSocialMetaForAll}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Twitter" key="3">
            <TwitterControl
              // useSocialMetaForAll={props.useSocialMetaForAll}

              title={props.twitterTitle}
              publisher={props.twitterPublisher}
              description={props.twitterDescription}
              image={props.twitterImage}

              updateTitle={props.updateTwitterTitle}
              updatePublisher={props.updateTwitterPublisher}
              updateDescription={props.updateTwitterDescription}
              updateImage={props.updateTwitterImage}

              rowFormItemLayout={rowFormItemLayout}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Google+" key="4">
            <GooglePlusControl
              // useSocialMetaForAll={props.useSocialMetaForAll}

              title={props.googlePlusTitle}
              publisher={props.googlePlusPublisher}
              image={props.googlePlusImage}

              updateTitle={props.updateGooglePlusTitle}
              updatePublisher={props.updateGooglePlusPublisher}
              updateImage={props.updateGooglePlusImage}

              rowFormItemLayout={rowFormItemLayout}
            />
          </Tabs.TabPane>
        </Tabs>
        <Row style={{marginBottom: '35px'}}>
          <Col span={3} push={21}>
            <div style={{width: '100%'}}>
              {/*<SaveSeoButton loading={loading} stayOnPage={true} text={'Save page settings'} />*/}
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SeoSettings;

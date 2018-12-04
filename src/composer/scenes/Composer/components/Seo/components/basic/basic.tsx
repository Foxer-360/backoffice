import * as React from 'react';
import { Component } from 'react';

import { Alert, Col, Icon, Input, Row } from 'antd';
import { ColorResult, SwatchesPicker } from 'react-color';

import { getImgUrl } from '@source/composer/utils';
import { DefaultSeoContent } from '../../interfaces';

import InputWrap from '../inputWrap';
import UploadImage from '../MediaLibrary';

import './styles.scss';

interface GuideHint {
  okMessage: string;
  notOkMessage: string;
  ok: boolean;
}

interface Properties {
  seoData: DefaultSeoContent;
  change: (key: string, value: string) => void;
}

interface State {
  showColorPicker: boolean;
  mediaData: LooseObject;
}

class BasicSeo extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
    this.state = {
      showColorPicker: false,
      mediaData: null
    };
  }

  public render(): JSX.Element {
    const { seoData } = this.props;

    return (
      <Row>
        <h2>{'Basic SEO Settings'}</h2>
        <Col xs={24} xl={12} style={{ padding: '0 10px' }} id="parentRow">
          <InputWrap title="Title">
            <Input
              value={seoData.title}
              placeholder="Title of this page"
              onChange={this.changeText('title')}
            />
          </InputWrap>
          <InputWrap title="Description">
            <Input
              value={seoData.description}
              placeholder="What is this page about"
              onChange={this.changeText('description')}
            />
          </InputWrap>
          <InputWrap title="Keywords">
            <Input
              value={seoData.keywords}
              placeholder="Keywords help browsers to find your page"
              onChange={this.changeText('keywords')}
            />
          </InputWrap>
          <InputWrap title="Focus Keyword">
            <Input
              value={seoData.focusKeyword}
              placeholder="Keyword that describes this page"
              onChange={this.changeText('focusKeyword')}
            />
          </InputWrap>
          <InputWrap title="Theme Color">
            {this.state.showColorPicker && (
              <div style={{ marginBottom: 5 }}>
                <div
                  style={{ position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' }}
                  onClick={this.closeColorPicker}
                />
                <SwatchesPicker
                  color={seoData.themeColor || '#ffffff'}
                  height={150}
                  onChange={this.changeTheme('themeColor')}
                />
              </div>
            )}
            <Input
              value={seoData.themeColor}
              disabled={true}
              placeholder="Color of browser window on mobile devices"
              addonBefore={<div style={{ background: seoData.themeColor, width: 30, height: 20, borderRadius: 1 }} />}
              addonAfter={<Icon type="setting" onClick={this.openColorPicker} style={{ cursor: 'pointer' }} />}
            />
          </InputWrap>
          <InputWrap title="Default Image">
            <UploadImage
              mediaData={this.state.mediaData}
              onChange={this.mediaChange}
              mediaUrl={seoData.defaultImage}
            />
          </InputWrap>
        </Col>
        <Col xs={24} xl={12} style={{ padding: '0 10px' }}>
          <InputWrap title="Preview">
            {this.getPreview(seoData)}
          </InputWrap>
          <InputWrap title="Tips">
            {this.getGuide()}
          </InputWrap>
        </Col>
      </Row>
    );
  }

  private mediaChange = (mediaData: LooseObject) => {
    if (mediaData && mediaData.filename) {
      this.props.change('defaultImage', getImgUrl(mediaData));
    } else {
      this.props.change('defaultImage', '');
    }
    this.setState({ mediaData });
  }

  private changeText = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => this.props.change(key, e.target.value);

  private changeTheme = (key: string) => (color: ColorResult) => this.props.change(key, color.hex !== '#ffffff' ? color.hex : '');

  private openColorPicker = () => this.setState({ showColorPicker: true });

  private closeColorPicker = () => this.setState({ showColorPicker: false });

  private getGuide(): JSX.Element[] {
    const { seoData } = this.props;
    const keywords = seoData.keywords.split(',').map(a => a.trim().toLowerCase()).filter(a => !!a);
    const hints: GuideHint[] = [{
      okMessage: 'The focused keyword is in the title of the page.',
      notOkMessage: seoData.title.length ? 'The focused keyword is not in the title of the page.' : 'Missing title',
      ok: seoData.title.length ? seoData.title.toLowerCase().includes(seoData.focusKeyword.trim().toLowerCase()) : false
    }, /*{
      okMessage: 'The focused keyword is in the URL of the page.',
      notOkMessage: 'The focused keyword is not in the URL of the page.',
      ok: false
    },*/ {
      okMessage: 'The focused keyword is in the description of the page.',
      notOkMessage: seoData.description.length ? 'The focused keyword is not in the description of the page.' : 'Missing description',
      ok: seoData.description.length ? seoData.description.toLowerCase().includes(seoData.focusKeyword.trim().toLowerCase()) : false
    }, {
      okMessage: 'The length of the description is sufficient.',
      notOkMessage: 'The length of the description is not sufficient.',
      ok: seoData.description.length > 50
    }, {
      okMessage: 'Keywords are unique',
      notOkMessage:  keywords.length ? 'Keywords are not unique' : 'Missing keywords',
      ok: keywords.length ? !keywords.some(keyword => keywords.filter(item => item.includes(keyword)).length > 1) : false
    }];

    return hints.map((hint, key) => (
      <div key={key} style={{ padding: '5px 0' }}>
        <Alert
          message={hint.ok ? hint.okMessage : hint.notOkMessage}
          type={hint.ok ? 'success' : 'warning'}
        />
      </div>
    ));
  }

  private getPreview(seoData: DefaultSeoContent): JSX.Element {
    return (
      <div style={{ border: '1px solid #ccc', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #ccc', padding: '5px 10px' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '0 0 30px', color: '#666', fontSize: 20, paddingTop: 1 }}><Icon type="home" /></div>
            <div style={{ borderRadius: 24, background: '#f0f3f4', padding: '5px 15px', color: '#999', flex: '1' }}>
              {'https://'}<span style={{ color: '#333' }}>{'www.google.com'}</span>{'/search?q=amazing_website'}
            </div>
          </div>
        </div>
        <div style={{ padding: '20px 30px' }}>
          <div style={{ maxWidth: 600 }}>
            <div
              style={{
                borderRadius: 2,
                boxShadow: '0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08)',
                fontFamily: 'Arial',
                fontSize: 16,
                height: 44,
                padding: '10px 15px'
              }}
            >
              <div
                style={{
                  float: 'left',
                  maxWidth: 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {seoData.focusKeyword.trim() ? seoData.focusKeyword : 'SEO'}
              </div>
              <div style={{ float: 'right' }}><Icon style={{ color: '#4285f4', fontSize: 20, paddingTop: 2 }} type="search" /></div>
              <div style={{ clear: 'both' }} />
            </div>
            <br />
            <div
              style={{
                color: '#1a0dab',
                fontFamily: 'Arial',
                fontSize: 18,
                maxWidth: 469,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {seoData.title.trim() ? seoData.title : 'Search engine optimization'}
            </div>
            <div
              style={{
                color: '#006621',
                fontFamily: 'Arial',
                fontSize: 14,
                maxWidth: 469,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {`https://example.com/Search_engine_optimization`}
            </div>
            <div style={{ color: '#545454', fontSize: 13, fontFamily: 'Arial', maxHeight: 38, overflow: 'hidden' }}>
              {seoData.description.trim() ? seoData.description : `
                Search engine optimization (SEO) is the process of affecting the online
                visibility of a website or a web page in a web search engine's unpaid
                results—often referred to as "natural", "organic", or "earned" results.
              `}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default BasicSeo;
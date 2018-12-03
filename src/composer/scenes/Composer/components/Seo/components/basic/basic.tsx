import * as React from 'react';
import { Component } from 'react';

import { Col, Icon, Input, Row } from 'antd';
import { ColorResult, SwatchesPicker } from 'react-color';

import { DefaultSeoContent } from '../../interfaces';

import InputWrap from '../inputWrap';

import UploadImage from '../../../Editor/components/Sidebar/components/FormBuilder/components/MediaLibrary';

import './styles.scss';

interface Properties {
  seoData: DefaultSeoContent;
  change: (key: string, value: string) => void;
}

interface State {
  showColorPicker: boolean;
}

class BasicSeo extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
    this.state = { showColorPicker: false };
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
          <InputWrap title="Default Image">
            <Input
              value={seoData.defaultImage}
              placeholder="URL of the image"
              onChange={this.changeText('defaultImage')}
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
            {/* <UploadImage mediaData={null} name="asd" onChange={console.log} /> */}
          </InputWrap>
        </Col>
        <Col xs={24} xl={12} style={{ padding: '0 10px' }}>
          <InputWrap title="Preview">
            {this.getPreview(seoData)}
          </InputWrap>
        </Col>
      </Row>
    );
  }

  private changeText = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => this.props.change(key, e.target.value);

  private changeTheme = (key: string) => (color: ColorResult) => this.props.change(key, color.hex !== '#ffffff' ? color.hex : '');

  private openColorPicker = () => this.setState({ showColorPicker: true });

  private closeColorPicker = () => this.setState({ showColorPicker: false });

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
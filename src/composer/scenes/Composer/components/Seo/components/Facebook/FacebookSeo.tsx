import * as React from 'react';
import { Component } from 'react';

import { Col, Icon, Input, Row } from 'antd';

import { getImgUrl } from '@source/composer/utils';
import { FacebookSeoContent } from '../../interfaces';

import UploadImage from '../MediaLibrary';
import InputWrap from '../InputWrap';

import FacebookIcon from './fb.svg';
import Placeholder from '../../imageWhite.svg';

interface Properties {
  seoData: FacebookSeoContent;
  change: (key: string, value: string) => void;
}

interface State {
  mediaData: LooseObject;
}

class FacebookSeo extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
    this.state = { mediaData: null };
  }

  public render(): JSX.Element {
    const { seoData } = this.props;
    return (
      <Row>
        <h2>{'Facebook SEO Settings'}</h2>
        <Col xs={24} xl={12} style={{ padding: '0 10px' }}>
          <InputWrap title="Title">
            <Input
              value={seoData.title}
              placeholder="Page about some amazing stuffs"
              onChange={this.changeText('title')}
            />
          </InputWrap>
          <InputWrap title="Description">
            <Input
              value={seoData.description}
              placeholder="This page contains some important informations"
              onChange={this.changeText('description')}
            />
          </InputWrap>
          <InputWrap title="Image">
            <UploadImage
              mediaData={this.state.mediaData}
              onChange={this.mediaChange}
              mediaUrl={seoData.image}
            />
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

  private mediaChange = (mediaData: LooseObject) => {
    if (mediaData && mediaData.filename) {
      this.props.change('image', getImgUrl(mediaData));
    } else {
      this.props.change('image', '');
    }
    this.setState({ mediaData });
  }

  private changeText = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => this.props.change(key, e.target.value);

  private getPreview(seoData: FacebookSeoContent): JSX.Element {
    return (
      <div style={{ border: '1px solid #ccc', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #ccc', padding: '5px 10px' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '0 0 30px', color: '#666', fontSize: 20, paddingTop: 1 }}><Icon type="home" /></div>
            <div style={{ borderRadius: 24, background: '#f0f3f4', padding: '5px 15px', color: '#999', flex: '1' }}>
              {'https://'}<span style={{ color: '#333' }}>{'www.facebook.com'}</span>{'/'}
            </div>
          </div>
        </div>
        <div style={{ height: 42, background: '#4267b2' }}>
          <div style={{ padding: 9 }}>
            <img src={FacebookIcon} style={{ maxHeight: 24 }} />
          </div>
        </div>
        <div style={{ padding: '20px 30px', background: '#e9ebee' }}>
          <div style={{ maxWidth: 500, margin: 'auto' }}>
            <div style={{ border: '1px solid #dddfe2', borderRadius: 3, background: '#fff' }}>
              <div style={{ padding: 10 }}>
                <div>
                  <div
                    style={{
                      border: '1px solid #666',
                      borderRadius: 20,
                      color: '#666',
                      display: 'inline-block',
                      fontSize: 25,
                      height: 40,
                      textAlign: 'center',
                      width: 40,
                    }}
                  >
                    <Icon type="user" />
                  </div>
                  <div style={{ display: 'inline-block', verticalAlign: 'top', paddingLeft: 10 }}>
                    <div style={{ color: '#365899', fontWeight: 600, fontSize: 14 }}>{'Facebook User'}</div>
                    <div style={{ color: '#616770', fontSize: 12 }}>{'10 minutes ago'}</div>
                  </div>
                </div>
                <div style={{ paddingTop: 10, color: '#1d2129' }}>
                  {'Look at this page I found!'}
                </div>
              </div>
              <div>
                {seoData.image.trim() ? (
                  <img src={seoData.image} style={{ width: '100%' }} />
                ) : (
                    <div style={{ background: '#000' /*#4267b2*/ }}>
                      <img src={Placeholder} style={{ maxWidth: 300, margin: 'auto', display: 'block' }} />
                    </div>
                  )}
              </div>
              <div style={{ padding: 10, background: '#f2f3f5' }}>
                <div
                  style={{
                    color: '#606770',
                    fontSize: 12,
                    maxWidth: 447,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {'example.com'}
                </div>
                <div
                  style={{
                    color: '#1d2129',
                    fontSize: 16,
                    fontWeight: 600,
                    maxWidth: 447,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {seoData.title.trim() ? seoData.title : 'Search engine optimization'}
                </div>
                <div style={{ color: '#606770', fontSize: 14, maxHeight: 42, overflow: 'hidden' }}>
                  {seoData.description.trim() ? seoData.description : `
                  Search engine optimization (SEO) is the process of affecting the online
                  visibility of a website or a web page in a web search engine's unpaid
                  results—often referred to as "natural", "organic", or "earned" results.
                `}
                </div>
              </div>
              <div style={{ padding: 10, borderTop: '1px solid #dddfe2', color: '#606770', fontSize: 13 }}>
                <div style={{ float: 'left' }}>{'42 likes'}</div>
                <div style={{ float: 'right' }}>{'21 comments 3 shares'}</div>
                <div style={{ clear: 'both' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default FacebookSeo;
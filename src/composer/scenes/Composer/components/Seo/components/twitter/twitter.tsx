import * as React from 'react';
import { Component } from 'react';

import { Col, Icon, Input, Row } from 'antd';

import { TwitterSeoContent } from '../../interfaces';

import InputWrap from '../inputWrap';

import Placeholder from '../../image.svg';

interface Properties {
  seoData: TwitterSeoContent;
  change: (key: string, value: string) => void;
}

class TwitterSeo extends Component<Properties> {

  public render(): JSX.Element {
    const { seoData } = this.props;
    return (
      <Row>
        <h2>{'Twitter SEO Settings'}</h2>
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
            <Input
              value={seoData.image}
              placeholder="https://example.com/image.png"
              onChange={this.changeText('image')}
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

  private changeText = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => this.props.change(key, e.target.value);

  private getPreview(seoData: TwitterSeoContent): JSX.Element {
    return (
      <div style={{ border: '1px solid #ccc', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #ccc', padding: '5px 10px' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '0 0 30px', color: '#666', fontSize: 20, paddingTop: 1 }}><Icon type="home" /></div>
            <div style={{ borderRadius: 24, background: '#f0f3f4', padding: '5px 15px', color: '#999', flex: '1' }}>
              {'https://'}<span style={{ color: '#333' }}>{'www.twitter.com'}</span>{'/'}
            </div>
          </div>
        </div>
        <div style={{ height: 46, background: '#fff', borderBottom: '1px solid rgba(0, 0, 0, 0.3)' }}>
          <div style={{ paddingTop: 10, textAlign: 'center' }}>
            <Icon type="twitter" style={{ color: '#1ca1f2', fontSize: 24 }} />
          </div>
        </div>
        <div style={{ padding: '20px 30px', background: '#e5ecf0' }}>
          <div style={{ maxWidth: 590, margin: 'auto' }}>
            <div style={{ border: '1px solid #e6ecf0', background: '#fff', padding: 10 }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: '0 0 50px' }}>
                  <div
                    style={{
                      border: '1px solid #666',
                      borderRadius: 25,
                      color: '#666',
                      display: 'inline-block',
                      fontSize: 25,
                      height: 50,
                      paddingTop: 5,
                      textAlign: 'center',
                      width: 50,
                    }}
                  >
                    <Icon type="user" />
                  </div>
                </div>
                <div style={{ flex: '1', paddingLeft: 8 }}>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ color: '#14171a', fontSize: 14, fontWeight: 600 }}>{'Twitter User'}</span>
                    &nbsp;
                  <span style={{ color: '#657786', fontSize: 14 }}>{'@TwitterUser'}</span>
                    &nbsp;&#183;&nbsp;
                  <span style={{ color: '#657786', fontSize: 14 }}>{'10 minutes ago'}</span>
                  </div>
                  <div style={{ border: '1px solid #e1e8ed', borderRadius: 12, overflow: 'hidden' }}>
                    <div>
                      {seoData.image.trim() ? (
                        <img src={seoData.image} style={{ width: '100%' }} />
                      ) : (
                          <div style={{ background: '#fff' }}>
                            <img src={Placeholder} style={{ maxWidth: 300, margin: 'auto', display: 'block', width: '100%' }} />
                          </div>
                        )}
                    </div>
                    <div style={{ borderTop: '1px solid #e1e8ed', padding: '10px 15px' }}>
                      <div
                        style={{
                          color: '#000',
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 5,
                          maxWidth: 357,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {seoData.title.trim() ? seoData.title : 'Search engine optimization'}
                      </div>
                      <div
                        style={{
                          color: '#000',
                          fontSize: 14,
                          lineHeight: '16px',
                          marginBottom: 5,
                          maxHeight: 32,
                          maxWidth: 357,
                          overflow: 'hidden'
                        }}
                      >
                        {seoData.description.trim() ? seoData.description : `
                        Search engine optimization (SEO) is the process of affecting the online
                        visibility of a website or a web page in a web search engine's unpaid
                        results—often referred to as "natural", "organic", or "earned" results.
                      `}
                      </div>
                      <div
                        style={{
                          color: '#8899A6',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textTransform: 'lowercase',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {'example.com'}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 15 }}>
                    <div style={{ width: 80, display: 'inline-block', color: '#8899A6' }}>
                      <Icon style={{ marginRight: 10, fontSize: 16 }} type="message" />{'459'}
                    </div>
                    <div style={{ width: 80, display: 'inline-block', color: '#8899A6' }}>
                      <Icon style={{ marginRight: 10, fontSize: 16 }} type="retweet" />{'283'}
                    </div>
                    <div style={{ width: 80, display: 'inline-block', color: '#8899A6' }}>
                      <Icon style={{ marginRight: 10, fontSize: 16 }} type="heart" />{'735'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default TwitterSeo;
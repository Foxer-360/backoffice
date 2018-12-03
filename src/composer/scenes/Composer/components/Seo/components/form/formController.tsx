import * as React from 'react';
import { Component } from 'react';

import { SeoContent, SeoFormDataAndOperations, SeoFormState, SeoQueryData } from '../../interfaces';

interface Properties {
  seoData: SeoFormState;
  children: (data: SeoFormDataAndOperations) => JSX.Element;
}

interface State {
  content: SeoContent;
}

class FormController extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
    const content = this.getDefaultContent(props.seoData.seo.content);
    this.state = { content };
  }

  public updateDefault = (key: string, value: string): void => {
    const content = this.getContentWithoutReference();
    content[key] = value;
    this.setState({ content });
  }

  public updateFacebook = (key: string, value: string): void => {
    const content = this.getContentWithoutReference();
    content.facebook[key] = value;
    this.setState({ content });
  }

  public updateTwitter = (key: string, value: string): void => {
    const content = this.getContentWithoutReference();
    content.twitter[key] = value;
    this.setState({ content });
  }

  public saveSeoContent = (): Promise<QueryData<SeoQueryData>> => {
    const { seo, updateSeo, createSeo } = this.props.seoData;
    if (seo.id) {
      return updateSeo({ variables: { content: this.state.content, id: seo.id } });
    }
    return createSeo({ content: this.state.content });
  }

  public render(): JSX.Element {
    return this.props.children({
      content: this.state.content,
      saveSeoContent: this.saveSeoContent,
      updateDefault: this.updateDefault,
      updateFacebook: this.updateFacebook,
      updateTwitter: this.updateTwitter
    });
  }

  private getContentWithoutReference(): SeoContent {
    return JSON.parse(JSON.stringify(this.state.content));
  }

  private getDefaultContent(seoContent: SeoContent): SeoContent {
    return {
      defaultImage: seoContent && seoContent.defaultImage || '',
      description: seoContent && seoContent.description || '',
      facebook: {
        description: seoContent && seoContent.facebook && seoContent.facebook.description || '',
        image: seoContent && seoContent.facebook && seoContent.facebook.image || '',
        title: seoContent && seoContent.facebook && seoContent.facebook.title || ''
      },
      focusKeyword: seoContent && seoContent.focusKeyword || '',
      keywords: seoContent && seoContent.keywords || '',
      themeColor: seoContent && seoContent.themeColor !== '#ffffff' && seoContent.themeColor || '',
      title: seoContent && seoContent.title || '',
      twitter: {
        description: seoContent && seoContent.twitter && seoContent.twitter.description || '',
        image: seoContent && seoContent.twitter && seoContent.twitter.image || '',
        title: seoContent && seoContent.twitter && seoContent.twitter.title || '',
      }
    };
  }

}

export default FormController;
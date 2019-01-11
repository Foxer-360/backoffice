// tslint:disable:no-any

// data from plugin query
export interface SeoQueryData {
  id: string;
  plugin: string;
  content: SeoContent;
}

// data from seo form adopt component
export interface SeoFormQM {
  seo: QueryData<{ pagePlugins: SeoQueryData[] }>;
  createSeo: (data: { content: any }) => Promise<QueryData<{ createPagePlugin: SeoQueryData }>>;
  updateSeo: (data: { variables: { content: any, id: string } }) => Promise<QueryData<{ updatePagePlugin: SeoQueryData }>>;
}

// state of seo form
export interface SeoFormState {
  error?: Error;
  loading: boolean;
  seo: SeoQueryData;
  createSeo: (data: { content: any }) => Promise<QueryData<{ createPagePlugin: SeoQueryData }>>;
  updateSeo: (data: { variables: { content: any, id: string } }) => Promise<QueryData<{ updatePagePlugin: SeoQueryData }>>;
}

// data provided by seo form controller
export interface SeoFormDataAndOperations {
  content: SeoContent;
  updateDefault: (key: string, value: string) => void;
  updateFacebook: (key: string, value: string) => void;
  updateTwitter: (key: string, value: string) => void;
  saveSeoContent: () => void;
}

// data structure of `basic seo`
export interface DefaultSeoContent {
  title: string;
  description: string;
  themeColor: string;
  keywords: string;
  focusKeyword: string;
  defaultImage: string;
}

// data structure of `facebook seo`
export interface FacebookSeoContent {
  title: string;
  description: string;
  image: string;
}

// data structure of `twitter seo`
export interface TwitterSeoContent {
  title: string;
  description: string;
  image: string;
}

// seo controller seo content data structure
export interface SeoContent extends DefaultSeoContent {
  facebook: FacebookSeoContent;
  twitter: TwitterSeoContent;
}
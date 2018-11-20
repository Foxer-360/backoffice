export interface QueryVariables<T> {
  variables: T;
}

export interface Navigation {
  id: string;
  name: string;
}

export interface NavigationName {
  name: string;
}

export interface NavigationWithJoin extends NavigationName {
  website: {
    connect: {
      id: string;
    };
  };
}

export interface PageTranslation {
  id: string;
  language: {
    id: string;
    code: string;
  };
  url: string;
  name: string;
}

export interface RawNavigationPage {
  id: string;
  parent: {
    id: string;
  };
  translations: Array<PageTranslation>;
}

export interface NavigationPage {
  id: string;
  name: string;
  parent: string | null;
  url: string;
}

export interface NavigationNode {
  id?: string;
  page?: string;
  title?: string;
  link?: string;
  order?: number;
  parent: string | null;
}

export interface NavigationNodeWithJoin extends NavigationNode {
  navigation: {
    connect: {
      id: string;
    };
  };
}

export interface NavigationStructure {
  data: NavigationNodeWithJoin[];
  id: string;
}

export interface BuilderData {
  key: string;
  title: string;
  order?: number;
  children?: BuilderData[];
}
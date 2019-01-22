export interface QueryVariables<T> {
  variables: T;
}

export interface Tag {
  id: string;
  name: string;
  displayInNavigation: boolean;
  color: string;
  plugins: string[];
}

export interface Datasource {
  id: string;
  type: string;
  schema: LooseObject;
  displayInNavigation: boolean;
}

export interface TagName {
  name: string;
  displayInNavigation: boolean;
  color: string;
  plugins: string[];
}

export interface TagWithJoin extends TagName {
  website: {
    connect: {
      id: string;
    };
  };
}

export interface BuilderData {
  key: string;
  title: string;
  order?: number;
  children?: BuilderData[];
}
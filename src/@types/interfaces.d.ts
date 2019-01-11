interface LooseObject<T = any> {
  [key: string]: T;
}

interface QueryData<T> {
  loading: boolean;
  error?: Error;
  data: T;
}

interface StoreState extends LooseObject {
  env: LooseObject;
  router: LooseObject;
}

interface ReduxAction {
  type: string;
  payload: any;
}

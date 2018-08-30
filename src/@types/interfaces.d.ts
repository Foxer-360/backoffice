interface LooseObject<T = any> {
  [key: string]: T;
}

interface StoreState extends LooseObject {
  env: LooseObject;
  router: LooseObject;
}

interface ReduxAction {
  type: string;
  payload: any;
}

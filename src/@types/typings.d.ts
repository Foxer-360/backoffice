/**
 * Enable import JSON files in our Typescript code
 */
declare module '*.json' {
  // tslint:disable-next-line:no-any
  const value: any;
  export default value;
}

declare module "*.svg" {
  // tslint:disable-next-line:no-any
  const content: any;
  export default content;
}
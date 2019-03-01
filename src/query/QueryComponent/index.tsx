import * as React from 'react';

const { Component } = React;

// tslint:disable-next-line:no-any
const ChildrenType = (children: any) => {
  if (typeof children === 'function') {
    return 'function';
  }
  if (typeof children === 'string') {
    return 'string';
  }
  if (typeof children === 'number') {
    return 'number';
  }
  if (typeof children !== 'object') {
    return 'undefined';
  }

  if (Array.isArray(children)) {
    return 'array';
  } else {
    return 'object';
  }
};

class QueryComponent<P, S> extends Component<P, S> {

  buildProperties() {
    return {};
  }

  render() {
    let childType = ChildrenType(this.props.children);
    const buildedProperties = this.buildProperties();

    switch (childType) {
      case 'function':
        // tslint:disable-next-line:no-any
        const child = this.props.children as unknown as React.SFC<any>;
        return child(buildedProperties);
      case 'object':
        // tslint:disable-next-line:no-any
        return React.cloneElement(this.props.children as React.ReactElement<any>, buildedProperties);
      case 'array':
        const children = this.props.children as React.ReactNode[];
        // tslint:disable-next-line:no-any
        const childs: any[] = [];
        children.forEach((ch) => {
          const chType = ChildrenType(ch);
          switch (chType) {
            case 'function':
              // tslint:disable-next-line:no-any
              const chF = ch as React.SFC<any>;
              childs.push({...chF(buildedProperties), key: childs.length});
              break;
            case 'object':
            case 'array':
              childs.push({
                // tslint:disable-next-line:no-any
                ...React.cloneElement(ch as React.ReactElement<any>, buildedProperties),
                key: childs.length}
              );
              break;
            case 'string':
            case 'number':
              childs.push(ch);
              break;
            default:
              break;
          }
        }, this);

        return [...childs];
      case 'string':
      case 'number':
        return this.props.children;
      default:
        return null;
    }
  }

}

export default QueryComponent;

import * as React from 'react';

import { InjectedProps } from '@source/hoc/connectWithPageTypes';
import QueryComponent from '../QueryComponent';

class PageTypes extends QueryComponent<{} & InjectedProps, {}> {

  buildProperties() {
    return {
      types: this.props.types
    };
  }

}

export default PageTypes;

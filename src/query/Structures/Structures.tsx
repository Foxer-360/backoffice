import * as React from 'react';

import { InjectedProps } from '@source/hoc/connectWithStructures';
import QueryComponent from '../QueryComponent';

class Structures extends QueryComponent<{} & InjectedProps, {}> {

  buildProperties() {
    return {
      structures: this.props.structures
    };
  }

}

export default Structures;

import * as React from 'react';

import { InjectedProps } from '@source/hoc/connectWithLanguages';
import QueryComponent from '../QueryComponent';

class Languages extends QueryComponent<{} & InjectedProps, {}> {

  buildProperties() {
    return {
      languages: this.props.languages
    };
  }

}

export default Languages;

import * as React from 'react';
import Seo from '@source/plugins/Seo';

interface PluginProps {
  onChange: (data: LooseObject) => void;
  initData: LooseObject;
}

class UndefinedComponent extends React.Component<PluginProps, {}> {

  public render() {
    return <div>Undefined Component</div>;
  }

}

class PluginsService {

  public getPluginTabName(name: string): string {
    switch (name) {
      case 'seo':
        return 'SEO';
      default:
        return 'Undefined';
    }
  }

  public getPluginComponent(name: string): typeof UndefinedComponent {
    switch (name) {
      case 'seo':
        return Seo;
      default:
        return UndefinedComponent;
    }
  }

}

export default PluginsService;

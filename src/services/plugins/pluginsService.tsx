import * as React from 'react';

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
      default:
        return 'Undefined';
    }
  }

  public getPluginComponent(name: string): typeof UndefinedComponent {
    switch (name) {
      default:
        return UndefinedComponent;
    }
  }

}

export default PluginsService;

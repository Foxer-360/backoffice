import * as React from 'react';
const { Component } = React;
import { Transfer } from 'antd';
import { TransferItem } from 'antd/lib/transfer';
import { NavigationPage, NavigationNode } from '../../../../../interfaces';

interface Properties {
  pages: NavigationPage[];
  nodes: NavigationNode[];
  onChange: (nodes: NavigationNode[]) => void;
}

class Organizer extends Component<Properties> {

  getData(pages: NavigationPage[]): TransferItem[] {
    return pages.map((page: NavigationPage) => ({
      key: page.id,
      title: `${page.name} (${page.url})`
    }));
  }

  getKeys(nodes: NavigationNode[]): string[] {
    return nodes.map((node: NavigationNode) => (node.page));
  }

  getChildrenID(key: string, nodes: NavigationNode[]): string[] {
    const result: string[] = [];

    nodes.filter((a: NavigationNode) => (
      a.parent === key
    )).forEach((node: NavigationNode) => {
      result.push(node.page);
      this.getChildrenID(node.page, nodes).forEach((a: string) => result.push(a));
    });

    return result;
  }

  /**
   * Returns array of items that are in `array A` but not in `array B`
   */
  getArrayDiff(a: string[], b: string[]): string[] {
    const result: string[] = [];
    for (let i in a) {
      if (b.indexOf(a[i]) === -1) {
        result.push(a[i]);
      }
    }
    return result;
  }

  handleChange(keys: string[]): void {
    const nodes: NavigationNode[] = JSON.parse(JSON.stringify(this.props.nodes));
    const deprecated: string[] = this.getArrayDiff(this.getKeys(nodes), keys);
    const result: NavigationNode[] = [];

    const remove: string[] = [];
    deprecated.forEach((key: string) => {
      this.getChildrenID(key, nodes).forEach((a: string) => remove.push(a));
    });
    remove.forEach((key: string) => deprecated.push(key));

    const enable: string[] = this.getArrayDiff(keys, deprecated);

    enable.forEach((key: string) => {
      const node: NavigationNode = nodes.find((a: NavigationNode) => (a.page === key));
      if (node) {
        result.push(node);
      } else {
        result.push({ page: key, parent: null });
      }
    });

    this.props.onChange(result);
  }

  filter(input: string, item: TransferItem): boolean {
    let str: string = `${item.title.toLowerCase()} (${item.description.toLowerCase()})`;
    return str.indexOf(input.toLowerCase()) > -1;
  }

  render(): React.ReactNode {
    return (
      <Transfer
        dataSource={this.getData(this.props.pages)}
        targetKeys={this.getKeys(this.props.nodes)}
        onChange={(keys: string[]) => this.handleChange(keys)}
        showSearch={true}
        filterOption={this.filter}
        render={(item: TransferItem) => (item.title)}
        titles={['Disabled', 'Enabled']}
      />
    );
  }

}

export default Organizer;
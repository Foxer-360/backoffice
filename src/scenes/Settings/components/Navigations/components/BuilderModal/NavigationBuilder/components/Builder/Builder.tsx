import * as React from 'react';
const { Component } = React;
import { Tree } from 'antd';
import { AntTreeNodeMouseEvent } from 'antd/lib/tree';
import { NavigationPage, NavigationNode, BuilderData } from '../../../../../interfaces';

interface Properties {
  pages: NavigationPage[];
  nodes: NavigationNode[];
  structureChange: (data: NavigationNode[]) => void;
}

class Builder extends Component<Properties> {

  createDataTree(data: BuilderData[], nodes: NavigationNode[]): BuilderData[] {
    const result: BuilderData[] = [];

    nodes.forEach((node: NavigationNode) => {
      const segment = data.find((a: BuilderData) => (a.key === node.page));
      if (node.parent) {
        const parent = data.find((a: BuilderData) => (a.key === node.parent));
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(segment);
      } else {
        result.push(segment);
      }
    });

    return result;
  }

  sortChildren(data: BuilderData[]): void {
    data.forEach((segment: BuilderData) => {
      if (segment.children) {
        this.sortChildren(segment.children);
        segment.children.sort((a: BuilderData, b: BuilderData) => {
          const c = typeof a.order === 'number' ? a.order : 0;
          const d = typeof b.order === 'number' ? b.order : 0;
          return c - d;
        });
      }
    });
  }

  parseDataTree(data: BuilderData[], parent?: string): NavigationNode[] {
    const result: NavigationNode[] = [];

    data.forEach((segment: BuilderData, index: number) => {
      if (segment.children) {
        this.parseDataTree(segment.children, segment.key).forEach((node: NavigationNode) => {
          result.push(node);
        });
      }
      result.push({
        page: segment.key,
        order: index,
        parent: parent ? parent : null
      });
    });

    return result;
  }

  getData(): BuilderData[] {
    const data: BuilderData[] = [];
    const { pages, nodes } = this.props;

    nodes.forEach((node: NavigationNode) => {
      const page: NavigationPage = pages.find((a: NavigationPage) => (a.id === node.page));
      if (page) {
        data.push({
          key: page.id,
          title: `${page.name} (${page.url})`,
          order: node.order || 0
        });
      }
    });

    const result: BuilderData[] = this.createDataTree(data, nodes);
    this.sortChildren(result);

    return result;
  }

  dropLoop(
    data: BuilderData[],
    key: string,
    callback: (item: BuilderData, index: number, arr: BuilderData[]) => void
  ): void {
    data.forEach((item, index, arr) => {
      if (item.key === key) {
        return callback(item, index, arr);
      }
      if (item.children) {
        return this.dropLoop(item.children, key, callback);
      }
    });
  }

  // This has to be `LooseObject` because AntDesign@types sucks...
  onDrop(info: LooseObject): void {
    const dropKey: string = info.node.props.eventKey;
    const dragKey: string = info.dragNode.props.eventKey;
    const dropPos: string[] = info.node.props.pos.split('-');
    const dropPosition: number = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const data: BuilderData[] = this.getData();
    let dragObj: BuilderData;

    this.dropLoop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (info.dropToGap) {
      let arr: BuilderData[] = [];
      let index: number = 0;
      this.dropLoop(data, dropKey, (item, _index, _arr) => {
        arr = _arr;
        index = _index;
      });
      if (dropPosition === -1) {
        arr.splice(index, 0, dragObj);
      } else {
        arr.splice(index + 1, 0, dragObj);
      }
    } else {
      this.dropLoop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.push(dragObj);
      });
    }

    const result = this.parseDataTree(data);
    this.props.structureChange(result);
  }

  generateTree(data: BuilderData[]): React.ReactNode {
    return data.map((item: BuilderData) => {
      if (item.children && item.children.length) {
        return (
          <Tree.TreeNode key={item.key} title={item.title} >
            {this.generateTree(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode key={item.key} title={item.title} />;
    });
  }

  render(): React.ReactNode {
    return (
      <Tree
        className="draggable-tree"
        defaultExpandAll={true}
        showLine={true}
        draggable={true}
        onDrop={(info: AntTreeNodeMouseEvent) => this.onDrop(info)}
      >
        {this.generateTree(this.getData())}
      </Tree>
    );
  }
}

export default Builder;
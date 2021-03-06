import * as React from 'react';
const { Component } = React;
import { Row, Col, Tree, Button } from 'antd';
import { AntTreeNodeMouseEvent } from 'antd/lib/tree';
import { NavigationPage, NavigationNode, BuilderData } from '../../../../../interfaces';
import ExternalLink from './components/ExternalLink';

interface Properties {
  pages: NavigationPage[];
  nodes: NavigationNode[];
  structureChange: (data: NavigationNode[]) => void;
}

class Builder extends Component<Properties> {
  createDataTree(data: BuilderData[], nodes: NavigationNode[]): BuilderData[] {
    const result: BuilderData[] = [];

    nodes.forEach((node: NavigationNode, index: number) => {
      const segment = data.find((a: BuilderData) => a.key === node.page);

      if (node.parent) {
        const parent = data.find((a: BuilderData) => a.key === node.parent);

        if (!parent.children) {
          parent.children = [];
        }

        parent.children.push(segment);
      } else {
        if (!segment && node.title && node.link) {
          const externalLinkSegment = {
            key: node.key,
            order: node.order,
            title: node.title,
          };
          result.push(externalLinkSegment);
        }
        if (segment) {
          result.push(segment);
        }
      }
    });

    return result;
  }

  sortChildren(data: BuilderData[]): void {
    data.forEach((segment: BuilderData) => {
      if (segment && segment.children) {
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
    const { nodes } = this.props;

    data.forEach((segment: BuilderData, index: number) => {
      if (segment && segment.children) {
        this.parseDataTree(segment.children, segment.key).forEach((n: NavigationNode) => {
          result.push(n);
        });
      }

      const node = nodes.find((n: NavigationNode) => n.key === segment.key);
      if (segment) {
        result.push({
          key: segment.key,
          page: segment.key,
          order: index,
          title: node && node.title,
          link: node && node.link,
          parent: parent ? parent : null,
        });
      }
    });

    return result;
  }

  getData(): BuilderData[] {
    const data: BuilderData[] = [];
    const { pages, nodes } = this.props;

    nodes.forEach((node: NavigationNode, index: number) => {
      const page: NavigationPage = pages.find((a: NavigationPage) => a.id === node.page);

      if (page) {
        return data.push({
          key: page.id,
          title: page.name,
          order: node.order || 0,
        });
      }

      return data.push({
        key: node.key || Number(new Date()).toString(),
        title: node.title,
        link: node.link,
        order: node.order || 0,
      });
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
      this.dropLoop(data, dropKey, item => {
        item.children = item.children || [];
        item.children.push(dragObj);
      });
    }

    const result = this.parseDataTree(data);
    this.props.structureChange(result);
  }

  generateTree(data: BuilderData[], onLinkDelete: Function): React.ReactNode {
    const tree: React.ReactNode[] = [];

    if (data) {
      data.forEach((item: BuilderData) => {
        if (item) {
          if (item.children && item.children.length) {
            tree.push(
              <Tree.TreeNode key={item.key} title={item.title}>
                {this.generateTree(item.children, onLinkDelete)}
              </Tree.TreeNode>
            );
          } else {
            tree.push((
            <Tree.TreeNode 
              key={item.key} 
              title={(<div>
                  {item.title} {item.link && `(${item.link})`}
                  <Button 
                    type="danger"
                    size="small"
                    onClick={() => onLinkDelete(item.key, item.title)}
                    style={{ marginLeft: 10 }}
                  >
                    Remove
                  </Button>
                </div>)} 
            />));
          }
        }
      });
    }

    return tree;
  }

  onCreateExternalLink(data: LooseObject) {
    const newNodes = [...this.props.nodes];

    newNodes.push({
      page: null,
      order: null,
      parent: null,
      key: data.key || Number(new Date()).toString(),
      title: data.title || null,
      link: data.link || null,
    });

    this.props.structureChange(newNodes);
  }

  onLinkDelete = (key: string, title: string) => {
    const newNodes = [
      ...this.props.nodes.filter(
        n => (n.key !== key)
    )];
    this.props.structureChange(newNodes);
  }

  render(): React.ReactNode {
    return (
      <Row>
        <Col span={16} style={{ borderRight: '1px solid #DDD' }}>
          <Tree
            className="draggable-tree"
            defaultExpandAll={true}
            showLine={true}
            draggable={true}
            onDrop={(info: AntTreeNodeMouseEvent) => this.onDrop(info)}
          >
            {this.generateTree(this.getData(), this.onLinkDelete)}
          </Tree>
        </Col>
        <Col span={8} style={{ paddingLeft: '15px' }}>
          <ExternalLink onCreateNew={(data: LooseObject) => this.onCreateExternalLink(data)} />
        </Col>
      </Row>
    );
  }
}

export default Builder;

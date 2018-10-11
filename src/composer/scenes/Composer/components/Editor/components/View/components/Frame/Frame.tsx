import * as React from 'react';
import ReactFrame from 'react-frame-component';
import { IComponentsServiceLikeClass } from '../../../../../../Composer';

const FrameContentTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=0.5">
    <link rel="stylesheet" type="text/css" href="/frame.css"><styles-template>  </head>
  <body>
    <div id="mountHere"></div>
  </body>
</html>`;
const EmptyFrameContent = FrameContentTemplate.replace('<styles-template>', '\n');

const simpleStyle = {
  border: 'none',
  height: 'calc(100% * 1.69)',
  transform: 'scale(0.59)',
  transformOrigin: '0 0',
  width: 'calc(100% * 1.7)',
};

export interface IProperties {
  componentsService: IComponentsServiceLikeClass;
}

class Frame extends React.Component<IProperties, {}> {

  public render() {
    const initContent = this.generateFrameContent();

    return (
      <ReactFrame initialContent={initContent} mountTarget="#mountHere" style={simpleStyle}>
        <div>{this.props.children ? this.props.children : null}</div>
      </ReactFrame>
    );
  }

  private generateFrameContent(): string {
    if (!this.props.componentsService) {
      return EmptyFrameContent;
    }

    // tslint:disable-next-line:no-any
    const styles = (this.props.componentsService as any).getStyles() as string[];
    if (styles.length < 1) {
      return EmptyFrameContent;
    }
    const generated = this.generateStyleLinks(styles);

    const content = FrameContentTemplate.replace('<styles-template>', generated);
    return content;
  }

  private generateStyleLinks(styles: string[]) {
    let res = '\n';

    styles.forEach((style) => {
      res += `    <link rel="stylesheet" type="text/css" href="${style}">\n`;
    });

    return res;
  }

}

export default Frame;

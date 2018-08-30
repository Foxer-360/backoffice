import * as React from 'react';
import ReactFrame from 'react-frame-component';

const { Component } = React;

// Get style file for components
const styleFile = process.env.REACT_APP_COMPONENTS_STYLE;

const iFrameInitContent = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=0.5">
    <link rel="stylesheet" type="text/css" href="/frame.css">
    <link rel="stylesheet" type="text/css" href="${styleFile}">
  </head>
  <body>
    <div id="mountHere"></div>
  </body>
</html>`;

const simpleStyle = {
  border: 'none',
  width: 'calc(100% * 1.7)',
  transform: 'scale(0.59)',
  transformOrigin: '0 0',
  height: 'calc(100% * 1.7)'
  // height: 'calc((100vh - 225px) * 1.7)'
};

class Frame extends Component<{}, {}> {
  render() {

    return (
      <ReactFrame initialContent={iFrameInitContent} mountTarget="#mountHere" style={simpleStyle}>
        <div>{this.props.children ? this.props.children : null}</div>
      </ReactFrame>
    );
  }
}

export default Frame;

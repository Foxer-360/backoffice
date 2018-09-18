import React from 'react';

import './styles.css';

interface FacebookSnippetProps {
  image: string;
  title: string;
  url: string;
  description: string;
}

class FacebookSnippet extends React.Component<FacebookSnippetProps> {
  render() {
    return (
      <div className="c-facebookSnippet">
        <div className="c-facebookSnippet__image">
          <img
            height="100%"
            width="100%"
            src={this.props.image}
          />
        </div>
        <div className="c-facebookSnippet__content">
          <div className="c-facebookSnippet__content__title">
            {this.props.title}
          </div>
          <div className="c-facebookSnippet__content__text">
            {this.props.description}
          </div>
          <div className="c-facebookSnippet__content__author">
            {this.props.url}
          </div>
        </div>
      </div>
    );
  }
}

export default FacebookSnippet;

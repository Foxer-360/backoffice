import React from 'react';

import './styles.css';

interface GooglePlusSnippetProps {
  image: string;
  title: string;
}

class GooglePlusSnippet extends React.Component<GooglePlusSnippetProps> {
  render() {
    return (
      <div className="c-googlePlusSnippet">
        <div className="c-googlePlusSnippet__inner">
          <div className="c-googlePlusSnippet__head">
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/9f/Google_plus_icon.svg"/>
            <div className="c-googlePlusSnippet__head__author">
              <div className="c-googlePlusSnippet__head__author__name">
                Google+ user
              </div>
              <div className="c-googlePlusSnippet__head__author__type">
                <div className="c-googlePlusSnippet__head__author__type__arrow">
                  <svg viewBox="0 0 48 48" height="100%" width="100%">
                    <path d="M20 14l10 10-10 10z"/>
                  </svg>
                </div>
                Veřejné
              </div>
            </div>
            <div className="clearfix"/>
          </div>
          <div className="c-googlePlusSnippet__entry">
            Google+ user entry
          </div>
          <div className="c-googlePlusSnippet__title">
            {this.props.title}
          </div>
        </div>
        <div className="c-googlePlusSnippet__image">
          <img
            height="100%"
            width="100%"
            src={this.props.image}
          />
        </div>
      </div>
    );
  }
}

export default GooglePlusSnippet;
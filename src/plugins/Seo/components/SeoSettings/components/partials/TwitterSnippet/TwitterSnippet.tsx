import React from 'react';

import './styles.css';

interface TwitterSnippetProps {
  image: string;
  title: string;
  text: string;
}

class TwitterSnippet extends React.Component<TwitterSnippetProps> {

  render() {
    return (
      <div className="c-twitterSnippet">
        <div className="c-twitterSnippet__head">
          <div className="c-twitterSnippet__head__avatar">
            <img src="https://www.telefonica.com/telefonica-theme/images/custom/social/twitter_followus.png"/>
          </div>
          <div className="c-twitterSnippet__head__author">
            <div className="c-twitterSnippet__head__author__name">Twitter user</div>
            <div className="c-twitterSnippet__head__author__screenName">@TwitterUser</div>
          </div>
          <div className="clearfix"/>
        </div>
        <div className="c-twitterSnippet__title">
          Twitter user entry
        </div>
        <div className="c-twitterSnippet__content">
          <div className="c-twitterSnippet__content__image">
            <img
              height="100%"
              width="100%"
              src={this.props.image}
            />
          </div>
          <div className="c-twitterSnippet__content__inner">
            <div className="c-twitterSnippet__content__title">
              {this.props.title}
            </div>
            <div className="c-twitterSnippet__content__text">
              {this.props.text}
            </div>
            <div className="c-twitterSnippet__content__author">
              twitteruser.com
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TwitterSnippet;

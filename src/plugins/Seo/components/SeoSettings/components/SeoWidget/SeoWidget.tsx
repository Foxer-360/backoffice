import React, { Component } from 'react';
import axios from 'axios';
import striptags from 'striptags';

interface SeoWidgetProps {
  title?: string;
  description?: string;
  duplicated: boolean;
  focusKeyword?: string;
  fullUrl: string;
  pagesWithSameKeyword?: LooseObject[];
}

interface SeoWidgetState {
  pageContent: Document | null;
  checkArticlesContent: boolean;
  checkAltTags: boolean;
}

class SeoWidget extends Component<SeoWidgetProps, SeoWidgetState> {

  constructor(props: SeoWidgetProps) {
    super(props);

    this.state = {
      pageContent: null,
      checkArticlesContent: false,
      checkAltTags: false,
    };
  }

  checkValueIncludes(value: string) {
    const keyword = this.props.focusKeyword.toLowerCase();
    if (keyword.length > 0) {
      return value && value.toLowerCase().includes(keyword);
    } else {
      return false;
    }
  }

  checkValueLength(value: string) {
    return value.length !== 0 && value.length <= 160;
  }

  getPageContent = () => {
    const url = this.props.fullUrl;
    const parser = new DOMParser();

    return axios.get(url)
      .then((response) => {
        this.setState({
          pageContent: parser.parseFromString(response.data, 'text/html'),
        });
      })
      .catch((error) => {
        // console.log('PAGE CONTENT URL ERROR:', error);
      });
  }

  componentDidMount() {
    this.getPageContent();
  }

  componentWillReceiveProps(nextProps: SeoWidgetProps) {
    if (this.state.pageContent && nextProps.focusKeyword.length > 0) {
      const { focusKeyword } = nextProps;

      let pageContent = this.state.pageContent;

      // Check AltTags
      let images = Array.from(pageContent.getElementsByTagName('img'));
      for (let i = 0; i < images.length; i++) {
        this.setState({
          checkAltTags: images[i].alt.toLowerCase().includes(focusKeyword.toLowerCase()),
        });
      }

      // Check content
      if (focusKeyword.length > 0
        && (striptags(pageContent.body.innerHTML).split('sitewindow')[0])
          .toLowerCase().includes(focusKeyword.toLowerCase())) {
        this.setState({
          checkArticlesContent: true,
        });
      } else {
        this.setState({
          checkArticlesContent: false,
        });
      }
    }
  }

  render() {
    const { 
      title,
      description,
      fullUrl,
      // currentRegion,
      // currentWebsite
    } = this.props;

    const start = 'The focus keyword';

    return (
      <div>
        <ul className="seoWidget">
          <li>
            <span className={`circle ${this.checkValueIncludes(title) ? 'green' : 'red'}`} />
            {`${start} ${this.checkValueIncludes(title) ? 'IS' : 'is NOT'} on the title of the page.`}
          </li>
          <li>
            <span className={`circle ${this.checkValueIncludes(fullUrl) ? 'green' : 'red'}`} />
            {`${start} ${this.checkValueIncludes(fullUrl) ? 'IS' : 'is NOT'} in the URL of the page.`}
          </li>
          <li>
            <span className={`circle ${this.state.checkArticlesContent ? 'green' : 'red'}`} />
            {`${start} ${this.state.checkArticlesContent ? 'IS' : 'is NOT'} on the content of the article.`}
          </li>
          <li>
            <span className={`circle ${this.checkValueIncludes(description) ? 'green' : 'red'}`} />
            {`${start} ${this.checkValueIncludes(description) ? 'IS' : 'is NOT'} on the meta description.`}
          </li>
          <li>
            <span className={`circle ${this.checkValueLength(description) ? 'green' : 'red'}`} />
            {`The length of the meta description ${this.checkValueLength(description) ? 'IS' : 'is NOT'} sufficient.`}
          </li>
          <li>
            <span className={`circle ${this.state.checkAltTags ? 'green' : 'red'}`} />
            {`${start} ${this.state.checkAltTags ? 'IS' : 'is NOT'} on the alt tag of the images.`}
          </li>
          <li>
            <span className={`circle ${this.props.pagesWithSameKeyword.length === 0 ? 'green' : 'red'}`} />
            {`${this.props.pagesWithSameKeyword.length === 0 ? 
              'You\'ve never used this keyword before, very good.' :
              'You\'ve used this keyword before in these pages:'}`}
              <ul>
                {this.props.pagesWithSameKeyword.map(p => (
                <li>
                  {/*/page/${currentRegion.id}/${currentWebsite.id}/${p.langId}/${p.structureId}`*/}
                  <a href="">
                    {p.name}
                  </a>
                </li>))}
              </ul>
          </li>
        </ul>
      </div>

    );
  }
}

export default SeoWidget;

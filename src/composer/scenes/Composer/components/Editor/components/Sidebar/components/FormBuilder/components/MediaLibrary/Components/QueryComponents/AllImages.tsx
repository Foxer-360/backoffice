import { notification } from 'antd';
import axios from 'axios';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IAllImagesState {
  // tslint:disable:no-any
  images: any[];
  loading: boolean;
  offset: number;
  limit: number;
  query: string;
}

class AllImages extends React.Component<{}, IAllImagesState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      images: [],
      loading: false,
      limit: 15,
      offset: 1,
      query: null,
    };
  }

  public componentDidMount() {
    this.fetchImages();
  }

  public fetchImages = () => {
    this.setState({
      loading: true,
    });

    axios({
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      method: 'get',
      url: `${process.env.REACT_APP_MEDIA_LIBRARY_SERVER}/find${'?category=' +
        process.env.REACT_APP_MEDIA_LIBRARY_SERVER__CATEGORY}/`,
    })
      .then(response => {
        this.setState({ images: response.data.files, loading: false });
      })
      .catch(response => {
        this.setState({ loading: false });
        notification.error({
          description: 'There was an error fetching images',
          message: 'Error',
        });
      });
  }

  public changePage = pageNum => {
    this.setState({ offset: pageNum });
  }

  public paginateImages = () => {
    let images = this.state.images;

    if (this.state.query && this.state.query.length > 0) {
      images = images.filter(image => image.filename.includes(this.state.query));
    }

    return images.filter(
      (image, i) => i + 1 > this.state.limit * (this.state.offset - 1) && i + 1 <= this.state.limit * this.state.offset
    );
  }

  public search = (query: string) => {
    this.setState({
      query: query,
    });
  }

  public render() {
    const children = React.Children.map(this.props.children, (child, index) => {
      // tslint:disable:no-any
      return React.cloneElement(child as React.ReactElement<any>, {
        images: this.paginateImages(),
        refetch: this.fetchImages,
        loading: this.state.loading,
        changePage: this.changePage,
        currentPage: this.state.offset,
        totalImages: this.state.images.length,
        imagesPerPage: this.state.limit,
        search: this.search,
        searchQuery: this.state.query,
      });
    });

    return <>{children}</>;
  }
}

export default AllImages;

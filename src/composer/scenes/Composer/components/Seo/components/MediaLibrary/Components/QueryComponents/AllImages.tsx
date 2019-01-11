import { notification } from 'antd';
import axios from 'axios';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IAllImagesState {
  // tslint:disable:no-any
  images: any[];
}

class AllImages extends React.Component<{}, IAllImagesState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      images: [],
    };
  }

  public componentDidMount() {
    axios({
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      method: 'get',
      url: `${process.env.REACT_APP_MEDIA_LIBRARY_SERVER}/find`,
    })
      .then(response => {
        this.setState({ images: response.data.files });
      })
      .catch(response => {
        notification.error({
          description: 'There was an error fetching images',
          message: 'Error',
        });
      });
  }

  public render() {
    const children = React.Children.map(this.props.children, (child, index) => {
      // tslint:disable:no-any
      return React.cloneElement(child as React.ReactElement<any>, {
        images: this.state.images,
      });
    });

    return <>{children}</>;
  }
}

export default AllImages;

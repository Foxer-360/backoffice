import { ILooseObject } from '@source/composer/types';
import { notification } from 'antd';
import axios from 'axios';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IUploadImageProps {
  closeEditor?: () => void;
  onChange?: (media: object) => void;
}

export interface IUploadImageState {
  loading: boolean;

  uploadImage?: (fileList: ILooseObject) => void;
}

class UploadImage extends React.Component<IUploadImageProps, IUploadImageState> {
  constructor(props: IUploadImageProps) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  public uploadImage = (fileList: ILooseObject, mediaData: ILooseObject) => {
    const formData = new FormData();

    // tslint:disable:no-any
    fileList.forEach((file: any) => {
      formData.append('file', file);
      formData.append('category', process.env.REACT_APP_MEDIA_LIBRARY_SERVER__CATEGORY);
    });

    this.setState({ loading: true });

    axios({
      data: formData,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
      },
      method: 'post',
      url: `${process.env.REACT_APP_MEDIA_LIBRARY_SERVER}/upload`,
    })
      .then(response => {
        this.setState({ loading: false });
        const file = response.data.createFile ? response.data.createFile : response.data.file;
        const image = { ...mediaData, value: file, name: 'image' };

        if (response.data.createFile) {
          notification.success({
            description: 'Image uploaded successfully',
            message: 'Success',
          });
        } else {
          notification.success({
            description: 'Image updated',
            message: 'Success',
          });
        }

        if (this.props.onChange) {
          this.props.onChange(image);
        }
        if (this.props.closeEditor) {
          this.props.closeEditor();
        }

      })
      .catch(() => {
        this.setState({ loading: false });
        notification.error({
          description: 'Could not upload image',
          message: 'Error',
        });
      });
  }

  public render() {
    const children = React.Children.map(this.props.children, (child, index) => {
      // tslint:disable:no-any
      return React.cloneElement(child as React.ReactElement<any>, {
        loading: this.state.loading,
        uploadImage: this.uploadImage,
      });
    });

    return <>{children}</>;
  }
}

export default UploadImage;

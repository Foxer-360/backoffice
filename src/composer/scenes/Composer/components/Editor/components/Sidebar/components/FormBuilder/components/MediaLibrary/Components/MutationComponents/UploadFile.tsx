import { ILooseObject } from '@source/composer/types';
import { notification } from 'antd';
import axios from 'axios';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IUploadFileProps {
  closeEditor?: () => void;
  onChange?: (media: object) => void;
}

export interface IUploadFileState {
  loading: boolean;
  uploadFile?: (fileList: ILooseObject) => void;
}

class UploadFile extends React.Component<IUploadFileProps, IUploadFileState> {
  constructor(props: IUploadFileProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  public uploadFile = (fileList: ILooseObject, mediaData: ILooseObject) => {
    const formData = new FormData();

    // tslint:disable:no-any
    fileList.forEach((file: any) => {
      formData.append('file', file);
    });

    this.setState({ loading: true });

    axios({
      data: formData,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'multipart/form-data',
      },
      method: 'post',
      url: `/upload`,
    })
      .then(response => {
        this.setState({ loading: false });
        const file = response.data.createFile ? response.data.createFile : response.data.file;
        const CompleteFile = { value: { ...file, ...mediaData }, name: 'image' };

        if (response.data.createFile) {
          notification.success({
            description: 'File Uploaded Successfully',
            message: 'Success',
          });
        } else {
          notification.success({
            description: 'File Updated',
            message: 'Success',
          });
        }

        if (this.props.onChange) {
          this.props.onChange(CompleteFile);
        }
        if (this.props.closeEditor) {
          this.props.closeEditor();
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        notification.error({
          description: 'Could not upload file',
          message: 'Error',
        });
      });
  }

  public render() {
    const children = React.Children.map(this.props.children, (child, index) => {
      // tslint:disable:no-any
      return React.cloneElement(child as React.ReactElement<any>, {
        loading: this.state.loading,
        uploadFile: this.uploadFile,
      });
    });

    return <>{children}</>;
  }
}

export default UploadFile;

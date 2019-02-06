import { notification } from 'antd';
import axios from 'axios';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IAllFilesState {
  // tslint:disable:no-any
  files: any[];
  loading: boolean;
  offset: number;
  limit: number;
}

class AllFiles extends React.Component<{}, IAllFilesState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      files: [],
      loading: false,
      limit: 15,
      offset: 1,
    };
  }

  public componentDidMount() {
    this.fetchFiles();
  }

  public fetchFiles = () => {
    this.setState({
      loading: true,
    });

    axios({
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      method: 'get',
      url: `${process.env.REACT_APP_MEDIA_LIBRARY_SERVER}/find${'?category=' +
        process.env.REACT_APP_MEDIA_LIBRARY_SERVER__CATEGORY}/docs/`,
    })
      .then(response => {
        this.setState({ files: response.data.files, loading: false });
      })
      .catch(response => {
        this.setState({ loading: false });
        notification.error({
          description: 'There was an error fetching files',
          message: 'Error',
        });
      });
  }

  public changePage = pageNum => {
    this.setState({ offset: pageNum });
  }

  public paginateFiles = () => {
    return this.state.files.filter(
      (file, i) => i + 1 > this.state.limit * (this.state.offset - 1) && i + 1 <= this.state.limit * this.state.offset
    );
  }

  public render() {
    const children = React.Children.map(this.props.children, (child, index) => {
      // tslint:disable:no-any
      return React.cloneElement(child as React.ReactElement<any>, {
        files: this.paginateFiles(),
        refetch: this.fetchFiles,
        loading: this.state.loading,
        changePage: this.changePage,
        currentPage: this.state.offset,
        totalFiles: this.state.files.length,
        filesPerPage: this.state.limit,
      });
    });

    return <>{children}</>;
  }
}

export default AllFiles;

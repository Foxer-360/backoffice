import * as React from 'react';

import AnnotationForm from './components/AnnotationForm';

const { Component } = React;

const mockData = [
  { key: 'title', value: 'Home Page' },
  { key: 'perex', value: '' },
  { key: 'image', value: 'https://www.walkervillevet.com.au/wp-content/uploads/2018/05/rabbit-eating-carrot.jpg' },
];

// tslint:disable-next-line:no-any
const change = (e: any) => {
  mockData[0].value = 'Home Page #NEW';
};

// tslint:disable-next-line:no-any
class Annotation extends Component<{}, any> {

  constructor(props: {}) {
    super(props);

    this.state = {
      mock: [
        ...mockData
      ]
    };

    this.changeData = this.changeData.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  changeData() {
    const mock = [...this.state.mock];
    mock[0] = {
      key: 'title',
      value: 'Home Page #NEW'
    };

    this.setState({
      mock
    });
  }

  handleChange(changes: LooseObject) {
    let mock = this.state.mock.filter((p) => {
      let use = true;
      changes.remove.forEach((e) => {
        if (e.key === p.key) {
          use = false;
        }
      });

      return use;
    });

    mock = mock.map((p) => {
      let res = p;
      changes.update.forEach((e) => {
        if (e.key === p.key) {
          res = e;
        }
      });

      return res;
    });

    changes.add.forEach((p) => mock.push(p));

    this.setState({ mock: [...mock] });
  }

  render() {
    console.log('MOCK: ', this.state.mock);

    return (
      <div>
        <AnnotationForm
          records={this.state.mock}
          onSave={this.handleChange}
        />
        <button
          onClick={this.changeData}
        >
          Change Props
        </button>
      </div>
    );
  }

}

export default Annotation;

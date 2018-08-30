import * as React from 'react';
import { isEqual } from 'lodash';
import { ComponentsServiceLikeClass, EditorInfo, LockInfo } from '../../../../../../Composer';
import UserEditor from './components/UserEditor';

const { Component } = React;

export interface Properties {
  // Position of component in content array
  position: number;
  // This is array of whole content in compoer. This is connected from Redux
  content: Array<LooseObject>;
  // This is component name that will be rendered
  name: string;
  id: number;
  componentsService: ComponentsServiceLikeClass;

  container?: string; // ID of container owner

  // Additional informations about other editors and
  // locks of components
  editors?: EditorInfo[];
  locks?: LockInfo[];
  me?: string; // My ID used in editors and locks

  onEdit: (id: number) => Promise<boolean>;
  onRemove: (id: number) => void;
  dragStart: (data: LooseObject) => void;
  dragEnd: () => void;
}

export interface State {
  // Flag if component is dragging
  isDragging: boolean;
  // Local component content
  componentContent: LooseObject;
}

interface RenderErrorCatcherState {
  hasError: boolean;
  // tslint:disable-next-line:no-any
  error: any;
  // tslint:disable-next-line:no-any
  errorInfo: any;
}
class RenderErrorCatcher extends Component<{}, RenderErrorCatcherState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      error: null,
      errorInfo: null,
      hasError: false,
    };
  }

  public componentWillReceiveProps() {
    this.setState({
      hasError: false
    });
  }

  componentDidMount() {
    this.setState({
      hasError: false
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="composer-error-render">
          <h2>Component Render Failed !</h2>
          <details>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }

  // tslint:disable-next-line:no-any
  public componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
      hasError: true,
    });
  }

}

/**
 * Component that wrap component in Composer content and
 * drive all component behiever, like editing or re-rendering
 */
class Wrapper extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    // Get component content and save it
    const content = { ...props.content[props.position] };
    this.state = {
      isDragging: false,
      componentContent: content
    };

    // Bind this for some functions
    this.handleEdit = this.handleEdit.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  componentWillReceiveProps(nextProps: Properties) {
    // Get component content and save it if it's different
    const content = { ...nextProps.content[nextProps.position] };

    if (!isEqual(content, this.state.componentContent)) {
      this.setState({
        componentContent: content
      });
    }
  }

  shouldComponentUpdate(nextProps: Properties, nextState: State) {
    // Component should update only if data will change. Otherwise re-render is
    // no neccessary

    // If component is dragging
    if (this.state.isDragging !== nextState.isDragging) {
      return true;
    }

    // Position of component was changed
    if (this.props.position !== nextProps.position) {
      return true;
    }

    // Content of component was changed
    const content = nextProps.content[nextProps.position];
    if (!isEqual(content, this.state.componentContent)) {
      return true;
    }

    // If locked is changed
    if (!this.props.locks && nextProps.locks) {
      return true;
    }

    if (this.props.locks && nextProps.locks) {
      const id = this.props.id;
      const predicate = (l: LockInfo) => {
        if (l.id === id) {
          return true;
        }

        return false;
      };
      const f1 = nextProps.locks.find(predicate);
      const f2 = this.props.locks.find(predicate);

      if (f1 !== f2) {
        return true;
      }
    }

    // Otherwise re-render is no neccessary
    return false;
  }

  handleEdit() {
    this.props.onEdit(this.props.id);
  }

  handleRemove() {
    this.props.onRemove(this.props.id);
  }

  // tslint:disable-next-line:no-any
  handleDragStart(e: any) {
    const data = {
      pos: this.props.position * 2 + 1,
      index: this.props.id,
      container: this.props.container,
    };

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    canvas.width = 300;
    canvas.height = 60;

    context.beginPath();
    context.lineWidth = 10;
    context.strokeStyle = 'blue';
    context.rect(5, 5, 150, 30);
    context.stroke();
    context.fillStyle = '#73d13d';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = 'bold 15px Roboto';
    context.textAlign = 'center';
    context.fillText('Drag Component...', 150, 30);

    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.setDragImage(canvas, 150, 30);

    if (this.props.dragStart) {
      this.props.dragStart(data);
    }

    this.setState({ isDragging: true });
  }

  // tslint:disable-next-line:no-any
  handleDragEnd(e: any) {
    if (this.props.dragEnd) {
      this.props.dragEnd();
    }

    this.setState({
      isDragging: false
    });
  }

  render() {
    // tslint:disable-next-line:no-console
    console.log(`[RENDER] Wrapper at position ${this.props.position}`, this.props.locks);
    // Get component instance from component service
    const Comp = this.props.componentsService.getComponent(this.props.name);
    // Simple style for wrapper
    let wrapperStyle = {
      opacity: this.state.isDragging ? 0.3 : 1,
      height: 'auto'
    } as React.CSSProperties;

    // Check if it's locked and get ID of user who lock it
    let locked = false;
    let editor = null as string;

    // Check locks
    if (this.props.locks) {
      this.props.locks.forEach((l: LockInfo) => {
        if (l.editorId === this.props.me) {
          return;
        }

        if (l.id === this.props.id) {
          // tslint:disable-next-line:no-console
          console.log(`Component ${this.props.id} is locked`);
          locked = true;
          editor = l.editorId;
        }
      });
    }

    return (
      <div style={wrapperStyle} draggable={true} onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd}>
        {/* There is control for component */}
        <div className="wrapper-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="ui-button" onClick={this.handleEdit} disabled={locked}>
              Edit
            </button>
            <button className="ui-button red" onClick={this.handleRemove} disabled={locked}>
              Remove
            </button>
            <div className="editMove" />
          </div>
          {locked ? (
            <div style={{ float: 'right', marginRight: '16px' }}>
              <UserEditor editors={this.props.editors} id={editor} />
            </div>
          ) : null}
        </div>

        {/* There is component */}
        <RenderErrorCatcher>
          <Comp data={this.props.content[this.props.position].data} />
        </RenderErrorCatcher>
      </div>
    );
  }
}

export default Wrapper;

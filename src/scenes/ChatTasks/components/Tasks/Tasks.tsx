import * as React from 'react';
import { Button, Col, Input, List, Modal, Popconfirm, Row, Switch, Checkbox, Tag, Icon, Divider } from 'antd';

const { Component } = React;

export interface Properties {
  tasks?: TaskItem[];
  subscribe?: () => void;
  refetch?: () => void;

  onRemove?: (id: string) => void;
  onEdit?: (id: string, task: LooseObject) => void;
  onCreate?: (task: LooseObject) => void;
  onToggleDone?: (id: string, done: boolean) => void;
}

export interface State {
  showFinished: boolean;
  unfinishedFirst: boolean;
  visibleModal: boolean;
  editedTaskId: string;
  taskForm: {
    name: string;
    description: string;
  };
}

export interface TaskItem {
  id: string;
  name: string;
  description: string;
  done: boolean;
  updatedAt: Date;
  user?: LooseObject;
  pageTranslation?: LooseObject;
}

const Title = (name: string, date: Date) => (
  <div>
    {name}
    <span className="task-title-date">{date.toDateString()}</span>
  </div>
);

const ListRenderItem = (
  edit: (id: string, task: LooseObject) => void,
  toggle: (id: string, status: boolean) => void,
  remove: (id: string) => void
) => (item: TaskItem) => (
  <List.Item style={{ borderBottom: '1px solid e8e8e8', borderTop: ' 1px solid e8e8e8' }}>
    {/* <List.Item.Meta title={Title(item.name, item.updatedAt)} description={item.description} />
     */}
    <>
      <div className={'dashBoard__card__task'}>
        <div className={'dashBoard__card__task__main'}>
          <Checkbox checked={item.done} onChange={() => toggle(item.id, !item.done)}>
            <span style={{ fontSize: '17px' }}>{item.name}</span>
          </Checkbox>
          <span className={'dueDate'}>
            <Icon style={{ marginRight: '5px' }} type={'clock-circle'} />
            {item.updatedAt.toLocaleDateString()}
          </span>
        </div>

        <div className={'dashBoard__card__task__detail'}>
          {item.user && item.user.name && <span style={{ color: '#c6c6c6' }}>By {item.user.name}</span>}

          <div>
            <Icon type={'tag'} />
            <span>
              {item.pageTranslation && <Tag color="geekblue">{item.pageTranslation && item.pageTranslation.name}</Tag>}
            </span>
          </div>
        </div>

        {item.description && <p className={'dashBoard__card__task__desc'}>{item.description}</p>}

        <div className={'dashBoard__card__task__hover'}>
          <Button
            type="primary"
            size="small"
            icon="edit"
            style={{ marginRight: '8px' }}
            onClick={() => edit(item.id, { name: item.name, description: item.description })}
          />

          <Popconfirm title="Are you sure to delete this task?" onConfirm={() => remove(item.id)}>
            <Button type="danger" size="small" icon="delete" />
          </Popconfirm>
        </div>
      </div>
    </>
  </List.Item>
);

class Tasks extends Component<Properties, State> {
  private RESET_STATE = {
    showFinished: false,
    unfinishedFirst: false,
    visibleModal: false,
    editedTaskId: null,
    taskForm: {
      ...this.RESET_FORM,
    },
  } as State;

  private RESET_FORM = {
    name: '',
    description: '',
  };

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.RESET_STATE,
    };

    this.handleFinishedFilterSwitch = this.handleFinishedFilterSwitch.bind(this);
    this.handleUnfinishedFirstSwitch = this.handleUnfinishedFirstSwitch.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleCreateTask = this.handleCreateTask.bind(this);
    this.handleFormValueChange = this.handleFormValueChange.bind(this);
    this.handleDeleteTask = this.handleDeleteTask.bind(this);
    this.handleTaskCreateEdit = this.handleTaskCreateEdit.bind(this);
    this.handleToggleDone = this.handleToggleDone.bind(this);
    this.handleEditTask = this.handleEditTask.bind(this);
  }

  public componentDidMount() {
    // If refetch is available than refetch data
    if (this.props.refetch) {
      this.props.refetch();
    }
    // Subscribe to chagnes in tasks
    if (this.props.subscribe) {
      this.props.subscribe();
    }
  }

  public render() {
    const data = this.filteredAndSortedData();

    const labelSize = 5;
    const labelStyle = { padding: '6px 12px' } as React.CSSProperties;

    return (
      <>
        {/* Filters and other header staff */}
        <div
          style={{
            marginBottom: '6px',
          }}
        >
          <div
            style={{
              margin: '12px 0 12px',
              display: 'flex',
              justifyContent: 'space-between',
              paddingRight: '25px',
            }}
          >
            <span>Show finished tasks</span>
            <Switch checked={this.state.showFinished} onChange={this.handleFinishedFilterSwitch} />
          </div>

          {/*** Do not display this filter right now.
          <div
            style={{
              margin: '12px 0 12px',
              display: 'flex',
              justifyContent: 'space-between',
              paddingRight: '25px',
            }}
          >
            <span>Unfinished tasks first</span>
            <Switch checked={this.state.unfinishedFirst} onChange={this.handleUnfinishedFirstSwitch} />
          </div>
           */}
        </div>

        <Divider type="horizontal" />

        {/* List with tasks */}
        <div style={{ overflowY: 'scroll', overflowX: 'hidden', paddingRight: '8px' }}>
          <List
            itemLayout={'vertical'}
            dataSource={data}
            renderItem={ListRenderItem(this.handleEditTask, this.handleToggleDone, this.handleDeleteTask)}
            locale={{ emptyText: 'No tasks to show' }}
          />
        </div>

        <Divider type="horizontal" />

        {/* Bottom control panel */}
        <div style={{ display: 'block-inline', textAlign: 'center' }}>
          <Button type="ghost" onClick={this.handleCreateTask} style={{}}>
            <Icon type="plus" /> Create new task
          </Button>
        </div>

        {/* Modal for creating/editing */}
        <Modal
          title={this.state.editedTaskId ? 'Edit Task' : 'Create New Task'}
          visible={this.state.visibleModal}
          okText={this.state.editedTaskId ? 'Save' : 'Create'}
          className="tasks-modal"
          onCancel={this.handleModalClose}
          onOk={this.handleTaskCreateEdit}
        >
          <Row>
            <Col span={labelSize} style={labelStyle}>
              <span>Task name</span>
            </Col>
            <Col span={24 - labelSize}>
              <Input
                value={this.state.taskForm.name}
                onChange={e => this.handleFormValueChange('name', e.target.value)}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: '12px' }}>
            <Col span={labelSize} style={labelStyle}>
              <span>Description</span>
            </Col>
            <Col span={24 - labelSize}>
              <Input.TextArea
                placeholder="Short description of this task..."
                autosize={{ minRows: 2, maxRows: 6 }}
                value={this.state.taskForm.description}
                onChange={e => this.handleFormValueChange('description', e.target.value)}
              />
            </Col>
          </Row>
        </Modal>
      </>
    );
  }

  private filteredAndSortedData() {
    // Map f-ce to transform date into Date object
    const transform = (t: TaskItem) => ({ ...t, updatedAt: new Date(t.updatedAt) });

    // Filter f-ce to filter finished tasks
    const filterFinished = (t: TaskItem) => !t.done;

    // Sort f-ce to sort by date DESC
    const sortByDate = (a: TaskItem, b: TaskItem) => (a.updatedAt < b.updatedAt ? 1 : -1);

    // Sort f-ce to sort unfinished tasks before finished
    const sortUnfinishedUp = (a: TaskItem, b: TaskItem) => Number(!b.done && a.done);

    // Default data format
    let data = this.props.tasks.map(transform).sort(sortByDate);

    // If finished are filtered
    if (!this.state.showFinished) {
      data = data.filter(filterFinished);
    } else if (this.state.unfinishedFirst) {
      // If finished are showed and unfinished filter first is on
      data = data.sort(sortUnfinishedUp);
    }

    return data;
  }

  private handleFinishedFilterSwitch(checked: boolean) {
    this.setState({
      showFinished: checked,
    });
  }

  private handleUnfinishedFirstSwitch(checked: boolean) {
    this.setState({
      unfinishedFirst: checked,
    });
  }

  private handleEditTask(id: string, { name, description }: { name: string; description: string }) {
    this.setState({
      editedTaskId: id,
      visibleModal: true,
      taskForm: {
        name,
        description,
      },
    });
  }

  private handleCreateTask() {
    this.setState({
      editedTaskId: null,
      visibleModal: true,
      taskForm: {
        ...this.RESET_FORM,
      },
    });
  }

  private handleFormValueChange(type: string, value: string) {
    this.setState({
      taskForm: {
        ...this.state.taskForm,
        [type]: value,
      },
    });
  }

  private handleModalClose() {
    this.setState({
      visibleModal: false,
    });
  }

  private handleDeleteTask(id: string) {
    if (this.props.onRemove) {
      this.props.onRemove(id);
    }
  }

  private handleTaskCreateEdit() {
    if (this.state.editedTaskId) {
      // Edit mode
      if (this.props.onEdit) {
        const task = {
          name: this.state.taskForm.name,
          description: this.state.taskForm.description,
        };

        this.props.onEdit(this.state.editedTaskId, task);
      }
    } else {
      // Create mode
      if (this.props.onCreate) {
        const task = {
          name: this.state.taskForm.name,
          description: this.state.taskForm.description,
          done: false,
        };

        this.props.onCreate(task);
      }
    }

    this.setState({
      visibleModal: false,
    });
  }

  private handleToggleDone(id: string, status: boolean) {
    if (this.props.onToggleDone) {
      this.props.onToggleDone(id, status);
    }
  }
}

export default Tasks;

import * as React from 'react';
import { Icon, List, Checkbox, Tag } from 'antd';

export interface TaskListProps {
  tasks: string[];
}

export interface TaskListState {}

class TaskList extends React.Component<TaskListProps, TaskListState> {
  constructor(props: TaskListProps) {
    super(props);
  }
  render() {
    return (
      <List
        className={'taskList'}
        size={'large'}
        dataSource={this.props.tasks}
        renderItem={(task: string) => (
          <List.Item>
            <div className={'dashBoard__card__task'}>
              <div className={'dashBoard__card__task__main'}>
                <Checkbox>
                  <span style={{ fontSize: '17px' }}>{task}</span>
                </Checkbox>
                <span className={'dueDate'}>
                  <Icon style={{ marginRight: '5px' }} type={'clock-circle'} />
                  29/09/2018
                </span>
              </div>

              <div className={'dashBoard__card__task__detail'}>
                <span style={{ color: '#c6c6c6' }}>By Emilio Herrera</span>

                <div>
                  <Icon type={'tag'} />
                  <span>
                    <Tag color="geekblue">BUG</Tag>
                    <Tag color="blue">JS</Tag>
                    <Tag color="cyan">CSS</Tag>
                  </span>
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  }
}

export default TaskList;

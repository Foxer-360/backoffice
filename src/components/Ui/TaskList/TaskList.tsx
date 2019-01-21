import * as React from 'react';
import { Icon, List, Checkbox, Tag, Spin } from 'antd';
import { dateFormatter } from '../../../utils';
import history from '@source/services/history';

interface Task {
  name: string;
  description: string;
  updatedAt: string;
  done: boolean;
  user: {
    username: string;
  };
  pageTranslation: LooseObject;
}

export interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
}

export interface TaskListState {}

class TaskList extends React.Component<TaskListProps, TaskListState> {
  constructor(props: TaskListProps) {
    super(props);
  }

  goToPage = page => {
    history.push(`/page?page=${page.id}&website=${page.website.id}&language=${page.website.defaultLanguage.id}`);
  }

  render() {
    const { loading } = this.props;

    return (
      <>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Spin />
          </div>
        )}

        {!loading && (
          <List
            className={'taskList'}
            size={'large'}
            dataSource={this.props.tasks}
            renderItem={(task: Task) => (
              <List.Item>
                <div className={'dashBoard__card__task'}>
                  <div className={'dashBoard__card__task__main'}>
                    {/* <Checkbox> */}
                      <span style={{ fontSize: '17px' }}>{task.name}</span>
                    {/* </Checkbox> */}

                    {console.log('%c Emilio: ', 'background: #222; color: #bada55', task)}

                    {task.updatedAt && (
                      <span className={'dueDate'}>
                        <Icon style={{ marginRight: '5px' }} type={'clock-circle'} />
                        {dateFormatter(task.updatedAt)}
                      </span>
                    )}
                  </div>

                  <div className={'dashBoard__card__task__detail'}>
                    <span style={{ color: '#c6c6c6' }}>
                      {task.user && task.user.username && 'By ' + task.user.username}
                    </span>

                    <div>
                      <Icon type={'tag'} />
                      <span>
                        {task.pageTranslation && (
                          <Tag color="geekblue" onClick={() => this.goToPage(task.pageTranslation.page)}>
                            {task.pageTranslation && task.pageTranslation.name}
                          </Tag>  
                        )}
                        {/* <Tag color="blue">JS</Tag> */}
                        {/* <Tag color="cyan">CSS</Tag> */}
                      </span>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </>
    );
  }
}

export default TaskList;

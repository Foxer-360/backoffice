import * as React from 'react';
import { Avatar, Tooltip } from 'antd';
import { EditorInfo } from '../../../../../../../../Composer';

const { Component } = React;

export interface Properties {
  editors?: EditorInfo[];
  id: string; // ID of locker editor
}

export interface State {}

class UserEditor extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);
  }

  public render() {
    const user = this.findUser();
    let name = user.id;
    if (user.name && user.name.length > 0) {
      name = user.name;
    }
    let hasOwnIcon = false;
    if (user.icon && user.icon.length > 0) {
      hasOwnIcon = true;
    }

    return (
      <div title={name} className="avatar" />
    );

    // return (
    //   <Tooltip title={name}>
    //     {hasOwnIcon ? <Avatar src={user.icon} /> : <Avatar icon="user" />}
    //   </Tooltip>
    // );
  }

  private findUser() {
    const user = this.props.editors.find((e: EditorInfo) => {
      if (e.id === this.props.id) {
        return true;
      }

      return false;
    });

    if (!user || user === null) {
      return { id: this.props.id };
    }

    return user;
  }

}

export default UserEditor;

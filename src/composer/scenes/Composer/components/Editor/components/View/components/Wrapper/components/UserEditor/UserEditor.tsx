import { ILooseObject } from '@source/composer/types';
import * as React from 'react';
import { IEditorInfo } from '../../../../../../../../Composer';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  editors?: IEditorInfo[];
  id: string | null; // ID of locker editor
}

class UserEditor extends React.Component<IProperties, {}> {

  constructor(props: IProperties) {
    super(props);
  }

  public render() {
    const user = this.findUser();
    let name = user.id;
    if (user.name && user.name.length > 0) {
      name = user.name;
    }

    if (!name || name === null) {
      name = 'Undefined';
    }
    // let hasOwnIcon = false;
    // if (user.icon && user.icon.length > 0) {
    //   hasOwnIcon = true;
    // }

    return (
      <div title={name} className="avatar" />
    );

    // return (
    //   <Tooltip title={name}>
    //     {hasOwnIcon ? <Avatar src={user.icon} /> : <Avatar icon="user" />}
    //   </Tooltip>
    // );
  }

  private findUser(): ILooseObject {
    if (!this.props.editors) {
      return { id: this.props.id };
    }

    const user = this.props.editors.find((e: IEditorInfo) => {
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

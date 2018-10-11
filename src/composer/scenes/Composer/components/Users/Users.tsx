import { Avatar, Tooltip } from 'antd';
import * as React from 'react';
import { IEditorInfo } from '../../Composer';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  editors: IEditorInfo[];
}

const style = {
  listStyleType: 'none',
  margin: '0px',
  padding: '0px',
  width: '155px',
} as React.CSSProperties;

class Users extends React.Component<IProperties, {}> {

  constructor(props: IProperties) {
    super(props);
  }

  public render() {
    return (
      <ul style={style}>
        {this.props.editors.map((e: IEditorInfo, i: number) => {
          let name = e.id;
          if (e.name && e.name.length > 0) {
            name = e.name;
          }

          let hasOwnIcon = false;
          if (e.icon && e.icon.length > 0) {
            hasOwnIcon = true;
          }

          return (
              <li key={i} style={{ display: 'inline-block' }}>
                <Tooltip key={i} title={name}>
                  <div style={{ display: 'inline', marginRight: '6px' }}>
                    {hasOwnIcon ? <Avatar src={e.icon} /> : <Avatar icon="user" />}
                  </div>
                </Tooltip>
              </li>
          );
        })}
      </ul>
    );
  }

}

export default Users;

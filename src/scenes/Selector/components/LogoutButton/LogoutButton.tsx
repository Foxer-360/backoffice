import * as React from 'react';
import { RouterAction } from 'react-router-redux';
import { Button } from 'antd';

import { logout } from '../../../../services/auth';

interface Properties {
  logoutCallback: () => RouterAction;
  style?: React.CSSProperties;
}

class LogoutButton extends React.Component<Properties, {}> {

  render() {
    let style = {};
    if (this.props.style) {
      style = this.props.style;
    }

    return (
      <Button
        style={style}
        onClick={() => logout(this.props.logoutCallback)}
      >
        Logout
      </Button>
    );
  }

}

export default LogoutButton;

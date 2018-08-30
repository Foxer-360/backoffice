import { handleEvent, debugMessage } from '../tools';
import { getAccessToken, getIdToken } from '@source/services/auth';

const _emitAuth = (socket: SocketIOClient.Socket) => {
  const accessToken = getAccessToken();
  const idToken = getIdToken();

  const payload = { access_token: accessToken, id_token: idToken };

  // Send authorize event to server
  socket.emit('authorize', payload);
};

const authorize = handleEvent('authorize', (socket) => (data) => {
  if (data.status !== 'success') {
    // Try authorize again in 500ms
    setTimeout(() => {
      _emitAuth(socket);
    }, 500);
  }

  // Show debug message
  debugMessage('authorize', data);
});

const unauthorized = handleEvent('unauthorized', (socket) => () => {
  // If we are unauthorized, than try to authorize
  _emitAuth(socket);

  // Show debug message
  debugMessage('unauthorized');
});

export default [
  authorize,
  unauthorized
];

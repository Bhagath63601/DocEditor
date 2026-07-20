const Y = require('yjs');
const { WebsocketProvider } = require('y-websocket');
const ws = require('ws');
global.WebSocket = ws;

const ydoc1 = new Y.Doc();
const provider1 = new WebsocketProvider('ws://localhost:1234', 'test-doc', ydoc1);

provider1.on('status', event => {
  console.log('Provider 1 status:', event.status);
  if (event.status === 'connected') {
    const ymap1 = ydoc1.getMap('state');
    ymap1.set('key', 'value1');
  }
});

const ydoc2 = new Y.Doc();
const provider2 = new WebsocketProvider('ws://localhost:1234', 'test-doc', ydoc2);

provider2.on('status', event => {
  console.log('Provider 2 status:', event.status);
});

ydoc2.on('update', () => {
  const ymap2 = ydoc2.getMap('state');
  console.log('Provider 2 received state:', ymap2.toJSON());
  process.exit(0);
});

setTimeout(() => {
  console.log('Timeout');
  process.exit(1);
}, 3000);

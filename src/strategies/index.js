const callbacks = require('./callbacks');
const asyncjs = require('./asyncjs');
const promises = require('./promises');

function getStrategyRunner(name) {
  switch ((name || '').toLowerCase()) {
    case 'callbacks':
      return { kind: 'cb', run: callbacks.run };
    case 'async':
      return { kind: 'cb', run: asyncjs.run };
    case 'promises':
    default:
      return { kind: 'promise', run: promises.run };
  }
}


module.exports = { getStrategyRunner };
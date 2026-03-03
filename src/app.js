const express = require('express');
const { makeTitleRoute } = require('./routes/titleRoute');
const { getStrategyRunner } = require('./strategies');
const cnfg = require('./utils/config');
const { reqLogger } = require('./middleware/reqLogger');
const {buildOpts} = require('./utils/optsProfiles');

const runner = getStrategyRunner(cnfg.STRATEGY);
const opts = buildOpts(cnfg);
console.log('Using opts:', opts);
const app = express();
app.use(reqLogger());
app.use(makeTitleRoute({ runner, opts }));
app.use((_req, res) => res.sendStatus(404));

app.listen(cnfg.PORT, () => {
  console.log(`Listening on Port: ${cnfg.PORT} | STRATEGY=${cnfg.STRATEGY} | TEST_PROFILE=${cnfg.TEST_PROFILE}`);
});
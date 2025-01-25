const { conf } = require("./src/services/config");
const { updateData } = require("./src/services/dataService");
updateData(conf.endpoint.cmd, conf.payload.cmd);
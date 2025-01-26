const { conf } = require("./src/services/config");
const { updateData } = require("./src/services/apiService");
updateData(conf.endpoint.cmd, conf.payload.cmd);
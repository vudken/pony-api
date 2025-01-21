const axios = require("axios");
const fs = require("fs");

const endpoint = "cfg";
const url = `http://212.93.127.226:9280/${endpoint}`;
const config = { "nsolution": { "ph_down_trig": 5.2, "ph_up_trig": 5.6, "pump_ph_down_quant_s": 0.5, "pump_ph_up_quant_s": 0.5, "ec_up_trig_msm": 1.7, "ec_down_trig_msm": 1.9, "pump_ec_up_quant_s": 10, "pump_ec_down_quant_s": 10, "mixing_time_min": 20, "pump_water_lvl_quant_s": 10, "lvl_off_delay_min": 0, "lvl_ignore_time_min": 1, "lvl_run_delay_min": 0, "temp_ctrl_on_temp": 21, "temp_ctrl_off_temp": 19, "temp_ctrl_time_on_above_min": 3, "temp_ctrl_time_on_below_min": 10, "temp_ctrl_time_off_above_min": 5, "ec_protection_percent": 15, "ph_protection_delta": 0.4, "ec_kt_percent": 2.1, "b_koeff": 1.01, "c_koeff": 0, "outsfn": [0, 2, 3, 4, 8, 5, 6, 9, 7] }, "clim": { "air_cooler": { "thr_on": 29, "thr_off": 26.5, "t_on_min": 6, "t_on_max": 120, "t_pause": 4 }, "dehumidifier": { "thr_on": 70, "thr_off": 60, "t_on_min": 6, "t_on_max": 60, "t_pause": 3 }, "extractor_t": { "thr_on": 28.5, "thr_off": 26.5, "t_on_min": 3, "t_on_max": 60, "t_pause": 3 }, "extractor_h": { "thr_on": 70, "thr_off": 60, "t_on_min": 3, "t_on_max": 60, "t_pause": 3 }, "humidifier": { "thr_on": 40, "thr_off": 50, "t_on_min": 3, "t_on_max": 60, "t_pause": 3 }, "co2": { "thr_on": 1100, "thr_off": 1200, "t_on_min": 3, "t_on_max": 10, "t_pause": 3 }, "heater": { "thr_on": 18, "thr_off": 20, "t_on_min": 3, "t_on_max": 10, "t_pause": 0 } }, "env": { "timers": [{ "m": 3, "data": { "dbegin": 0, "dskip": 0, "table": [{ "t1": 25200, "t2": 57601 }] } }, { "m": 2, "data": { "t1": 210, "t2": 1080 } }, { "m": 2, "data": { "t1": 5, "t2": 4 } }, { "m": 2, "data": { "t1": 2, "t2": 1 } }, { "m": 2, "data": { "t1": 180, "t2": 3600 } }, { "m": 2, "data": { "t1": 180, "t2": 3600 } }] } };

// axios
//   .get(url)
//   .then((response) => {
//     console.log("API response:", response.data);

//     const filePath = "./response.json";
//     fs.writeFile(filePath, JSON.stringify(response.data, null, 2), (err) => {
//       if (err) {
//         console.error("Error writing to file:", err);
//       } else {
//         console.log(`Response written to file: ${filePath}`);
//       }
//     });
//   })
//   .catch((error) => {
//     if (error.response) {
//       console.error("Response error:", error.response.data);
//       console.error("Status code:", error.response.status);
//     } else if (error.request) {
//       console.error("No response received:", error.request);
//     } else {
//       console.error("Error setting up request:", error.message);
//     }
//   });

axios
  .post(url, { jdata: JSON.stringify(config) }, {
    headers: {
      // "Content-Type": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  .then((response) => {
    console.log("API response:", response.data);

    const filePath = "./response.json";
    fs.writeFile(filePath, JSON.stringify(response.data, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      } else {
        console.log(`Response written to file: ${filePath}`);
      }
    });
  })
  .catch((error) => {
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Status code:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  });
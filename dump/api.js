
var cfg_json = `{"nsolution":{"ph_down_trig":6.3,"ph_up_trig":5.6,"pump_ph_down_quant_s":0.5,"pump_ph_up_quant_s":0.5,"ec_up_trig_msm":1.7,"ec_down_trig_msm":1.9,"pump_ec_up_quant_s":10,"pump_ec_down_quant_s":10,"mixing_time_min":20,"pump_water_lvl_quant_s":10,"lvl_off_delay_min":0,"lvl_ignore_time_min":1,"lvl_run_delay_min":0,"temp_ctrl_on_temp":21,"temp_ctrl_off_temp":19,"temp_ctrl_time_on_above_min":3,"temp_ctrl_time_on_below_min":10,"temp_ctrl_time_off_above_min":5,"ec_protection_percent":15,"ph_protection_delta":0.4,"ec_kt_percent":2.1,"b_koeff":1.01,"c_koeff":0,"outsfn":[0,2,3,4,8,5,6,9,7]},"clim":{"air_cooler":{"thr_on":29,"thr_off":26.5,"t_on_min":6,"t_on_max":120,"t_pause":4},"dehumidifier":{"thr_on":70,"thr_off":60,"t_on_min":6,"t_on_max":60,"t_pause":3},"extractor_t":{"thr_on":28.5,"thr_off":26.5,"t_on_min":3,"t_on_max":60,"t_pause":3},"extractor_h":{"thr_on":70,"thr_off":60,"t_on_min":3,"t_on_max":60,"t_pause":3},"humidifier":{"thr_on":40,"thr_off":50,"t_on_min":3,"t_on_max":60,"t_pause":3},"co2":{"thr_on":1100,"thr_off":1200,"t_on_min":3,"t_on_max":10,"t_pause":3},"heater":{"thr_on":18,"thr_off":20,"t_on_min":3,"t_on_max":10,"t_pause":0}},"env":{"timers":[{"m":3,"data":{"dbegin":0,"dskip":0,"table":[{"t1":25200,"t2":57601}]}},{"m":2,"data":{"t1":210,"t2":1080}},{"m":2,"data":{"t1":5,"t2":4}},{"m":2,"data":{"t1":2,"t2":1}},{"m":2,"data":{"t1":180,"t2":3600}},{"m":2,"data":{"t1":180,"t2":3600}}]}}`;
var state_json = `{"values":[{"r":0,"v":5.86},{"r":91308.48,"v":1.64},{"r":3651.812,"v":23.5},{"r":7,"v":"норма"},{"r":25.1,"v":25.1},{"r":43,"v":43},{"r":450,"v":450}],"cfghsh":5114,"uptime":73,"wifi":-28}`;
var out_functions_list = ["pH DOWN", "pH UP", "удобрение А", "удобрение B", "удобрение С", "долив воды", "чиллер", "кондиционер", "осушитель", "вытяжка", "увлажнитель", "обогрев-ль", "клапан CO2", "свет", "полив", "таймер 1", "таймер 2", "таймер 3", "таймер 4"];
var outs_func_map = [1, 2, 3, 4, 5, 6, 7, 8, 9];

var default_views_values = {
    "config_main": cfg_json,
    "config_clim": cfg_json,
    "config_cal": cfg_json,
    "config_sys": cfg_json,
    "config_timers": cfg_json,
    "state": state_json
};

var help_str = {
    "config_main": "см инструкцию",
    "config_clim": "логика работы каждого модуля следующая: если измеряемый параметр пересекает порог включения - происходит включение выхода; выход будет работать не менее минимального заданного времени (это особенно важно для кондиционеров и тд), далее если параметр пересечет порог отключения - выход будет отключен; если в течение времени 'работа до' параметр так и не пересечет порог отключения - выход будет принудительно отключен и пробудет выключенным в течение времени 'пауза от'. Далее цикл повторится: включение, если пересекается порог включения и тд",
    "config_cal": "Опускаете датчик в калибровочный раствор, ждете стабилизации показаний (перестало расти/падать, может занять до 5..10 мин), жмете 'запомнить' - это скопирует Raw значение в поле калибровки; далее жмете 'сохранить'; заводские значения калибровки pH примерно следующие: 7 - 0, 4.01 - 165; калибровки ЕС: 1.1 - 1.2, 3.1 - 2.8; Тк = 2.1%/*С, калибровки Т - 25 - 10000; линеаризации Т: -1.23e-9, 0.0000183, 1.111, 0",
    "config_sys": "У прибора 9 выходов 12В, сгруппированных в 3 разъема; функций больше - есть возможность назначит каждому выходу функцию; можно назначить одну функцию нескольким выходам.",
    "config_timers": "Таймеры могут работать в режиме расписания или в циклическом режиме (кроме света). В режиме расписания доступно до 30 интервалов работы",
};

function setTimeDialog() {
    let time = new Date();
    let nowtime = (' 0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2) + ':' + ('0' + time.getSeconds()).slice(-2);
    let input = prompt("Установка времени:", nowtime);
    if (input != null) {
        try {
            let hh = input.substr(0, 2);
            let mm = input.substr(3, 5);
            let ss = input.substr(6, 8);
            let seconds = parseInt(hh) * 3600 + parseInt(mm) * 60 + (ss != "" ? parseInt(ss) : 0);
            if (seconds < 24 * 3600) {
                return seconds;
            }
        } catch {
            alert("Неверный формат времени!");
        }
    }
    return null;
}


class OutsFuncSelectorComponent {
    constructor(parent, onchange, count) {
        this._root_table = parent;
        this._model = {};
        this._onchange = onchange;
        this._count = count;
    }
    UpdateModel(functions_list) {
        this._model = {
            functions_list: (functions_list) ? [...functions_list] : [],
            selections: []
        };
        this.Redraw();
    }
    GetState() {
        let state = [];
        let selects = this._root_table.querySelectorAll('select');
        for (let index = 0; index < this._count; index++) {
            state.push(selects[index].value);
        }
        return state;
    }
    SetState(new_states) {
        let selects = this._root_table.querySelectorAll('select');
        for (let index = 0; index < this._count; index++) {
            selects[index].value = new_states[index];
        }
    }
    Redraw() {
        let componentInstance = this;
        this._root_table.innerHTML = "";
        for (let index = 0; index < this._count; index++) {
            let tr = this._root_table.appendChild(createEl("tr"));
            tr.innerHTML += `<td><b><label>выход ${index + 1}</label></b></td>`;
            let td2 = tr.appendChild(createEl("td"));
            let select = td2.appendChild(createEl("select"));
            select.innerHTML += `<option value="254">OFF</option>`;
            select.innerHTML += `<option value="255">ON</option>`;
            for (let i = 0; i < this._model.functions_list.length; i++) {
                select.innerHTML += `<option value="${i}">${this._model.functions_list[i]}</option>`;
            }
            select.data = {};
            select.data.index = index;
            select.onchange = function () {
                componentInstance._onchange([this.data.index, this.selectedIndex]);
            };
        }
        this._root_table.setAttribute("tag", "config_sys");
        this._root_table.setAttribute("api", "outsfn");
        //console.log("componentInstance.getState:", componentInstance.GetState());
        this._root_table.encoder = function () {
            return componentInstance.GetState();
        };
        this._root_table.formatter = function (data, control) {
            componentInstance.SetState(data);
        };
    }

}

class TimerConfigComponent {
    constructor(parent, onchange, caption, api, api_group, mode_fixed) {
        this._onchange = onchange;
        this._root_elem = parent;
        this._caption = caption;
        this._api = api;
        this._api_group = api_group;
        this._mode_fixed = mode_fixed;
        this._model = {};
        let componentInstance = this;
        this._root_elem.innerHTML = "";
        let tr = this._root_elem; // .appendChild(createEl("tr"));
        tr.innerHTML += `<td><b><label>${this._caption}</label></b></td>`;
        let td2 = tr.appendChild(createEl("td"));
        let select = td2.appendChild(createEl("select"));
        select.style = "width:152px;";
        select.innerHTML += `<option value="2">циклический</option>`;
        select.innerHTML += `<option value="3">расписание</option>`;
        if (this._mode_fixed) {
            this._model.data = {};
            this._model.m = this._mode_fixed;
            select.value = this._mode_fixed;
            select.disabled = "true";
        }
        let textarea = td2.appendChild(createEl("textarea"));
        textarea.style = "width:282px; height: 19px;";
        textarea.oninput = function () {
            componentInstance.correctTextareaSize(this);
            var content = this.value.replace(/\n+\s*$/m, '');
            var lines = content.split("\n");
            var regexp = select.value == 2 ? /^\s*\d\d([:]\d\d){1,2}\s*;\s*\d\d([:]\d\d){1,2}\s*$/ : /^\s*\d\d([:]\d\d){1,2}\s*-\s*\d\d([:]\d\d){1,2}\s*$/;
            var correct = true;
            if (select.value == 2 && lines.length > 1) {
                correct = false;
            }
            lines.forEach(line => {
                if (!line.match(regexp)) {
                    correct = false;
                }
            });
            this.style.backgroundColor = correct ? "white" : "#f7b4b0";
            // + обновление модели
            if (!correct) {
                console.log("настройки таймера не валидны. Модель не обновлена");
                return "";
            } else {
                componentInstance._model.data = {};
                componentInstance._model.m = parseInt(select.value);
                var content = textarea.value.replace(/\n+\s*$/m, '');
                var lines = content.split("\n");
                lines.forEach(line => {
                    var times = line.match(/\d\d([:]\d\d){1,2}/mg); // /^\s*(\d\d([:]\d\d){1,2})\s*(-|;)\s*(\d\d([:]\d\d){1,2})\s*$/mg
                    var t1 = times[0];
                    var t2 = times[1];
                    if (componentInstance._model.m == 2) {
                        componentInstance._model.data = {
                            t1: HHMMssToSec(times[0]),
                            t2: HHMMssToSec(times[1])
                        };
                    } else {
                        if (componentInstance._model.data.table == undefined) {
                            componentInstance._model.data = {
                                dbegin: 0,
                                dskip: 0,
                                table: []
                            };
                        }
                        componentInstance._model.data.table.push({
                            t1: HHMMssToSec(times[0]),
                            t2: HHMMssToSec(times[1]) - HHMMssToSec(times[0])
                        });
                    }

                });
            }
            if (typeof componentInstance._onchange === "function") {
                componentInstance._onchange();
            }
        };

        select.data = {};
        select.onchange = function () {
            if (this.value == 2) {
                componentInstance._model.m = 2;
                componentInstance._model.data = {
                    t1: 180,
                    t2: 3600
                };
            } else if (this.value == 3) {
                componentInstance._model.m = 3;
                componentInstance._model.data = {
                    table: [{
                        t1: 3600 * 7,
                        t2: 3600 * 15
                    }],
                    dbegin: 0,
                    dskip: 0
                };
            }
            componentInstance.Redraw();
            if (typeof componentInstance._onchange === "function") {
                componentInstance._onchange();
            }
        };
        if (this._api_group) {
            td2.setAttribute("tag", this._api_group);
        }
        if (this._api) {
            td2.setAttribute("api", this._api);
        }
        td2.formatter = function (data) {
            componentInstance.SetState(data);
        };
        td2.encoder = function () {
            return componentInstance.GetState();
        };
    }
    correctTextareaSize(area) {
        area.style.height = "5px";
        area.style.height = (area.scrollHeight - 25) + "px";
    }
    GetState() {
        return this._model;
    }
    SetState(new_states) {
        this._model = new_states;
        this.Redraw();
    }
    Redraw() {
        let componentInstance = this;
        let tr = this._root_elem;
        let select = this._root_elem.querySelectorAll('select')[0];
        let textarea = this._root_elem.querySelectorAll('textarea')[0];
        // change select index, update textarea content by model 
        select.value = this._model.m; // == 2 ? 
        if (this._model.m == 2) {
            textarea.placeholder = "00:01:00; 00:00:05"
            var s = secToHHMMSS(this._model.data.t1) + "; " + secToHHMMSS(this._model.data.t2);
            textarea.value = s;
        } else if (this._model.m == 3) {
            textarea.placeholder = "07:00:00 - 22:00:00"
            var s = "";
            this._model.data.table.forEach(elem => {
                s += secToHHMMSS(elem.t1) + " - " + secToHHMMSS(elem.t1 + elem.t2) + "\n";
            });
            textarea.value = s.replace(/\n+\s*$/m, '');
        } else {
            select.value = 2;
            textarea.value = "";
            textarea.placeholder = "00:01:00; 00:00:05"
        }
        this.correctTextareaSize(textarea);
    }

}


class TimersConfigComponent {
    constructor(parent, onchange, count) {
        this._root_table = parent;
        this._model = {};
        this._onchange = onchange;
        this._count = count;
        this._timers = [];

        // создать таймер на свет с залоченным режимом, создать таймер на полив, создать 4 таймера; установить энкодер и форматтер; 
        let componentInstance = this;
        this._root_table.innerHTML = "";
        for (let index = 0; index < this._count; index++) {
            let tr = this._root_table.appendChild(createEl("tr"));
            let caption = index == 0 ? "свет" : (index == 1 ? "полив" : ("таймер " + (index - 1)));
            let api = "env/timers[" + index + "]";

            let timer = new TimerConfigComponent(tr, function () {
                if (typeof componentInstance._onchange === "function") {
                    componentInstance._onchange(index, this.GetState());
                }
                //console.log("tim changed", index, timer.GetState());
            }, caption, api, "config_timers", index == 0 ? 3 : undefined);


            timer.SetState({
                m: 3,
                data: {
                    table: [{
                        t1: 25200,
                        t2: 54000
                    }]
                }
            });
            this._timers.push(timer);
        }
        // this._root_table.setAttribute("tag", "config_timers");
        // this._root_table.setAttribute("api", "env/timers");
        this._root_table.encoder = function () {
            return componentInstance.GetState();
        };
        this._root_table.formatter = function (data, control) {
            componentInstance.SetState(data);
        };
    }
    GetState() {
        let state = [];
        for (let index = 0; index < this._timers.length; index++) {
            state.push(this._timers[index].GetState());
        }
        return state;
    }
    SetState(new_states) {
        for (let index = 0; index < new_states.length && index < this._timers.length; index++) {
            this._timers[index].SetState(new_states[index]);
        }
    }

    Redraw() {

    }

}


class OutputsControllerComponent {
    constructor(parent, onchange, count) {
        this._root_table = parent;
        this._model = {
            outs: {}
        };
        this._onchange = onchange;
        this._count = count;
        this._outs_lines_tr = [];

        // создать строки по числу выходов (название, режим + время, кнопки управления), подсоединить события; в Redraw в зависимости от флагов менять видимость кнопок, состояние и время  
        let componentInstance = this;
        this._root_table.innerHTML = "";
        for (let index = 0; index < this._count; index++) {
            let tr = this._root_table.appendChild(createEl("tr"));
            let caption = `<b><label>выход ${index + 1}</label></b>`;
            tr.appendChild(createEl("td")).innerHTML = caption;
            let td2 = tr.appendChild(createEl("td"));
            td2.style = "width: 210px;";
            let td3 = tr.appendChild(createEl("td"));
            td2.appendChild(createEl("label")).innerHTML = "AUTO OFF ";
            let btn1 = td3.appendChild(createEl("button"));
            btn1.innerHTML = "ON";
            btn1.setAttribute("class", "block");
            btn1.style = "float: none; display: inline-block; width: 100px;";
            let btn2 = td3.appendChild(createEl("button"));
            btn2.innerHTML = "OFF";
            btn2.setAttribute("class", "block");
            btn2.style = "float: none; display: inline-block; width: 100px;";
            let btn3 = td3.appendChild(createEl("button"));
            btn3.innerHTML = "ABORT";
            btn3.setAttribute("class", "block");
            btn3.style = "float: none; display: none; width: 100px;";
            this._outs_lines_tr.push(tr);

            btn1.onclick = function () {
                let data = {
                    type: 'out_ctrl',
                    num: index,
                    state: 1,
                    time: parseFloat(prompt("Enter time in sec", 0)),
                }
                console.log(data);
                TransportSendCmd(data, function (res) {
                    if (res !== 'ok') alert('команда не отправлена');
                });
            }

            btn2.onclick = function () {
                let data = {
                    type: 'out_ctrl',
                    num: index,
                    state: 0,
                    time: parseFloat(prompt("Enter time in sec", 0)),
                }
                console.log(data);
                TransportSendCmd(data, function (res) {
                    if (res !== 'ok') alert('команда не отправлена');
                });
            }

            btn3.onclick = function () {
                let data = {
                    type: 'out_ctrl',
                    num: index,
                    state: 0,
                    time: 0,
                }
                console.log(data);
                TransportSendCmd(data, function (res) {
                    if (res !== 'ok') alert('команда не отправлена');
                });
            }

        }
        this._root_table.setAttribute("tag", "watch");
        this._root_table.setAttribute("api", "outs");

        this._root_table.formatter = function (data, control) {
            componentInstance.SetState(data);
        };
    }

    SetState(new_states) {
        //console.log(new_states);
        this._model.outs = {
            ...new_states
        };
        this.Redraw();
    }

    Redraw() {
        // для каждого выхода устанавливаем состояние и скрываем/показываем кнопки 
        for (let index = 0; index < this._count; index++) {
            let tr = this._outs_lines_tr[index];
            let td1 = tr.querySelectorAll('td')[0];
            let td2 = tr.querySelectorAll('td')[1];
            let td3 = tr.querySelectorAll('td')[2];
            let label_caption = td1.querySelectorAll('label')[0];

            let func_num = outs_func_map[index];

            label_caption.innerHTML = (func_num == 254 || func_num == 255) ? `<b><label>выход ${index + 1}</label></b>` : out_functions_list[func_num];
            let label = td2.querySelectorAll('label')[0];
            let btn1 = td3.querySelectorAll('button')[0];
            let btn2 = td3.querySelectorAll('button')[1];
            let btn3 = td3.querySelectorAll('button')[2];
            let outs = this._model.outs;
            let overrd_time = outs.ovrrd_time[index];
            label.innerHTML = overrd_time > 0 ? ("MANUAL " + (outs.ovrrd_state[index] ? "ON " : "OFF ") + "[" + secAdaptiveFormatter(overrd_time) + "]") : func_num == 255 ? "ON" : func_num == 254 ? "OFF" : ("AUTO " + (outs.func_cntdn_s[func_num] > 0 ? "ON " + "[" + secAdaptiveFormatter(outs.func_cntdn_s[func_num]) + "]" : "OFF"));
            btn1.style.display = overrd_time > 0 ? "none" : "inline-block";
            btn2.style.display = overrd_time > 0 ? "none" : "inline-block";
            btn3.style.display = overrd_time > 0 ? "inline-block" : "none";
        }
    }

}






function lvlToText(v) {
    return (v == 0) ? "низкий" : (v == 1) ? "в самый раз" : (v == 2) ? "перелив" : "???";
}


function ec_encoder_formatter(v) {
    return (1000.0 / v).toFixed(2);
}

function RoundTo0(val, t) {
    return (val == undefined) ? '' : val.toFixed(0);
}

function RoundTo2(val, t) {
    return (val == undefined) ? '' : val.toFixed(2);
}

function uptimeToStr(s) {
    var t = {};
    t.days = Math.trunc(s / (3600 * 24));
    s -= t.days * 3600 * 24;
    t.hour = Math.trunc(s / 3600);
    s -= t.hour * 3600;
    t.minute = Math.trunc(s / 60);
    s -= t.minute * 60;
    return `${t.days}дн ${t.hour}ч ${t.minute}мин ${s}сек`;
}


function secAdaptiveFormatter(sec) {
    let t = {};
    let res = "";
    let s = sec;
    t.days = Math.trunc(s / (3600 * 24));
    s -= t.days * 3600 * 24;
    t.hour = Math.trunc(s / 3600);
    s -= t.hour * 3600;
    t.minute = Math.trunc(s / 60);
    s -= t.minute * 60;
    if (t.days) {
        res = `${(sec / (3600 * 24)).toFixed(1)}дн`;
    } else if (t.hour > 10) {
        res = `${((sec - t.days * 3600 * 24) / (3600)).toFixed(0)}ч`;
    } else if (t.hour) {
        res = `${((sec - t.days * 3600 * 24) / (3600)).toFixed(1)}ч`;
    } else if (t.minute > 10) {
        res = `${((sec - t.days * 3600 * 24 - t.hour * 3600) / (60)).toFixed(0)}м`;
    } else if (t.minute) {
        res = `${((sec - t.days * 3600 * 24 - t.hour * 3600) / (60)).toFixed(1)}м`;
    } else if (s > 10) {
        res = `${s.toFixed(0)}с`;
    } else {
        res = `${s.toFixed(1)}с`;
    }
    return res;
}

function RoundTo1(val, t) {
    return (val == undefined) ? '' : val.toFixed(1);
}

function RoundTo005(v) {
    return (Math.ceil(v * 20) / 20).toFixed(2);
}

function CopyElemToElemValue(api_to, api_from) {
    UpdateElemValueByApiTag(api_to, GrabElemValueByApiTag(api_from), true);
}

function wifiStateToView(t) {
    return (t.toString() + " dBm");
}

function testfunc(p1, p2) {


    return function (p1, p2) {
        console.log("p1:", p1, ", p2:", p2);
        return p2;
    };
}

function createEl(id) {
    return document.createElement(id);
}


function InitOutsFuncsArea(table_id, func_list, outs_count) {
    // создаем внутри count строк таблицы, в которых размещаем выход + номер, выпадающий список с функциями (которые берутся из массива)
    // out_functions_list
    let table = document.getElementById(table_id);
    let area = new OutsFuncSelectorComponent(table, function (x) {
        console.log(x);
    }, outs_count);
    area.UpdateModel(func_list);

}


function secToHHMMSS(s) {
    var t = {};
    t.days = Math.trunc(s / (3600 * 24));
    s -= t.days * 3600 * 24;
    t.hour = Math.trunc(s / 3600);
    s -= t.hour * 3600;
    t.minute = Math.trunc(s / 60);
    s -= t.minute * 60;
    return `${(t.hour < 10) ? '0' + t.hour : t.hour}:${(t.minute < 10) ? '0' + t.minute : t.minute}:${(s < 10) ? '0' + s : s}`;
}

function HHMMssToSec(s) {
    var hh = s.substr(0, 2);
    var mm = s.substr(3, 5);
    var ss = s.substr(6, 8);
    return parseInt(hh) * 3600 + parseInt(mm) * 60 + (ss != "" ? parseInt(ss) : 0);
}

function secToMin(d) {
    return (d / 60).toFixed(1);
}

function minToSec(d) {
    return (d * 60);
}

function outputsOnTimeFormatter(data) {
    let res = '';
    // у меня есть номера выходов, нужно узнать функции => извлечь из map; 
    for (let i = 0; i < outs_func_map.length; i++) {

        res += data[i] > 0 ? (outs_func_map[i] == 255 || outs_func_map[i] == 254 ? `Выход ${i + 1}` : out_functions_list[outs_func_map[i]]) + ': ' + secToMin(data[i]) + 'мин<br>' : '';
    }
    return res;
}

function resetErrorsFormatter(data, control) {
    control.style.display = (data == 0) ? "none" : "block";
    return null;
}


var fieldsNotUpdatedAfterOutsOff = false;




function TransportGetState(callback) {
    ajax.get('/state', {}, function (res) {
        callback(res);
    });
}

function TransportGetCfg(callback) {
    ajax.get('/cfg', {}, function (res) {
        callback(res);
    });
}

function TransportSetCfg(data, callback) {
    ajax.post('/cfg', {
        jdata: JSON.stringify(data)
    }, function (res) {
        callback(res);
    });
}

function TransportSendCmd(cmd, callback) {
    ajax.post('/cmd', {
        jdata: JSON.stringify(cmd)
    }, function (res) {
        callback(res);
    });
}


















function SaveCfg(tag_value) {
    let data = CollectAPIValues(tag_value);
    console.log('saveCfg call (' + tag_value + ')', data);
    TransportSetCfg(data, function (res) {
        let list = undefined;
        let error = false;
        try {
            console.log("answer: " + res);
            if (res != "")
                list = JSON.parse(res).wrong_values;
        } catch {
            error = true;
        }
        // либо лист будет пустым, либо undefined, либо ошибка парсинга (error == true)
        if (list != undefined) {
            ResetBackgroundOfWrongFields(tag_value);
            list.forEach(api => {
                //console.log('wrong: ' + api);
                let control = document.querySelector('[api="' + api + '"]');
                if (control != undefined || control != null) {
                    control.style.backgroundColor = "#f7b4b0";
                }
            });
        }
        alert(list != undefined && list.length == 0 ? 'сохранено' : "ошибка");
        if (tag_value == "config_sys" && list != undefined && list.length == 0) { // func map saved 
            outs_func_map = data.outsfn;
            console.log("func map set to", outs_func_map);
        }
    });
}


function ResetBackgroundOfWrongFields(tag_value) {
    let components = document.querySelectorAll('[tag="' + tag_value + '"]');
    console.log("Reset backgrounds", tag_value, components);
    for (let i = 0; i < components.length; i++) {
        if (components[i] != undefined) {
            components[i].style.backgroundColor = "white";
        }
    }
}

function SetDefaultViewValues(tag_value) {
    let root = JSON.parse(default_views_values[tag_value]);
    UpdateApiView(tag_value, root);
}

function ShowHelp(tag_value) {
    alert(help_str[tag_value]);
}

var timer_offline = 0;

function setOfflinePageState() {
    page_cap.style.backgroundColor = "red";
    timer_offline = 0;
}

function setOnlinePageState() {
    var page_cap = document.getElementById("page_cap");
    page_cap.style.backgroundColor = "lime";
}




/**
 * Window Load
 */



let lastUpdatedUptime = 0;
let uptimeLowerCounter = 0;

function GetAndUpdateState() {
    TransportGetState(function (res) {
        // try {
        if (res != "" && res != undefined && res != "{}" && res != null) {
            var response = JSON.parse(res);
            //console.log("accepted /state & parsed", response);
            if (response.uptime > lastUpdatedUptime) {
                UpdateApiView("watch", response);
                // console.log("view updated");
                lastUpdatedUptime = response.uptime;
                uptimeLowerCounter = 0;
            } else {
                uptimeLowerCounter++;
                if (uptimeLowerCounter > 5) {
                    lastUpdatedUptime = response.uptime;
                    UpdateApiView("watch", response);
                }
            }
            //console.log("set online state");
            setOnlinePageState();
            if (timer_offline !== 0) {
                window.clearTimeout(timer_offline);
                timer_offline = 0;
            }

            timer_offline = window.setTimeout(function () {
                setOfflinePageState();
            }, 5000);
        }
        // } catch {
        //     console.log("can't parse empty state");
        // }
    });
}

function GetAngUpdateConfig() {
    TransportGetCfg(function (res) {
        try {
            //console.log("cfg:", res);
            var response = JSON.parse(res);
            //console.log("cfg parsed", response);
            UpdateApiView("config_main", response);
            UpdateApiView("config_clim", response);
            UpdateApiView("config_cal", response);
            UpdateApiView("config_sys", response);
            if (response.outsfn) {
                outs_func_map = response.outsfn;
                console.log("func map set to", outs_func_map);
            }
            UpdateApiView("config_timers", response);

        } catch {
            console.log("can't parse empty config");
        }
    });
}

window.onload = function () {
    //window.scrollTo(0, 0);
    /*UpdateApiView("watch", JSON.parse(state_json));
    UpdateApiView("config_main", JSON.parse(cfg_json));
    UpdateApiView("config_cal", JSON.parse(cfg_json));
    console.log(JSON.stringify(CollectAPIValues("config_main")));
    console.log(JSON.stringify(CollectAPIValues("config_cal")));*/

    InitOutsFuncsArea("outsfuncs", out_functions_list, 9);
    /*let tim1 = new TimerConfigComponent(document.getElementById("timer1"), function() {
        console.log("tim changed", tim1.GetState());
    }, "свет", "123", "456", 3);
    tim1.SetState({
        m: 3,
        data: {
            table: [{
                t1: 25200,
                t2: 54000
            }]
        }
    });*/
    let timers = new TimersConfigComponent(document.getElementById("timers"), () => {
        console.log("timers onchange");
    }, 6);

    let outputs_ctrl = new OutputsControllerComponent(document.getElementById("outs_ctrl_table"), () => {
        console.log("outs ctrl event");
    }, 9);

    //        tim1.Redraw();

    setOfflinePageState();
    GetAngUpdateConfig();
    setInterval(function () {
        if (flagUpdateCfg) {
            flagUpdateCfg = 0;
            GetAngUpdateConfig();
        }
        GetAndUpdateState();
    }, 1000);
};




////////////////////////////////////////////////////// 

var flagUpdateCfg = 0;

function UpdateElemValueByApiTag(api, val, block_formatter = false) {
    var viewers = document.querySelectorAll('[api="' + api + '"]');
    for (var k = 0; k < viewers.length; k++) { //for each viewer  
        var control = viewers[k];
        var formatter = control.getAttribute("formatter");
        var postfix = control.getAttribute("postfix");
        var res = val;
        if (formatter == undefined) {
            formatter = control.formatter;
        }
        if (formatter != undefined && !block_formatter) {
            if (typeof formatter === "function") {
                //console.log("formatter - func");
                res = formatter(res, control);
            } else if (typeof formatter === "string") {
                res = window[formatter](res, control);
            } else {
                console.log("unknown typeof formatter");
            }
        }
        if (res != null) {
            if (postfix != undefined) res += postfix; //                console.log("try set" + res + ", elem=" + api);
            switch (control.tagName) {
                case "SELECT":
                case "INPUT":
                case "TEXTAREA":
                    if (control.getAttribute("type") == "checkbox") {
                        control.checked = res;
                    } else
                        control.value = res;
                    break;
                case "DIV":
                case "TD":
                case "DATALIST":
                case "LABEL":
                case "B":
                    control.innerHTML = res;
                    break;
            }
        }
    }
}

function UpdateApiView(tagValue, data_root) {
    // можно оптимизировать, если найти сразу все элементы с идентичными val_addr
    var components = document.querySelectorAll('[tag="' + tagValue + '"]');
    for (var i = 0; i < components.length; i++) {
        if (components[i] != undefined) {
            let val_addr = components[i].getAttribute("api"); // values[1]/v
            let addr_parts = val_addr.split('/');
            let p = data_root;
            //console.log("i ==", i, ", val_addr ==", val_addr);
            addr_parts.forEach(part => { // values[1], v
                let subparts = part.split('['); // values, 1]
                subparts.forEach(subpart => { // part делю на части по [ со включением, для каждой из частей "углубляюсь" в p; для [] углубление может выглядеть иначе;  
                    if (subpart[subpart.length - 1] == ']') {
                        subpart = subpart.substr(0, subpart.length - 1);
                    }
                    //console.log("dig into ", p, subpart);
                    if (p == undefined) {
                        console.log("[Error] UpdateApiView, tagValue ==", tagValue, ", data_root ==", data_root);
                        console.log("i ==", i, ", val_addr ==", val_addr);
                        console.log("dig into ", p, subpart);
                        return;
                    }
                    p = p[subpart];
                });
            }); // p указывает на нужное значение 
            UpdateElemValueByApiTag(val_addr, p);
        }
    }
}

function GrabElemValueByApiTag(api) {
    var control = document.querySelector('[api="' + api + '"]'); //console.log(api + add_part);
    var value = null;
    switch (control.tagName) { // grab value from component 
        case "SELECT":
        case "DIV":
        case "INPUT":
        case "TEXTAREA":
            value = (control.getAttribute("type") == "checkbox") ? (control.checked ? 1 : 0) : control.value;
            break;
        case "TD":
        case "DATALIST":
        case "LABEL":
        case "B":
            value = control.innerHTML;
    }
    var encoder = control.getAttribute("encoder"); //console.log("viewer:"+ api +""+ k);
    if (encoder == undefined) {
        encoder = control.encoder;
    }
    var r = value;
    try { // if has"encoder"field => encode data to backend format; if result == null => alert error and restore old value 
        if (encoder != undefined) {
            if (typeof encoder === "function") {
                console.log("encoder - func");
                r = encoder(value, control);
            } else if (typeof encoder === "string") {
                r = window[encoder](value, control); //console.log("has formatter:"+ formatter +"arg="+ JSON.stringify(p));
            } else {
                console.log("unknown typeof encoder");
            }
        }
    } catch {
        console.log("encoder error:" + api);
    }
    if (r == null) {
        console.log("Ошибка ввода для " + api + ", null не является корректным значением");
    }
    //console.log("api:" + api + ":" + r);
    return r;
}

function CollectAPIValues(tagValue) {
    var res = {};
    var components = document.querySelectorAll('[tag="' + tagValue + '"]');
    for (var i = 0; i < components.length; i++) {
        if (components[i] != undefined) {
            let val_addr = components[i].getAttribute("api"); // values[1]/v
            let value = GrabElemValueByApiTag(val_addr); // место оптимизации
            let addr_parts = val_addr.split('/');
            let p = res;
            for (let k = 0; k < addr_parts.length; k++) { //values[1], v
                let part = addr_parts[k];
                let subparts = part.split('['); // values, 1]
                for (let j = 0; j < subparts.length; j++) { // part делю на части по [ со включением, для каждой из частей "углубляюсь" в p; для [] углубление может выглядеть иначе;  
                    let subpart = subparts[j];
                    if (subpart[subpart.length - 1] == ']') { // 1
                        subpart = subpart.substr(0, subpart.length - 1);
                    }
                    if (p[subpart] == undefined) {
                        p[subpart] = (j == subparts.length - 1) ? (k == addr_parts.length - 1 ? value : {}) : [];
                    }
                    p = p[subpart];
                }
            } // p указывает на нужное значение 
        }
    }

    return res;

    /*api_list = api_points[tagValue];
    for (var i = 0; i < api_list.length; i++) { // для каждой API-точки 
        var api = api_list[i].api;
        for (var j = 0; j < api_list[i].elements.length; j++) { // для каждого"постфикса"API-точки ("","[0/10]","[5/12]"и тд)
            var add_part = api_list[i].elements[j];
            //var control = document.querySelector('[api="' + api + add_part + '"]'); //console.log(api + add_part);
            var r = GrabElemValueByApiTag(api + add_part);

            var addr = api.split("/");
            var p = res;
            for (var k = 0; k < addr.length - 1; k++) {
                if (p[addr[k]] == undefined)
                    p[addr[k]] = {};
                p = p[addr[k]];
            }

            if (add_part != "") { //parse add_part  // something like"[6/12]"
                var index = add_part.substr(1, add_part.indexOf('/') - 1);
                var size = add_part.substr(add_part.indexOf('/') + 1, add_part.indexOf(']') - add_part.indexOf('/') - 1);
                if (p[addr[addr.length - 1]] == undefined) p[addr[addr.length - 1]] = [];
                if (p[addr[addr.length - 1]][size - 1] == undefined && index != size - 1) p[addr[addr.length - 1]][size - 1] = null;
                p[addr[addr.length - 1]][index] = r;
            } else p[addr[addr.length - 1]] = r;
        }
    }
    return res;*/
}




/* function GrabConfigElementValue(api_array) {
     var res = {};
     for (var i = 0; i < api_array.length; i++) { // для каждой API-точки 
         var api = api_array[i].substr(0, api_array[i].indexOf('[')); // string before '[' 
         var add_part = (api != "") ? api_array[i].substr(api_array[i].indexOf('[')) : ""; // [0/12], at example
         api = (api == "") ? api_array[i] : api;
         //console.log("api:"+ api + add_part);

         try {
             var value = GrabElemValueByApiTag(api + add_part);
         } catch {
             console.log("GrabConfigElementValue," + api + add_part);
             continue;
         }
         if (value == null) continue;
         var addr = api.split("/");
         var p = res;
         for (var k = 0; k < addr.length - 1; k++) {
             if (p[addr[k]] == undefined)
                 p[addr[k]] = {};
             p = p[addr[k]];
         }

         if (add_part != "") { //parse add_part  // something like"[6/12]"
             var index = add_part.substr(1, add_part.indexOf('/') - 1);
             var size = add_part.substr(add_part.indexOf('/') + 1, add_part.indexOf(']') - add_part.indexOf('/') - 1);
             if (p[addr[addr.length - 1]] == undefined) p[addr[addr.length - 1]] = [];
             if (p[addr[addr.length - 1]][size - 1] == undefined && index != size - 1) p[addr[addr.length - 1]][size - 1] = null;
             p[addr[addr.length - 1]][index] = value;
         } else p[addr[addr.length - 1]] = value;

     }
     return res;
 }*/




var ajax = {};
ajax.x = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) { }
    }
    return xhr;
};

ajax.send = function (url, callback, method, data, async) {
    if (async === undefined) {
        async = true;
    }
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
};

ajax.post = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), async)
};



{
    "0": {},
    "1": {},
    "2": {},
    "3": {},
    "4": {},
    "5": {},
    "6": {},
    "7": {},
    "8": {},
    "9": {},
    "10": {},
    "11": {},
    "12": {},
    "13": {},
    "14": {},
    "15": {},
    "16": {},
    "17": {},
    "18": {},
    "19": {},
    "20": {},
    "21": {}
}
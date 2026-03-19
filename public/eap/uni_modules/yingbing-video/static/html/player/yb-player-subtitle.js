"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*字幕处理*/
var YbSubtitle = /*#__PURE__*/function () {
  function YbSubtitle(player, list, config) {
    _classCallCheck(this, YbSubtitle);
    this.player = player;
    this.list = list || [];
    this.config = config || {};
    this.activeIndex = -1; //渲染字幕位置索引
    this.paused = true; //停止渲染
    this._animation = null; //渲染动画
  }
  //默认配置
  return _createClass(YbSubtitle, [{
    key: "unload",
    value: function unload() {
      this.pause();
      var container = this.player.container;
      var div = container.getElementsByClassName('yb-player-subtitle-text')[0];
      if (div) div.remove();
    }
  }, {
    key: "setConfig",
    value: function setConfig(key, value) {
      this.config[key] = value;
    }
  }, {
    key: "play",
    value: function play() {
      this.paused = false;
      this._render();
    }
  }, {
    key: "pause",
    value: function pause() {
      this.paused = true;
      if (this._animation) {
        window.cancelAnimationFrame(this._animation);
        this._animation = null;
      }
    }
    //渲染字幕
  }, {
    key: "_render",
    value: function _render() {
      var _this = this;
      var container = this.player.container;
      var video = this.player.video;
      if (!video || !container) return;
      var div = container.getElementsByClassName('yb-player-subtitle-text')[0];
      var wrapperEl = container.getElementsByClassName('yb-player-wrapper')[0];
      var nowIndex = this.list.findIndex(function (item) {
        return YbPlayer.timeToSeconds(item.startTime) <= video.currentTime && YbPlayer.timeToSeconds(item.endTime) >= video.currentTime;
      });
      var config = _objectSpread(_objectSpread({}, YbSubtitle.DEFAULT_CONFIG), this.config);
      if (nowIndex > -1 && this.activeIndex != nowIndex) {
        this.activeIndex = nowIndex;
        var nowTitle = this.list[nowIndex];
        if (!div) {
          div = document.createElement('DIV');
          div.setAttribute('class', 'yb-player-subtitle-text');
          wrapperEl.appendChild(div);
        }
        div.style.color = config.color;
        div.style.fontSize = config.fontSize + 'px';
        div.style.bottom = config.bottom;
        div.style.textShadow = "0 0 5px " + config.shadowColor;
        div.innerHTML = "<span>".concat(nowTitle.text, "</span>");
      } else {
        if (div && nowIndex == -1) div.remove();
      }
      if (!this.paused) this._animation = window.requestAnimationFrame(function () {
        return _this._render();
      });
    }
  }], [{
    key: "init",
    value: function init(player, src, config) {
      return new Promise(function (resolve) {
        YbSubtitle.showLoading(player);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              YbSubtitle.showResult(player, '加载字幕文件成功');
              var list = src.includes('.srt') ? YbSubtitle.parseSrt(xhr.responseText) : src.includes('.ass') ? YbSubtitle.parseAss(xhr.responseText).events.data.map(function (item) {
                var text = item.Text.replace(/\{.*?\}/g, ''); // 移除{}标签
                text = text.replace(/\\N/g, '<br>'); // 处理换行
                return _objectSpread(_objectSpread({}, item), {}, {
                  text: text,
                  startTime: item.Start,
                  endTime: item.End
                });
              }) : YbSubtitle.parseVtt(xhr.responseText).cues;
              resolve(new YbSubtitle(player, list, config));
            } else {
              YbSubtitle.showResult(player, '加载字幕文件失败');
              resolve(null);
            }
            xhr.abort();
          }
        };
        xhr.onabort = function () {
          xhr = null;
        };
        xhr.open('GET', src);
        xhr.responseType = 'text';
        xhr.send();
      });
    }
  }, {
    key: "showLoading",
    value: function showLoading(player) {
      var container = player.container;
      var wrapperEl = container ? container.getElementsByClassName('yb-player-wrapper')[0] : null;
      if (wrapperEl) {
        var div = document.createElement('DIV');
        div.setAttribute('class', 'yb-player-subtitle-loading');
        div.innerHTML = '正在加载字幕文件';
        wrapperEl.appendChild(div);
      }
    }
  }, {
    key: "hideLoading",
    value: function hideLoading(player) {
      var container = player === null || player === void 0 ? void 0 : player.container;
      var loadingEl = container ? container.getElementsByClassName('yb-player-subtitle-loading')[0] : null;
      if (loadingEl) loadingEl.remove();
    }
  }, {
    key: "showResult",
    value: function showResult(player, message) {
      var container = player.container;
      var loadingEl = container ? container.getElementsByClassName('yb-player-subtitle-loading')[0] : null;
      if (loadingEl) loadingEl.innerHTML = message;
      window.setTimeout(function () {
        YbSubtitle.hideLoading(player);
      }, 1000);
    }
    //格式化SRT字幕
  }, {
    key: "parseSrt",
    value: function parseSrt(content) {
      // 按空行分割字幕块
      var blocks = content.trim().split(/\n\s*\n/);
      var result = [];
      for (var i = 0; i < blocks.length; i++) {
        var lines = blocks[i].split('\n').filter(function (line) {
          return line.trim() !== '';
        });
        if (lines.length < 3) {
          continue; // 跳过无效块
        }

        // 解析序号
        var index = parseInt(lines[0]);
        if (isNaN(index)) {
          throw new Error("\u65E0\u6548\u7684\u5E8F\u53F7: ".concat(lines[0]));
        }

        // 解析时间码
        var timecodeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        if (!timecodeMatch) {
          throw new Error("\u65E0\u6548\u7684\u65F6\u95F4\u7801\u683C\u5F0F: ".concat(lines[1]));
        }
        var startTime = "".concat(parseInt(timecodeMatch[1]), ":").concat(parseInt(timecodeMatch[2]), ":").concat(parseInt(timecodeMatch[3]), ".").concat(parseInt(timecodeMatch[4]));
        var endTime = "".concat(parseInt(timecodeMatch[5]), ":").concat(parseInt(timecodeMatch[6]), ":").concat(parseInt(timecodeMatch[7]), ".").concat(parseInt(timecodeMatch[8]));

        // 合并文本行
        var text = lines.slice(2).join('\n');
        result.push({
          index: index,
          startTime: startTime,
          endTime: endTime,
          text: text
        });
      }
      return result;
    }
  }, {
    key: "parseAss",
    value: function parseAss(content) {
      var lines = content.split('\n');
      var currentSection = '';
      var result = {
        info: {},
        styles: {
          format: [],
          data: []
        },
        events: {
          format: [],
          data: []
        }
      };
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        // 跳过空行和注释
        if (!line || line.startsWith(';')) continue;

        // 检测段落开始
        if (line.startsWith('[') && line.endsWith(']')) {
          currentSection = line.slice(1, -1).toLowerCase();
          continue;
        }
        // 根据当前段落处理内容
        switch (currentSection) {
          case 'script info':
            parseScriptInfo(line, result.info);
            break;
          case 'v4+ styles':
            parseStyles(line, result.styles);
            break;
          case 'events':
            parseEvents(line, result.events);
            break;
        }
      }
      return result;
    }
  }, {
    key: "parseVtt",
    value: function parseVtt(content) {
      var lines = content.split('\n');
      var cues = [];
      var currentCue = null;
      var note = null;
      var style = null;
      var region = null;

      // 检查文件头
      if (lines.length === 0 || !lines[0].includes('WEBVTT')) {
        throw new Error('无效的VTT文件: 缺少WEBVTT文件头');
      }
      // 解析VTT内容
      for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim();

        // 跳过空行
        if (line === '') continue;

        // 检查是否是时间轴
        if (line.includes('-->')) {
          // 如果已有当前cue，先保存它
          if (currentCue) {
            cues.push(currentCue);
          }

          // 创建新的cue
          currentCue = {
            identifier: null,
            start: null,
            end: null,
            text: '',
            styles: null
          };

          // 解析时间轴
          var arrowIndex = line.indexOf('-->');
          currentCue.startTime = line.substring(0, arrowIndex).trim();
          currentCue.endTime = line.substring(arrowIndex + 3, arrowIndex + 15).trim();
          var settingsLine = line.substring(arrowIndex + 15).trim();
          // 解析设置（如果有）
          if (settingsLine) currentCue.styles = parseCueSettings(settingsLine);
        }
        // 检查是否是标识符（数字或文本）
        else if (!currentCue && /^\d+$/.test(line)) {
          // 这是标识符行
          if (currentCue) {
            currentCue.identifier = line;
          }
        }
        // 检查是否是注释
        else if (line.startsWith('NOTE')) {
          note = line.substring(4).trim();
        }
        // 检查是否是样式块
        else if (line.startsWith('STYLE')) {
          style = line.substring(5).trim();
        }
        // 检查是否是区域块
        else if (line.startsWith('REGION')) {
          region = line.substring(6).trim();
        }
        // 否则是文本行
        else if (currentCue) {
          if (currentCue.text) {
            currentCue.text += '\n' + line;
          } else {
            currentCue.text = line;
          }
        }
      }

      // 添加最后一个cue
      if (currentCue) {
        cues.push(currentCue);
      }
      return {
        metadata: {
          note: note,
          style: style,
          region: region
        },
        cues: cues
      };
    }
  }]);
}(); // 解析脚本信息
_defineProperty(YbSubtitle, "DEFAULT_CONFIG", {
  color: '#ffffff',
  //文字颜色
  fontSize: 18,
  //字体大小
  bottom: '10%',
  //底部边距
  shadowColor: 'rgba(0,0,0,.5)' //阴影颜色
});
function parseScriptInfo(line, infoObj) {
  var colonIndex = line.indexOf(':');
  if (colonIndex === -1) return;
  var key = line.substring(0, colonIndex).trim();
  var value = line.substring(colonIndex + 1).trim();
  infoObj[key] = value;
}

// 解析样式
function parseStyles(line, stylesObj) {
  if (line.toLowerCase().startsWith('format:')) {
    // 解析格式行
    var formatLine = line.substring(7).trim();
    stylesObj.format = formatLine.split(',').map(function (item) {
      return item.trim();
    });
  } else if (line.toLowerCase().startsWith('style:')) {
    // 解析样式数据
    var styleLine = line.substring(6).trim();
    var values = parseCsvLine(styleLine);
    if (values.length === stylesObj.format.length) {
      var style = {};
      stylesObj.format.forEach(function (key, index) {
        style[key] = values[index];
      });
      stylesObj.data.push(style);
    }
  }
}

// 解析事件
function parseEvents(line, eventsObj) {
  if (line.toLowerCase().startsWith('format:')) {
    // 解析格式行
    var formatLine = line.substring(7).trim();
    eventsObj.format = formatLine.split(',').map(function (item) {
      return item.trim();
    });
  } else if (line.toLowerCase().startsWith('dialogue:') || line.toLowerCase().startsWith('comment:')) {
    // 解析对话或注释数据
    var typeEnd = line.indexOf(':');
    var type = line.substring(0, typeEnd).trim();
    var dataLine = line.substring(typeEnd + 1).trim();
    var values = parseCsvLine(dataLine);
    if (values.length === eventsObj.format.length) {
      var event = {
        Type: type
      };
      eventsObj.format.forEach(function (key, index) {
        event[key] = values[index];
      });
      eventsObj.data.push(event);
    }
  }
}

// 解析CSV格式的行（处理逗号在引号内的情况）
function parseCsvLine(line) {
  var result = [];
  var current = '';
  var inQuotes = false;
  for (var i = 0; i < line.length; i++) {
    var _char = line[i];
    if (_char === '"') {
      inQuotes = !inQuotes;
    } else if (_char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += _char;
    }
  }
  result.push(current.trim());
  return result;
}

// 解析Cue设置
function parseCueSettings(settingsLine) {
  var settings = {};
  var parts = settingsLine.split(' ');
  var _iterator = _createForOfIteratorHelper(parts),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var part = _step.value;
      var _part$split = part.split(':'),
        _part$split2 = _slicedToArray(_part$split, 2),
        key = _part$split2[0],
        value = _part$split2[1];
      if (key && value) {
        settings[key] = value;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return settings;
}
//兼容new Function，为了挂载到window对象上
if (typeof window != 'undefined') {
  window.YbSubtitle = YbSubtitle;
}
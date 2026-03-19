"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var YbMpeg = /*#__PURE__*/function () {
  function YbMpeg() {
    _classCallCheck(this, YbMpeg);
    this.canvas = null;
    this._src = null; //播放链接
    this.duration = null; //总时长
    this.jsmpeg = null; //jsmpeg实例
    this.readyState = 0; //视频状态
    this._event = {}; //事件对象
    this._init = null; //是否已经初始化
    this._isSeeking = false; //是否正在跳转
    this._seekingTime = null; //正在跳转的时间
    this.init();
  }
  //操作播放链接
  return _createClass(YbMpeg, [{
    key: "src",
    get: function get() {
      return this._src;
    },
    set: function set(value) {
      this._src = value;
    }
    //操作静音
  }, {
    key: "muted",
    get: function get() {
      var _this$jsmpeg;
      return ((_this$jsmpeg = this.jsmpeg) === null || _this$jsmpeg === void 0 ? void 0 : _this$jsmpeg.volume) == 0 ? true : false;
    },
    set: function set(value) {
      if (this.jsmpeg) {
        this.jsmpeg.volume = value ? 0 : 1;
        this.emit('volumechange');
      }
    }
  }, {
    key: "style",
    get: function get() {
      return this.canvas.style;
    }
    //操作进度
  }, {
    key: "currentTime",
    get: function get() {
      var _this$jsmpeg2;
      return (_this$jsmpeg2 = this.jsmpeg) === null || _this$jsmpeg2 === void 0 ? void 0 : _this$jsmpeg2.currentTime;
    }
    //设置进度
    ,
    set: function set(value) {
      if (this.jsmpeg) {
        this.jsmpeg.currentTime = value;
        this._isSeeking = true;
        this._seekingTime = value;
        this.emit('seeking');
      }
    }
    //获取视频宽度
  }, {
    key: "videoWidth",
    get: function get() {
      var _this$jsmpeg3;
      return (_this$jsmpeg3 = this.jsmpeg) === null || _this$jsmpeg3 === void 0 || (_this$jsmpeg3 = _this$jsmpeg3.video) === null || _this$jsmpeg3 === void 0 || (_this$jsmpeg3 = _this$jsmpeg3.destination) === null || _this$jsmpeg3 === void 0 ? void 0 : _this$jsmpeg3.width;
    }
    //获取视频高度
  }, {
    key: "videoHeight",
    get: function get() {
      var _this$jsmpeg4;
      return (_this$jsmpeg4 = this.jsmpeg) === null || _this$jsmpeg4 === void 0 || (_this$jsmpeg4 = _this$jsmpeg4.video) === null || _this$jsmpeg4 === void 0 || (_this$jsmpeg4 = _this$jsmpeg4.destination) === null || _this$jsmpeg4 === void 0 ? void 0 : _this$jsmpeg4.height;
    }
    //获取暂停状态
  }, {
    key: "paused",
    get: function get() {
      var _this$jsmpeg5;
      return (_this$jsmpeg5 = this.jsmpeg) === null || _this$jsmpeg5 === void 0 ? void 0 : _this$jsmpeg5.paused;
    }
    //播放事件
  }, {
    key: "onplay",
    get: function get() {
      return this._event.onplay || null;
    },
    set: function set(callback) {
      this._event.onplay = callback;
    }
    //暂停事件
  }, {
    key: "onpause",
    get: function get() {
      return this._event.onpause || null;
    },
    set: function set(callback) {
      this._event.onpause = callback;
    }
    //播放结束事件
  }, {
    key: "onended",
    get: function get() {
      return this._event.onended || null;
    },
    set: function set(callback) {
      this._event.onended = callback;
    }
    //数据不足等待加载事件
  }, {
    key: "onwaiting",
    get: function get() {
      return this._event.onwaiting || null;
    },
    set: function set(callback) {
      this._event.onwaiting = callback;
    }
    //恢复播放事件
  }, {
    key: "onplaying",
    get: function get() {
      return this._event.onplaying || null;
    },
    set: function set(callback) {
      this._event.onplaying = callback;
    }
    //开始加载事件
  }, {
    key: "onloadstart",
    get: function get() {
      return this._event.onloadstart || null;
    },
    set: function set(callback) {
      this._event.onloadstart = callback;
    }
    //加载到元数据事件
  }, {
    key: "onloadedmetadata",
    get: function get() {
      return this._event.onloadedmetadata || null;
    },
    set: function set(callback) {
      this._event.onloadedmetadata = callback;
    }
    //加载到第一帧事件
  }, {
    key: "onloadeddata",
    get: function get() {
      return this._event.onloadeddata || null;
    },
    set: function set(callback) {
      this._event.onloadeddata = callback;
    }
    //可以播放事件
  }, {
    key: "oncanplay",
    get: function get() {
      return this._event.oncanplay || null;
    },
    set: function set(callback) {
      this._event.oncanplay = callback;
    }
    //加载全部数据事件
  }, {
    key: "oncanplaythrough",
    get: function get() {
      return this._event.oncanplaythrough || null;
    },
    set: function set(callback) {
      this._event.oncanplaythrough = callback;
    }
  }, {
    key: "oncontextmenu",
    get: function get() {
      var _this$canvas;
      return ((_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.oncontextmenu) || null;
    },
    set: function set(callback) {
      if (this.canvas) this.canvas.oncontextmenu = callback;
    }
    //音量改变事件
  }, {
    key: "onvolumechange",
    get: function get() {
      return this._event.onvolumechange || null;
    },
    set: function set(callback) {
      this._event.onvolumechange = callback;
    }
    //总时长改变事件
  }, {
    key: "ondurationchange",
    get: function get() {
      return this._event.ondurationchange || null;
    },
    set: function set(callback) {
      this._event.ondurationchange = callback;
    }
    //事件进度更新事件
  }, {
    key: "ontimeupdate",
    get: function get() {
      return this._event.ontimeupdate || null;
    },
    set: function set(callback) {
      this._event.ontimeupdate = callback;
    }
    //跳转中事件
  }, {
    key: "onseeking",
    get: function get() {
      return this._event.onseeking || null;
    },
    set: function set(callback) {
      this._event.onseeking = callback;
    }
    //跳转完成事件
  }, {
    key: "onseeked",
    get: function get() {
      return this._event.onseeked || null;
    },
    set: function set(callback) {
      this._event.onseeked = callback;
    }
    //中断事件
  }, {
    key: "onabort",
    get: function get() {
      return this._event.onabort || null;
    },
    set: function set(callback) {
      this._event.onabort = callback;
    }
  }, {
    key: "init",
    value: function init() {
      this.canvas = document.createElement('CANVAS');
    }
    //设置属性
  }, {
    key: "setAttribute",
    value: function setAttribute(attr, value) {
      this.canvas.setAttribute(attr, value);
    }
    //移除属性
  }, {
    key: "removeAttribute",
    value: function removeAttribute(attr) {
      //如果移除的属性是src，则清空src
      if (attr == 'src') {
        this._src = null;
      } else {
        this.canvas.removeAttribute(attr);
      }
    }
    //是否包含某个节点
  }, {
    key: "contains",
    value: function contains(target) {
      return this.canvas.contains(target);
    }
    //配置文件
  }, {
    key: "setConfig",
    value: function setConfig(config) {
      this.config = config;
    }
  }, {
    key: "setDecoder",
    value: function setDecoder(decoder) {
      this.decoder = decoder;
    }
    //加载视频
  }, {
    key: "load",
    value: function load() {
      var _this = this;
      this.unload();
      if (!this._src) return;
      this.jsmpeg = new this.decoder.Player(this._src, _objectSpread(_objectSpread({
        canvas: this.canvas
      }, this.config), {}, {
        //当源接收到所有数据时调用的回调
        onSourceCompleted: function onSourceCompleted() {
          _this.readyState = 4;
          _this.emit('canplaythrough');
        },
        //当source第一次接收到数据时调用的回调
        onSourceEstablished: function onSourceEstablished() {
          _this.readyState = 1;
          _this.emit('canplay');
          _this.emit('loadedmetadata');
        },
        //已连接
        onSourceConnected: function onSourceConnected() {
          _this.emit('loadstart');
        },
        //视频流解码完毕
        onVideoDecode: function onVideoDecode(decoder, time) {
          //还未初始化
          if (!_this._init) {
            //更新readyState状态
            _this.readyState = 3;
            _this.emit('loadeddata');
            _this._init = true;
          } else {
            //如果刚才处于卡顿中
            if (_this.readyState == 2) {
              _this.readyState = 3; //更改视频状态
              _this.emit('playing'); //触发playing
            }
            //处于跳转当中，并且当前时间和跳转时间相近，则认为跳转完成
            if (_this._isSeeking && Math.abs(_this.jsmpeg.currentTime - _this._seekingTime) < 0.1) {
              _this._isSeeking = false;
              _this._seekingTime = null;
              _this.emit('seeked');
            }
            _this.emit('timeupdate');
          }
          if (_this.jsmpeg.currentTime > _this.duration) _this.duration = _this.jsmpeg.currentTime + 1; //直播流/实时流是没有总播放时长的，但为了方便外部调用duration不会报错，这里默认给duration实时更新
          _this.emit('durationchange');
        },
        //连接断开
        onSourceDisconnected: function onSourceDisconnected() {
          _this.readyState = 0;
          _this.emit('abort');
        },
        //当播放开始时调用的回调函数
        onPlay: function onPlay() {
          _this.emit('play');
        },
        //当播放暂停时调用的回调函数(例如当.pause()被调用或源结束时)
        onPause: function onPause() {
          _this.emit('pause');
        },
        //当播放到达源的末尾时调用(只在loop=false调用)
        onEnded: function onEnded() {
          _this.emit('ended');
        },
        //当没有足够的数据播放时调用的回调
        onStalled: function onStalled() {
          _this.readyState = 2;
          _this.emit('waiting');
        }
      }));
      this.jsmpeg.volume = this.config.muted ? 0 : 1;
    }
    //卸载视频
  }, {
    key: "unload",
    value: function unload() {
      var _this$jsmpeg6;
      (_this$jsmpeg6 = this.jsmpeg) === null || _this$jsmpeg6 === void 0 || _this$jsmpeg6.destroy();
      this.jsmpeg = null;
      this.duration = null;
      this.jsmpeg = null;
      this.readyState = 0;
      this._init = null;
    }
    //播放视频
  }, {
    key: "play",
    value: function play() {
      var _this$jsmpeg7;
      (_this$jsmpeg7 = this.jsmpeg) === null || _this$jsmpeg7 === void 0 || _this$jsmpeg7.play();
    }
    //暂停视频
  }, {
    key: "pause",
    value: function pause() {
      var _this$jsmpeg8;
      (_this$jsmpeg8 = this.jsmpeg) === null || _this$jsmpeg8 === void 0 || _this$jsmpeg8.pause();
    }
    //抛出事件
  }, {
    key: "emit",
    value: function emit(name) {
      var _this$_event;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this._event['on' + name] && (_this$_event = this._event)['on' + name].apply(_this$_event, args);
    }
    //移除视频
  }, {
    key: "remove",
    value: function remove() {
      var _this$canvas2;
      (_this$canvas2 = this.canvas) === null || _this$canvas2 === void 0 || _this$canvas2.remove();
      this.canvas = null;
    }
  }]);
}(); //兼容new Function，为了挂载到window对象上
if (typeof window != 'undefined') {
  window.YbMpeg = YbMpeg;
}
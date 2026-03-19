"use strict";

function _slicedToArray(r, e) {
  return (
    _arrayWithHoles(r) ||
    _iterableToArrayLimit(r, e) ||
    _unsupportedIterableToArray(r, e) ||
    _nonIterableRest()
  );
}
function _nonIterableRest() {
  throw new TypeError(
    "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return (
      "Object" === t && r.constructor && (t = r.constructor.name),
      "Map" === t || "Set" === t
        ? Array.from(r)
        : "Arguments" === t ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
        ? _arrayLikeToArray(r, a)
        : void 0
    );
  }
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _iterableToArrayLimit(r, l) {
  var t =
    null == r
      ? null
      : ("undefined" != typeof Symbol && r[Symbol.iterator]) || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (((i = (t = t.call(r)).next), 0 === l)) {
        if (Object(t) !== t) return;
        f = !1;
      } else
        for (
          ;
          !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l);
          f = !0
        );
    } catch (r) {
      (o = !0), (n = r);
    } finally {
      try {
        if (!f && null != t["return"] && ((u = t["return"]()), Object(u) !== u))
          return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _typeof(o) {
  "@babel/helpers - typeof";
  return (
    (_typeof =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (o) {
            return typeof o;
          }
        : function (o) {
            return o &&
              "function" == typeof Symbol &&
              o.constructor === Symbol &&
              o !== Symbol.prototype
              ? "symbol"
              : typeof o;
          }),
    _typeof(o)
  );
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return (
      _regeneratorDefine2(
        u,
        "_invoke",
        (function (r, n, o) {
          var i,
            c,
            u,
            f = 0,
            p = o || [],
            y = !1,
            G = {
              p: 0,
              n: 0,
              v: e,
              a: d,
              f: d.bind(e, 4),
              d: function d(t, r) {
                return (i = t), (c = 0), (u = e), (G.n = r), a;
              },
            };
          function d(r, n) {
            for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
              var o,
                i = p[t],
                d = G.p,
                l = i[2];
              r > 3
                ? (o = l === n) &&
                  ((u = i[(c = i[4]) ? 5 : ((c = 3), 3)]), (i[4] = i[5] = e))
                : i[0] <= d &&
                  ((o = r < 2 && d < i[1])
                    ? ((c = 0), (G.v = n), (G.n = i[1]))
                    : d < l &&
                      (o = r < 3 || i[0] > n || n > l) &&
                      ((i[4] = r), (i[5] = n), (G.n = l), (c = 0)));
            }
            if (o || r > 1) return a;
            throw ((y = !0), n);
          }
          return function (o, p, l) {
            if (f > 1) throw TypeError("Generator is already running");
            for (
              y && 1 === p && d(p, l), c = p, u = l;
              (t = c < 2 ? e : u) || !y;

            ) {
              i ||
                (c
                  ? c < 3
                    ? (c > 1 && (G.n = -1), d(c, u))
                    : (G.n = u)
                  : (G.v = u));
              try {
                if (((f = 2), i)) {
                  if ((c || (o = "next"), (t = i[o]))) {
                    if (!(t = t.call(i, u)))
                      throw TypeError("iterator result is not an object");
                    if (!t.done) return t;
                    (u = t.value), c < 2 && (c = 0);
                  } else
                    1 === c && (t = i["return"]) && t.call(i),
                      c < 2 &&
                        ((u = TypeError(
                          "The iterator does not provide a '" + o + "' method"
                        )),
                        (c = 1));
                  i = e;
                } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
              } catch (t) {
                (i = e), (c = 1), (u = t);
              } finally {
                f = 1;
              }
            }
            return { value: t, done: y };
          };
        })(r, o, i),
        !0
      ),
      u
    );
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n]
      ? t(t([][n]()))
      : (_regeneratorDefine2((t = {}), n, function () {
          return this;
        }),
        t),
    u =
      (GeneratorFunctionPrototype.prototype =
      Generator.prototype =
        Object.create(c));
  function f(e) {
    return (
      Object.setPrototypeOf
        ? Object.setPrototypeOf(e, GeneratorFunctionPrototype)
        : ((e.__proto__ = GeneratorFunctionPrototype),
          _regeneratorDefine2(e, o, "GeneratorFunction")),
      (e.prototype = Object.create(u)),
      e
    );
  }
  return (
    (GeneratorFunction.prototype = GeneratorFunctionPrototype),
    _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype),
    _regeneratorDefine2(
      GeneratorFunctionPrototype,
      "constructor",
      GeneratorFunction
    ),
    (GeneratorFunction.displayName = "GeneratorFunction"),
    _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"),
    _regeneratorDefine2(u),
    _regeneratorDefine2(u, o, "Generator"),
    _regeneratorDefine2(u, n, function () {
      return this;
    }),
    _regeneratorDefine2(u, "toString", function () {
      return "[object Generator]";
    }),
    (_regenerator = function _regenerator() {
      return { w: i, m: f };
    })()
  );
}
function _regeneratorDefine2(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  (_regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine2(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r
      ? i
        ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t })
        : (e[r] = n)
      : (o("next", 0), o("throw", 1), o("return", 2));
  }),
    _regeneratorDefine2(e, r, n, t);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r &&
      (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })),
      t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2
      ? ownKeys(Object(t), !0).forEach(function (r) {
          _defineProperty(e, r, t[r]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
      : ownKeys(Object(t)).forEach(function (r) {
          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
  }
  return e;
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _classCallCheck(a, n) {
  if (!(a instanceof n))
    throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    (o.enumerable = o.enumerable || !1),
      (o.configurable = !0),
      "value" in o && (o.writable = !0),
      Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return (
    r && _defineProperties(e.prototype, r),
    t && _defineProperties(e, t),
    Object.defineProperty(e, "prototype", { writable: !1 }),
    e
  );
}
function _defineProperty(e, r, t) {
  return (
    (r = _toPropertyKey(r)) in e
      ? Object.defineProperty(e, r, {
          value: t,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[r] = t),
    e
  );
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var YbPlayer = /*#__PURE__*/ (function () {
  function YbPlayer(_ref) {
    var container = _ref.container,
      src = _ref.src,
      segments = _ref.segments,
      title = _ref.title,
      poster = _ref.poster,
      type = _ref.type,
      three = _ref.three,
      autoplay = _ref.autoplay,
      loop = _ref.loop,
      muted = _ref.muted,
      playbackRate = _ref.playbackRate,
      preload = _ref.preload,
      isLive = _ref.isLive,
      header = _ref.header,
      controls = _ref.controls,
      height = _ref.height,
      crossOrigin = _ref.crossOrigin,
      objectFit = _ref.objectFit,
      openDirection = _ref.openDirection,
      exitDirection = _ref.exitDirection,
      initialTime = _ref.initialTime,
      duration = _ref.duration,
      danmu = _ref.danmu,
      custom = _ref.custom,
      decoder = _ref.decoder,
      quality = _ref.quality,
      works = _ref.works,
      workIndex = _ref.workIndex,
      subtitles = _ref.subtitles,
      subtitleIndex = _ref.subtitleIndex;
    _classCallCheck(this, YbPlayer);
    this.container =
      typeof container == "string"
        ? document.querySelector(container)
        : container;
    this.src = src; //播放链接
    this.segments = segments; //切片列表 仅支持flv.js segments权重比src小，如果同时传入src和segments,以src优先
    this.title = title; //标题
    this.poster = poster || undefined; //封面
    this.type = type; //解码类型
    this.three = three || "none"; //3D模式
    this.autoplay = autoplay; //是否自动播放
    this.loop = loop; //是否循环播放
    this.muted = muted; //是否静音
    this.playbackRate = playbackRate || 1; //默认播放倍速
    this.preload = preload; //是否预加载
    this.isLive = isLive; //是否直播
    this.header = header; //显示头部控制栏
    this.controls = controls; //显示底部控制栏
    this.height = height || "auto"; //视频高度
    this.crossOrigin = crossOrigin; //跨域属性 anonymous-它有一个默认值。它定义了将在不传递凭据信息的情况下发送CORS请求 use-credentials-将发送带有凭据、cookie 和证书的 cross-origin 请求
    this.objectFit = objectFit; //当视频宽高超出容器时的表现形式 fill-内容拉伸填充 contain-保持比例内容缩放 cover-保持比例内容可能被剪切 none-内容不重置 scale-down-保持比例从none或contain选一个 initial-默认值
    this.openDirection = openDirection || "auto"; //全屏方向 auto-自动计算 landscape-横屏 portrait-竖屏
    this.exitDirection = exitDirection || "portrait"; //退出全屏时锁定的屏幕方向 landscape-横屏 portrait-竖屏
    this.initialTime = initialTime; //初始化时间
    this.duration = duration; //自定义时长
    this.danmu = danmu || []; //弹幕列表
    this.custom = custom || {}; //自定义配置
    this.decoder = decoder || {}; //解码器
    this.quality = quality || []; //画质列表
    this.works = works || []; //分p列表
    this.subtitles = subtitles || []; //字幕
    this.subtitleIndex = subtitleIndex || -1; //字幕索引 -1 - 关闭字幕
    this.workIndex = workIndex || 0; //分P索引
    this.video = null; //视频
    this.pano = null; //3D实例
    this.cm = null; //弹幕实例
    this.hls = null; //hls实例
    this.flv = null; //flv实例
    this.gesture = null; //手势实例
    this.subtitle = null; //字幕实例
    this.disabled = false; //是否锁屏
    this.currentTime = 0;
    this._isSeeking = false; //正在拖动进度中
    this._isDirection = false; //是否已经调用setDirection
    this._controlsTimer = null; //控制栏隐藏定时器
    this._toastTimer = null; //消息隐藏定时器
    this._danmuTimer = null; //弹幕定时器
    this._seizingTimer = null; //卡死定时器（播放一些直播源的时候，可能会出现卡死无反应的情况，需要做出处理）
    this._event = {};
  }
  //开启全屏按钮
  return _createClass(
    YbPlayer,
    [
      {
        key: "onmessage",
        get: function get() {
          return this._event.onmessage || null;
        },
        set: function set(callback) {
          this._event.onmessage = callback;
        },
      },
      {
        key: "load",
        value: function load() {
          this.container.innerHTML =
            '\n\t\t\t<div class="yb-player-wrapper" style="height: '
              .concat(
                this.height,
                '">\n\t\t\t\t<div class="yb-player-header"></div>\n\t\t\t\t<div class="yb-player-controls">\n\t\t\t\t\t<div class="yb-player-progress"></div>\n\t\t\t\t\t<div class="yb-player-controls-bottom yb-player-hide yb-player-full"></div>\n\t\t\t\t</div>\n\t\t\t\t<div class="yb-player-locks yb-player-hide">\n\t\t\t\t\t<div class="yb-player-lock yb-player-lock-left">'
              )
              .concat(
                YbPlayer.lockIcon,
                '</div>\n\t\t\t\t\t<div class="yb-player-lock yb-player-lock-right">'
              )
              .concat(
                YbPlayer.lockIcon,
                '</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="yb-player-danmu"></div>\n\t\t\t\t<div class="yb-player-toast"></div>\n\t\t\t\t<div class="yb-player-bottom-progress yb-player-hide"></div>\n\t\t\t</div>\n\t\t'
              );
          this._bindfullscreenerror = this._fullscreenerror.bind(this);
          this._bindfullscreenchanged = this._fullscreenchanged.bind(this);
          this.container.addEventListener(
            "fullscreenerror",
            this._bindfullscreenerror
          );
          this.container.addEventListener(
            "mozfullscreenerror",
            this._bindfullscreenerror
          );
          this.container.addEventListener(
            "msfullscreenerror",
            this._bindfullscreenerror
          );
          this.container.addEventListener(
            "webkitfullscreenerror",
            this._bindfullscreenerror
          );
          this.container.addEventListener(
            "fullscreenchange",
            this._bindfullscreenchanged
          );
          this.container.addEventListener(
            "mozfullscreenchange",
            this._bindfullscreenchanged
          );
          this.container.addEventListener(
            "msfullscreenchange",
            this._bindfullscreenchanged
          );
          this.container.addEventListener(
            "webkitfullscreenchange",
            this._bindfullscreenchanged
          );
        },
      },
      {
        key: "unload",
        value: function unload() {
          this._clearDanmuTimer();
          this._clearToastTimer();
          this._clearControlsTimer();
          this._removeBackbuttonListener();
          this._event = {}; //卸载所有监听事件
          if (this.container) {
            this.container.removeEventListener(
              "fullscreenerror",
              this._bindfullscreenerror
            );
            this.container.removeEventListener(
              "mozfullscreenerror",
              this._bindfullscreenerror
            );
            this.container.removeEventListener(
              "msfullscreenerror",
              this._bindfullscreenerror
            );
            this.container.removeEventListener(
              "webkitfullscreenerror",
              this._bindfullscreenerror
            );
            this.container.removeEventListener(
              "fullscreenchange",
              this._bindfullscreenchanged
            );
            this.container.removeEventListener(
              "mozfullscreenchange",
              this._bindfullscreenchanged
            );
            this.container.removeEventListener(
              "msfullscreenchange",
              this._bindfullscreenchanged
            );
            this.container.removeEventListener(
              "webkitfullscreenchange",
              this._bindfullscreenchanged
            );
            this._bindfullscreenerror = null;
            this._bindfullscreenchanged = null;
            this.container.innerHTML = "";
            this.container = null;
          }
        },
        /**
         * 加载视频
         * @param {String} type 加载类型 init-初始化视频 quality-切换画质 error-错误重加载
         */
      },
      {
        key: "loadVideo",
        value: function loadVideo() {
          var _this2 = this;
          var type =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : "init";
          this.video =
            YbPlayer.getDecodeType(this.decoder, this.src) == "jsmpeg" ||
            this.type == "jsmpeg"
              ? new YbMpeg()
              : document.createElement("VIDEO");
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          var lockEls = this.container.getElementsByClassName("yb-player-lock");
          var bProgressEl = this.container.getElementsByClassName(
            "yb-player-bottom-progress"
          )[0];
          this.showLoading();
          if (!this.isLive) this.loadRange();
          for (var i = 0; i < lockEls.length; i++) {
            YbPlayer.tap(lockEls[i], function () {
              if (_this2.disabled) _this2.enable();
              else _this2.disable();
            });
          }
          this.video.oncanplay = function () {
            _this2.emit("canplay", {
              duration: _this2.getDuration(),
              videoWidth: _this2.video.videoWidth,
              videoHeight: _this2.video.videoHeight,
              type: type,
            });
          };
          this.video.oncanplaythrough = function () {
            _this2.emit("canplaythrough", {
              duration: _this2.getDuration(),
              videoWidth: _this2.video.videoWidth,
              videoHeight: _this2.video.videoHeight,
              type: type,
            });
          };
          this.video.onloadedmetadata = function () {
            _this2.hideLoading();
            _this2.setInnerHTML(
              "yb-player-time",
              (_this2.isLive ? "直播中 · " : "") + "00:00"
            );
            _this2.setInnerHTML(
              "yb-player-duration",
              YbPlayer.timeFormat(_this2.getDuration())
            );
            _this2.emit("loadedmetadata", {
              duration: _this2.getDuration(),
              videoWidth: _this2.video.videoWidth,
              videoHeight: _this2.video.videoHeight,
              type: type,
            });
          };
          this.video.ondurationchange = function () {
            _this2.setInnerHTML(
              "yb-player-duration",
              YbPlayer.timeFormat(_this2.getDuration())
            );
            _this2.emit("durationchange", _this2.getDuration());
          };
          this.video.onloadeddata = function () {
            //非直播时初始化播放时长
            if (_this2.initialTime && !_this2.isLive)
              _this2.seek(_this2.initialTime);
            _this2.emit("loadeddata", {
              duration: _this2.getDuration(),
              videoWidth: _this2.video.videoWidth,
              videoHeight: _this2.video.videoHeight,
              type: type,
            });
          };
          this.video.onloadstart = function () {
            _this2.emit("loadstart", {
              type: type,
            });
          };
          this.video.onended = function () {
            _this2.emit("ended", {
              workIndex: _this2.workIndex,
            });
          };
          this.video.onvolumechange = function () {
            var mutedEl =
              _this2.container.getElementsByClassName("yb-player-muted")[0];
            if (mutedEl)
              _this2.video.muted
                ? mutedEl.classList.add("yb-player-icon-close")
                : mutedEl.classList.remove("yb-player-icon-close");
            _this2.emit("mutedchange", _this2.video.muted);
          };
          this.video.onratechange = function () {
            var playbackRate = _this2.video.playbackRate;
            if (_this2.cm) _this2.cm.setConfig("playbackRate", playbackRate);
            _this2.emit("ratechange", playbackRate);
            _this2.setInnerHTML(
              "yb-player-header-rate",
              "倍速x" + playbackRate
            );
            var rateEl =
              _this2.container.getElementsByClassName("yb-player-rate")[0] ||
              document.createElement("DIV");
            if (![1, 1.0].includes(playbackRate)) {
              rateEl.setAttribute("class", "yb-player-rate");
              rateEl.innerHTML =
                '\n\t\t\t\t\t<div class="yb-player-rate-icon">\n\t\t\t\t\t\t<i></i><i></i><i></i>\n\t\t\t\t\t</div>\n\t\t\t\t\t<span class="yb-player-rate-span">'.concat(
                  playbackRate + "倍速播放中",
                  "</span>\n\t\t\t\t"
                );
              var wrapperEl =
                _this2.container.getElementsByClassName("yb-player-wrapper")[0];
              if (wrapperEl) wrapperEl.appendChild(rateEl);
            } else {
              if (rateEl) rateEl.remove();
            }
          };
          this.video.ontimeupdate = function () {
            _this2.currentTime = _this2.video.currentTime;
            //如果是直播，需要更新直播时长，initialTime初始播放时长
            if (!_this2._isSeeking) {
              var currentTime = _this2.isLive
                ? _this2.video.currentTime + (_this2.initialTime || 0)
                : _this2.video.currentTime;
              _this2.setInnerHTML(
                "yb-player-time",
                (_this2.isLive ? "直播中 · " : "") +
                  YbPlayer.timeFormat(currentTime)
              );
              var rate = currentTime / _this2.getDuration();
              var rangeEl = _this2.container.getElementsByClassName(
                "yb-player-range-box"
              )[0];
              var focusEl = _this2.container.getElementsByClassName(
                "yb-player-range-focus"
              )[0];
              var thumbEl = _this2.container.getElementsByClassName(
                "yb-player-range-thumb"
              )[0];
              if (focusEl) focusEl.style.width = rate * 100 + "%";
              if (thumbEl && rangeEl)
                thumbEl.style.transform = "translate(calc(-50% + ".concat(
                  rate * rangeEl.offsetWidth,
                  "px), -50%)"
                );
              bProgressEl.style.width =
                (currentTime / _this2.getDuration()) * 100 + "%";
            }
            //如果自定义最大播放时长，当播放时长大于等于最大播放时长且不是直播时
            if (
              _this2.duration &&
              _this2.video.currentTime >= _this2.duration &&
              !_this2.isLive
            ) {
              if (_this2.loop) _this2.seek(0); //开启了循环播放则跳转0秒
              else {
                //未开启循环播放，则触发暂停，并派发ended事件，模拟视频播放结束事件
                _this2.video.pause();
                _this2.emit("ended", {
                  workIndex: _this2.workIndex,
                });
              }
            }
            _this2._clearSeizingTimer();
            _this2._seizingTimer = window.setTimeout(function () {
              if (_this2.video && _this2.video.src && !_this2.video.paused)
                _this2.emit("seizing");
            }, 5000);
            _this2.emit("timeupdate", _this2.video.currentTime);
          };
          this.video.onplay = function () {
            _this2.playDanmu();
            _this2.playSubtitle();
            _this2.playPano();
            _this2.setInnerHTML("yb-player-toggle", YbPlayer.pauseIcon);
            _this2.hideLoading();
            //如果有自定义时长，当播放时长大于等于最大时长时，强制跳转到0秒，模拟视频播放完结束后点击重新播放
            if (
              _this2.duration &&
              _this2.video.currentTime >= _this2.duration &&
              !_this2.isLive
            )
              _this2.seek(0);
            _this2.emit("play");
          };
          this.video.onpause = function () {
            _this2.stopDanmu();
            _this2.stopSubtitle();
            _this2.setInnerHTML("yb-player-toggle", YbPlayer.playIcon);
            _this2.hideLoading();
            _this2.emit("pause");
          };
          this.video.onseeking = function () {
            _this2.emit("seeking", _this2.video.currentTime);
          };
          this.video.onseeked = function () {
            _this2.seekDanmu(_this2.video.currentTime);
            _this2.emit("seeked", _this2.video.currentTime);
          };
          this.video.onplaying = function () {
            _this2.playDanmu();
            _this2.playSubtitle();
            _this2.hideLoading();
            _this2.emit("playing");
          };
          this.video.onwaiting = function () {
            _this2.stopDanmu();
            _this2.stopSubtitle();
            _this2.showLoading();
            _this2.emit("waiting");
          };
          this.video.onprogress = function () {
            var bufferer = _this2.video.buffered;
            if (bufferer.length > 0) {
              var bufferedEnd = bufferer.end(bufferer.length - 1);
              var duration = _this2.getDuration();
              var bufferPercent = (bufferedEnd / duration) * 100;
              var preload = _this2.container.getElementsByClassName(
                "yb-player-range-preload"
              )[0];
              if (preload) preload.style.width = bufferPercent + "%";
            }
            _this2.emit("progress");
          };
          this.video.onabort = function () {
            //如果container不存在了，说明被销毁了，后面就不执行了
            // if ( this.container ) {
            // 	this.showError('播放中断')
            // 	this.unloadVideo()
            // }
            _this2.emit("abort");
          };
          this.video.onerror = function (e) {
            if (e && e.target.error) {
              // 网络问题或其他不可恢复的错误
              var code = e.target.error.code;
              var errorMsg = "";
              switch (code) {
                case 1:
                  errorMsg = "视频加载中止，请检查网络连接";
                  break;
                case 2:
                  errorMsg = "网络错误，请检查网络连接";
                  break;
                case 3:
                  errorMsg = "视频解码错误，格式可能不受支持";
                  break;
                case 4:
                  errorMsg = "视频源不支持或地址无效";
                  break;
              }
              _this2.showError(errorMsg);
              _this2.unloadVideo();
            }
            _this2.emit("error", e);
          };
          //视频长按菜单取消
          this.video.oncontextmenu = function (e) {
            e.preventDefault();
          };
          //设置属性，让video不被劫持
          this.video.setAttribute("x-webkit-airplay", "allow");
          this.video.setAttribute("webkit-playsinline", true);
          this.video.setAttribute("playsinline", true);
          this.video.setAttribute("x5-video-player-type", "h5");
          this.video.setAttribute("x5-video-play", true);
          this.video.setAttribute(
            "style",
            "position: relative;z-index:0;width:100%;height:" +
              (this.getFullscreen() ? "100%" : this.height) +
              ";object-fit:" +
              this.objectFit
          );
          this.video.setAttribute("poster", this.poster);
          if (this.crossOrigin)
            this.video.setAttribute("crossOrigin", this.crossOrigin);
          //设置video基础属性
          this.video.autoplay = ["quality", "error"].includes(type)
            ? true
            : this.autoplay; //加载类型为切换画质和错误重加载时，需要自动播放，不保证一定能成功
          this.video.loop = this.loop;
          this.video.muted = this.muted;
          this.video.defaultMuted = this.muted;
          this.video.playbackRate = this.playbackRate;
          this.video.defaultPlaybackRate = this.playbackRate;
          this.video.preload = this.preload;
          this.video.controls = false;
          this.video.volume = 1;
          wrapperEl.insertBefore(
            this.getVideoElement(),
            this.container.getElementsByClassName("yb-player-danmu")[0]
          ); //将视频插入弹幕容器前方，让弹幕容器层级高于视频
          //如果传入了src，去判断播放链接的类型
          if (this.src && (!this.decoder[this.type] || this.type == "auto"))
            this.type = YbPlayer.getDecodeType(this.decoder, this.src);
          else if (this.segments && this.segments.length) this.type = "flv"; //否则如果传入了segments，解码器直接使用flv
          if (this.type == "video") this.video.src = this.src;
          else this.loadDecoder(); //异步加载解码器加载视频链接（此时可以不再管理视频）
          if (this.three != "none") this.loadPano(); //加载3D场景
          else this.loadCustom(); //加载自定义配置 如果开启了3D，则不需要主动去加载自定义配置，因为加载完3D场景后会自动去加载一次
        },
        //卸载视频
      },
      {
        key: "unloadVideo",
        value: function unloadVideo() {
          this._clearSeizingTimer();
          this.unloadCustom();
          this.unloadDecoder();
          this.unloadPano();
          if (this.video) {
            //判断一下是否是video元素
            // this.video.onclick = null
            this.video.onloadedmetadata = null;
            this.video.onended = null;
            this.video.onvolumechange = null;
            this.video.ontimeupdate = null;
            this.video.onplay = null;
            this.video.onpause = null;
            this.video.onseeked = null;
            this.video.onplaying = null;
            this.video.onwaiting = null;
            this.video.onprogress = null;
            this.video.onerror = null;
            this.video.oncontextmenu = null;
            this.video.pause();
            //移除src 释放视频资源
            this.video.removeAttribute("src");
            this.video.load();
            this.video.remove();
            this.video = null;
          }
          this.currentTime = 0;
          this.unloadRange();
        },

        //加载解码器
      },
      {
        key: "loadDecoder",
        value: (function () {
          var _loadDecoder = _asyncToGenerator(
            /*#__PURE__*/ _regenerator().m(function _callee() {
              var _this3 = this;
              var loader, config;
              return _regenerator().w(
                function (_context) {
                  while (1)
                    switch (_context.n) {
                      case 0:
                        if (!this.type)
                          this.type = YbPlayer.getDecodeType(
                            this.decoder,
                            this.src
                          );
                        //检测是否支持video播放
                        if (this.type) {
                          _context.n = 2;
                          break;
                        }
                        _context.n = 1;
                        return YbPlayer.checkWithVideo(this.src);
                      case 1:
                        this.type = _context.v;
                      case 2:
                        if (this.type) {
                          _context.n = 4;
                          break;
                        }
                        _context.n = 3;
                        return YbPlayer.checkWithHls(
                          this.decoder.hls.loader,
                          this.src
                        );
                      case 3:
                        this.type = _context.v;
                      case 4:
                        if (this.type) {
                          _context.n = 6;
                          break;
                        }
                        _context.n = 5;
                        return YbPlayer.checkWithFlv(
                          this.decoder.flv.loader,
                          this.src
                        );
                      case 5:
                        this.type = _context.v;
                      case 6:
                        if (this.type == "hls") {
                          loader = this.decoder[this.type].loader;
                          config = this.decoder[this.type].config;
                          this.hls = new loader(config);
                          this.hls.loadSource(this.src);
                          this.hls.attachMedia(this.video);
                          this.hls.on(loader.Events.ERROR, function (e, data) {
                            _this3.emit("hlserror", {
                              event: e,
                              data: data,
                            });
                            if (data.fatal) {
                              switch (data.type) {
                                case loader.ErrorTypes.NETWORK_ERROR:
                                  //对于网络相关的错误
                                  _this3.hls.startLoad();
                                  break;
                                case loader.ErrorTypes.MEDIA_ERROR:
                                  //媒体/视频相关错误
                                  _this3.hls.recoverMediaError();
                                  break;
                                default:
                                  //不可恢复的错误
                                  _this3.showError();
                                  _this3.unloadVideo();
                                  break;
                              }
                            }
                          });
                        } else if (this.type == "flv") {
                          loader = this.decoder[this.type].loader;
                          config = this.decoder[this.type].config || {};
                          this.flv = loader.createPlayer(
                            _objectSpread(
                              {
                                type: "flv",
                                isLive: this.isLive,
                                url: this.src,
                                segments:
                                  this.segment && this.segments.length
                                    ? this.segment
                                    : null,
                              },
                              config
                            ),
                            _objectSpread(
                              {
                                enableWorker: false,
                                //不启用分离线程
                                enableStashBuffer: false,
                                //关闭IO隐藏缓冲区
                                isLive: this.isLive,
                                lazyLoad: false,
                              },
                              config
                            )
                          );
                          this.flv.on(
                            "error",
                            function (errorType, errorDetail, errorInfo) {
                              _this3.emit("flverror", {
                                errorType: errorType,
                                errorDetail: errorDetail,
                                errorInfo: errorInfo,
                              });
                              if (
                                YbPlayer.isFlvFatalError(
                                  errorType,
                                  errorDetail,
                                  errorInfo
                                )
                              ) {
                                _this3.showError();
                                _this3.unloadVideo();
                              }
                            }
                          );
                          this.flv.attachMediaElement(this.video);
                          this.flv.load();
                        } else if (this.type == "jsmpeg") {
                          loader = this.decoder[this.type].loader;
                          config = this.decoder[this.type].config || {};
                          this.video.setDecoder(loader);
                          this.video.setConfig(
                            _objectSpread(
                              _objectSpread({}, config),
                              {},
                              {
                                loop: this.loop,
                                autoplay: this.autoplay,
                                poster: this.poster,
                                muted: this.muted,
                              }
                            )
                          );
                          this.video.src = this.src;
                          this.video.load();
                        } else if (this.type == "video") {
                          this.video.src = this.src;
                        } else {
                          this.showError("解码失败");
                          this.unloadVideo();
                        }
                      case 7:
                        return _context.a(2);
                    }
                },
                _callee,
                this
              );
            })
          );
          function loadDecoder() {
            return _loadDecoder.apply(this, arguments);
          }
          return loadDecoder;
        })(), //卸载解码器
      },
      {
        key: "unloadDecoder",
        value: function unloadDecoder() {
          if (this.hls) {
            this.hls.destroy();
            this.hls = null;
          }
          if (this.flv) {
            this.flv.pause();
            this.flv.unload();
            this.flv.detachMediaElement();
            this.flv.destroy();
            this.flv = null;
          }
        },

        //加载3D场景
      },
      {
        key: "loadPano",
        value: function loadPano() {
          this.pano = new YbPano(this, this.custom.pano || {});
          this.pano.init();
          //当前视频正在播放，需要同步播放3D
          if (this.video && !this.video.paused) this.playPano();
          //加载3D后需要重新loadCustom
          this.unloadCustom();
          this.loadCustom();
          if (!this.gesture) return;
          var controlsType = this.pano.getControlsType();
          if (controlsType == "orbit") this.disableGesture();
          else this.enableGesture();
        },
        //卸载3D场景
      },
      {
        key: "unloadPano",
        value: function unloadPano() {
          if (this.pano) {
            this.pano.dispose();
            this.pano = null;
            //卸载3D模式后后需要重新loadCustom
            this.unloadCustom();
            this.loadCustom();

            //开启手势事件
            this.enableGesture();
          }
        },
        //播放3D
      },
      {
        key: "playPano",
        value: function playPano() {
          var panoEl =
            this.container.getElementsByClassName("yb-player-pano")[0];
          if (panoEl && panoEl.style.visibility != "visible") {
            panoEl.style.visibility = "visible";
            //加载视频纹理
            this.pano && this.pano.createVideoSphere();
          }
          this.pano && this.pano.animate();
        },
        //刷新3D场景
      },
      {
        key: "refreshPano",
        value: function refreshPano() {
          if (!this.pano) return;
          this.pano.updateSize(); //重置大小
        },

        //加载弹幕
      },
      {
        key: "loadDanmu",
        value: function loadDanmu() {
          if (this.video) {
            var config = Object.assign(
              {},
              {
                show: true,
                speed: 1,
                timeDiffrence: 0,
                fontScale: 1,
                fontSize: 18,
                opacity: 1.0,
                color: "#ffffff",
                overlap: false,
                disableScroll: false,
                //关闭滚动弹幕
                disableTop: false,
                //关闭顶端弹幕
                disableBottom: false,
                //关闭底端弹幕
                disableFilter: false, //关闭弹幕过滤
              },
              this.custom.danmu || {}
            );
            this.custom.danmu = config;
            this.cm = new YbDanmu(
              this.container.getElementsByClassName("yb-player-danmu")[0],
              YbPlayer.deepClone(this.danmu || []),
              config
            );
            this.cm.load();
            if (this.video.currentTime > 0)
              this.seekDanmu(this.video.currentTime);
            if (!this.video.paused) this.playDanmu();
            //加载弹幕后需要重新loadCustom
            this.unloadCustom();
            this.loadCustom();
            if (config.show) this.showDanmu();
            else this.hideDanmu();
          }
        },
        //卸载弹幕
      },
      {
        key: "unloadDanmu",
        value: function unloadDanmu() {
          if (this.cm) {
            this.stopDanmu();
            this.cm.unload();
            this.cm = null;
            //卸载弹幕后需要重新loadCustom
            this.unloadCustom();
            this.loadCustom();
          }
        },
        //展示弹幕
      },
      {
        key: "showDanmu",
        value: function showDanmu() {
          if (this.cm) {
            this.cm.show();
            var danmuVisibleEl = this.container.getElementsByClassName(
              "yb-player-danmu-visible"
            )[0];
            danmuVisibleEl.classList.remove("yb-player-icon-close");
          }
        },
        //隐藏弹幕
      },
      {
        key: "hideDanmu",
        value: function hideDanmu() {
          if (this.cm) {
            this.cm.hide();
            var danmuVisibleEl = this.container.getElementsByClassName(
              "yb-player-danmu-visible"
            )[0];
            danmuVisibleEl.classList.add("yb-player-icon-close");
          }
        },
        /**
         * 发送并显示弹幕
         * @param { Object|String } danmu 弹幕内容
         * @param { Boolean } border 使用边框
         */
      },
      {
        key: "sendDanmu",
        value: function sendDanmu(danmu, border) {
          if (!this.cm) return;
          var time = this.video.currentTime;
          danmu =
            typeof danmu == "string"
              ? {
                  text: danmu,
                }
              : danmu;
          var obj = _objectSpread(
            {
              time: time,
              color: "#ffffff",
            },
            danmu
          );
          if (this.danmu) this.danmu.push(obj);
          this.cm.send(obj, border);
          this.emit("danmusend", obj);
        },
        /**
         * 插入弹幕数据
         * @param { Object|String } danmu 弹幕内容
         */
      },
      {
        key: "insertDanmu",
        value: function insertDanmu(danmu) {
          if (!this.cm) return;
          var time = this.video.currentTime;
          danmu =
            typeof danmu == "string"
              ? {
                  text: danmu,
                }
              : danmu;
          var obj = _objectSpread(
            {
              time: time,
              color: "#ffffff",
            },
            danmu
          );
          if (this.danmu) this.danmu.push(obj);
          this.cm.insert(obj);
        },
        //播放弹幕
      },
      {
        key: "playDanmu",
        value: function playDanmu() {
          var _this4 = this;
          this._clearDanmuTimer();
          if (this.cm) this.cm.play();
          this._danmuTimer = window.setInterval(function () {
            _this4.cm && _this4.cm.time(_this4.video.currentTime);
          }, 100);
        },
        //暂停弹幕
      },
      {
        key: "stopDanmu",
        value: function stopDanmu() {
          this._clearDanmuTimer();
          if (this.cm) this.cm.pause();
        },
        //跳转弹幕
      },
      {
        key: "seekDanmu",
        value: function seekDanmu(time) {
          // if ( this.cm ) this.cm.goto(time * 1000)
          this.cm && this.cm.seek(time);
        },
        //刷新弹幕
      },
      {
        key: "refreshDanmu",
        value: function refreshDanmu() {
          var _this5 = this;
          if (!this.cm) return;
          if (this._danmuRefreshtimer) {
            clearTimeout(this._danmuRefreshtimer);
            this._danmuRefreshtimer = null;
          }
          this._danmuRefreshtimer = window.setTimeout(function () {
            _this5.cm.refresh(); //重置弹幕舞台大小
          }, 200);
        },

        //加载字幕
      },
      {
        key: "loadSubtitle",
        value: (function () {
          var _loadSubtitle = _asyncToGenerator(
            /*#__PURE__*/ _regenerator().m(function _callee2() {
              return _regenerator().w(
                function (_context2) {
                  while (1)
                    switch (_context2.n) {
                      case 0:
                        _context2.n = 1;
                        return YbSubtitle.init(
                          this,
                          this.subtitles[this.subtitleIndex].src,
                          this.custom.subtitle || {}
                        );
                      case 1:
                        this.subtitle = _context2.v;
                        if (this.video && !this.video.paused)
                          this.playSubtitle();
                      case 2:
                        return _context2.a(2);
                    }
                },
                _callee2,
                this
              );
            })
          );
          function loadSubtitle() {
            return _loadSubtitle.apply(this, arguments);
          }
          return loadSubtitle;
        })(), //卸载字幕
      },
      {
        key: "unloadSubtitle",
        value: function unloadSubtitle() {
          this.subtitle && this.subtitle.unload();
        },
        //播放字幕
      },
      {
        key: "playSubtitle",
        value: function playSubtitle() {
          this.subtitle && this.subtitle.play();
        },
        //暂停字幕
      },
      {
        key: "stopSubtitle",
        value: function stopSubtitle() {
          this.subtitle && this.subtitle.pause();
        },

        //展示蒙层避免误操作
      },
      {
        key: "showMask",
        value: function showMask() {
          var _this6 = this;
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          if (wrapperEl) {
            var maskEl = document.createElement("DIV");
            maskEl.setAttribute("class", "yb-player-mask");
            // maskEl.onclick = () => {
            // 	this.hideToolbar()
            // 	this.hidePopup()
            // }
            YbPlayer.tap(maskEl, function () {
              _this6.hideToolbar();
              _this6.hidePopup();
            });
            wrapperEl.appendChild(maskEl); //加入蒙层
          }
        },
        //隐藏蒙层
      },
      {
        key: "hideMask",
        value: function hideMask() {
          var maskEls = this.container.querySelectorAll(".yb-player-mask");
          maskEls.forEach(function (t) {
            return t.remove();
          });
        },

        /**
         * 展示工具栏
         * @param {String} selector 选择器
         * @param {Array} list 工具栏列表
         * @param {Boolean} isCheck 是否展示选择框
         * @param {Number} checkIndex 选择框索引
         */
      },
      {
        key: "showToolbar",
        value: function showToolbar(selector, list, isCheck, checkIndex) {
          var _this7 = this;
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          if (wrapperEl) {
            this.showMask();
            var toolbarEl = document.createElement("DIV");
            toolbarEl.setAttribute("class", "yb-player-toolbar");
            list.forEach(function (item, key) {
              toolbarEl.innerHTML += isCheck
                ? '\n\t\t\t\t\t<div class="yb-player-toolbar-item">\n\t\t\t\t\t\t<span>'
                    .concat(
                      item.text,
                      '</span>\n\t\t\t\t\t\t<span class="yb-player-check'
                    )
                    .concat(
                      checkIndex == key ? " yb-player-check-active" : "",
                      '"></span>\n\t\t\t\t\t</div>\n\t\t\t\t'
                    )
                : '<div class="yb-player-toolbar-item">'.concat(
                    item.text,
                    "</div>"
                  );
            });
            var children = toolbarEl.children || [];
            var _loop = function _loop(i) {
              // children[i].onclick = () => {
              // 	this.hideToolbar();
              // 	list[i].click()
              // }
              YbPlayer.tap(children[i], function () {
                _this7.hideToolbar();
                list[i].click();
              });
            };
            for (var i = 0; i < children.length; i++) {
              _loop(i);
            }
            toolbarEl.setAttribute("style", "visibility:hidden"); //隐藏工具栏
            wrapperEl.appendChild(toolbarEl); //先插入不显示的工具栏，因为需要计算工具栏尺寸
            var element = this.container.querySelector(selector); //获取点击选择器
            var rect = element.getBoundingClientRect(); //获取点击元素的尺寸布局信息
            var boxWidth = this.container.offsetWidth;
            var boxHeight = this.container.offsetHeight;
            var top = rect.top + rect.height; //计算顶部定位
            var left = rect.left; //计算左边定位
            var right = boxWidth - rect.right; //计算右边定位
            var bottom = boxHeight - rect.bottom + rect.height; //计算底部定位
            var isTop = true; //是否定位顶部 true-定位顶部 false-定位底部
            var isLeft = true; //是否定位左边 true-定位左边 false-定位右边
            if (top > boxHeight / 2) isTop = false; //判断点击元素是否在盒子上半部
            if (left + toolbarEl.offsetWidth > boxWidth) isLeft = false; //判断定位左边时，工具栏是否超出container
            toolbarEl.setAttribute(
              "style",
              ""
                .concat(
                  isTop ? "top:" + top + "px" : "bottom:" + bottom + "px",
                  ";"
                )
                .concat(
                  isLeft ? "left:" + left + "px" : "right:" + right + "px",
                  ";transform-origin:"
                )
                .concat(isTop ? "top" : "bottom", " ")
                .concat(isLeft ? "left" : "right")
            );
            toolbarEl.style.maxHeight =
              (isTop ? boxHeight - top : boxHeight - bottom) + "px"; //设置工具栏最大高度，避免超出容器后无法滚动内容
            wrapperEl.removeChild(toolbarEl); //移除工具栏（因为需要动画效果，所以先移除，再添加）
            wrapperEl.appendChild(toolbarEl); //再添加工具栏
          }
        },
        //隐藏工具栏
      },
      {
        key: "hideToolbar",
        value: function hideToolbar() {
          this.hideMask();
          var toolbarEls =
            this.container.querySelectorAll(".yb-player-toolbar");
          toolbarEls.forEach(function (t) {
            return t.remove();
          });
        },

        /**
         * 展示弹窗
         * @param {String} title 弹窗标题
         * @param {HtmlElement} dom 弹窗内容
         * @param {String} mode 弹窗方向 center-中间弹窗
         */
      },
      {
        key: "showPopup",
        value: function showPopup(title, dom, mode) {
          var _this8 = this;
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          if (wrapperEl) {
            this.showMask();
            var popupEl = document.createElement("DIV");
            var popupDirection = "";
            if (mode == "center") {
              popupDirection = "yb-player-popup-center";
            } else {
              var boxWidth = this.container.offsetWidth;
              var boxHeight = this.container.offsetHeight;
              var rate = boxWidth / boxHeight;
              popupDirection =
                rate > 1
                  ? "yb-player-popup-landscape"
                  : "yb-player-popup-portrait";
            }
            popupEl.setAttribute("class", "yb-player-popup " + popupDirection);
            popupEl.innerHTML =
              '\n\t\t\t\t<div class="yb-player-popup-title">'.concat(
                title,
                '</div>\n\t\t\t\t<span class="yb-player-popup-close"></span>\n\t\t\t\t<div class="yb-player-popup-content"></div>\n\t\t\t'
              );
            var contentEl = popupEl.getElementsByClassName(
              "yb-player-popup-content"
            )[0];
            contentEl.appendChild(dom);
            var closeEl = popupEl.getElementsByClassName(
              "yb-player-popup-close"
            )[0];
            // closeEl.onclick = () => {
            // 	this.hidePopup()
            // }
            YbPlayer.tap(closeEl, function () {
              _this8.hidePopup();
            });
            wrapperEl.appendChild(popupEl);
          }
        },
        //隐藏弹窗
      },
      {
        key: "hidePopup",
        value: function hidePopup() {
          this.hideMask();
          var popupEls = this.container.querySelectorAll(".yb-player-popup");
          popupEls.forEach(function (p) {
            return p.remove();
          });
        },

        //插入元素
      },
      {
        key: "appendDom",
        value: function appendDom(dom) {
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          wrapperEl.appendChild(dom);
        },

        //移除元素
      },
      {
        key: "removeDom",
        value: function removeDom(dom) {
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          wrapperEl.removeChild(dom);
        },
      },
      {
        key: "showMoreSetting",
        value: function showMoreSetting() {
          var _this9 = this;
          var header = this.custom.header || {};
          var more = YbPlayer.deepClone(header.more || []);
          if (!header.disableLock) {
            // more.unshift({
            //   text: '锁定屏幕',
            //   click: function click() {
            //     if (_this9.disabled) _this9.enable();else _this9.disable();
            //   }
            // });
          }
          if (!header.disableThreeCapture && this.three != "none") {
            more.unshift({
              text: "渲染截图",
              click: function click() {
                _this9.capture("three");
              },
            });
          }
          if (!header.disableCapture) {
            more.unshift({
              text: "视频截图",
              click: function click() {
                _this9.capture();
              },
            });
          }
          if (this.cm && !header.disableDanmuFilter && this.getFullscreen()) {
            more.unshift({
              text: "弹幕过滤",
              click: function click() {
                if (_this9.getPopup()) _this9.hidePopup();
                _this9.showDanmuFilter();
              },
            });
          }
          if (this.cm && !header.disableDanmuSetting && this.getFullscreen()) {
            more.unshift({
              text: "弹幕设置",
              click: function click() {
                if (_this9.getPopup()) _this9.hidePopup();
                _this9.showDanmuSetting();
              },
            });
          }
          this.showToolbar(".yb-player-more", more);
        },

        //展示画质列表
      },
      {
        key: "showQuality",
        value: function showQuality() {
          var _this0 = this;
          var quality = this.custom.quality || {};
          var qualityName = quality.name || "画质";
          var list = this.quality.map(function (q, k) {
            return {
              text: q.title,
              click: function click() {
                _this0.initialTime = _this0.video.currentTime;
                _this0.src = q.src;
                _this0.type = q.type;
                _this0.stopDanmu();
                _this0.unloadVideo();
                _this0.loadVideo("quality");
                _this0.hideControls();
                _this0.showToast("切换" + qualityName + "到" + q.title);
                _this0.emit("qualitychange", {
                  index: k,
                  detail: q,
                }); //派发更改事件，以便开发者外部记录
              },
            };
          });
          var index = this.quality.findIndex(function (q) {
            return q.src == _this0.src;
          });
          this.showToolbar(".yb-player-quality", list, true, index);
        },
        //展示字幕列表
      },
      {
        key: "showSubtitle",
        value: function showSubtitle() {
          var _this1 = this;
          var list = this.subtitles.map(function (s, k) {
            return {
              text: s.title,
              click: function click() {
                _this1.subtitleIndex = k;
                var subtitleEl =
                  _this1.container.getElementsByClassName(
                    "yb-player-subtitle"
                  )[0];
                subtitleEl.classList.remove("yb-player-icon-close");
                subtitleEl.innerHTML = s.title;
                _this1.unloadSubtitle();
                _this1.loadSubtitle();
                _this1.emit("subtitlechange", {
                  index: k,
                  detail: s,
                }); //派发字幕更改事件，以便开发者外部记录
              },
            };
          });
          list.push({
            text: "关闭字幕",
            click: function click() {
              _this1.subtitleIndex = -1;
              var subtitleEl =
                _this1.container.getElementsByClassName(
                  "yb-player-subtitle"
                )[0];
              subtitleEl.classList.add("yb-player-icon-close");
              subtitleEl.innerHTML = "字幕";
              _this1.unloadSubtitle();
              _this1.emit("subtitlechange", {
                index: _this1.subtitleIndex,
              }); //派发字更改事件，以便开发者外部记录
            },
          });
          var index =
            this.subtitleIndex == -1 ? list.length - 1 : this.subtitleIndex;
          this.showToolbar(".yb-player-subtitle", list, true, index);
        },
        //展示倍速播放选项
      },
      {
        key: "showPlaybackRate",
        value: function showPlaybackRate() {
          var _this10 = this;
          var arr = [
            {
              text: "0.5倍速",
              value: 0.5,
            },
            {
              text: "正常倍速",
              value: 1,
            },
            {
              text: "1.5倍速",
              value: 1.5,
            },
            {
              text: "1.75倍速",
              value: 1.75,
            },
            {
              text: "2倍速",
              value: 2,
            },
            {
              text: "3倍速",
              value: 3,
            },
          ];
          var list = arr.map(function (a, k) {
            return {
              text: a.text,
              click: function click() {
                _this10.hideToolbar();
                if (_this10.video) _this10.video.playbackRate = a.value;
              },
            };
          });
          var index = arr.findIndex(function (a) {
            return a.value == _this10.video.playbackRate;
          });
          this.showToolbar(".yb-player-header-rate", list, true, index);
        },

        //展示3D模式选项
      },
      {
        key: "showThree",
        value: function showThree() {
          var _this11 = this;
          var arr = [
            {
              label: "关闭3D",
              value: "none",
            },
            {
              label: "360全景",
              value: "360",
            },
          ];
          var list = arr.map(function (a, k) {
            return {
              text: a.label,
              click: function click() {
                _this11.three = a.value;
                var headerThreeEl = _this11.container.getElementsByClassName(
                  "yb-player-header-three"
                )[0];
                if (a.value == "none") _this11.unloadPano();
                else _this11.loadPano();
                _this11.hideControls(); //隐藏一次控制栏，否则控制栏显示会异常
                _this11.setInnerHTML("yb-player-header-three", a.label);
                _this11.emit("threechange", a); //派发更改事件，以便开发者外部记录
              },
            };
          });
          var index = arr.findIndex(function (a) {
            return a.value == _this11.three;
          });
          this.showToolbar(".yb-player-header-three", list, true, index);
        },

        //展示全景视频控制器类型列表
      },
      {
        key: "showPanoControls",
        value: function showPanoControls() {
          var _this12 = this;
          var arr = [
            {
              label: "陀螺仪",
              value: "orientation",
            },
            {
              label: "滑动",
              value: "orbit",
            },
            {
              label: "关闭",
              value: "close",
            },
          ];
          var list = arr.map(function (a, k) {
            return {
              text: a.label,
              click: function click() {
                var panoControlEl = _this12.container.getElementsByClassName(
                  "yb-player-pano-controls"
                )[0];
                var item = a; //记录当前点击类型
                if (a.value == "close") {
                  if (panoControlEl)
                    panoControlEl.classList.add("yb-player-icon-close");
                  _this12.pano && _this12.pano.unloadControls(); //卸载3D控制器
                  _this12.showToast("关闭动画传感器");
                  _this12.setInnerHTML("yb-player-pano-controls", "传感器");
                } else {
                  if (panoControlEl)
                    panoControlEl.classList.remove("yb-player-icon-close");
                  _this12.showToast("切换动画传感器类型为" + a.label);
                  _this12.pano && _this12.pano.setControlsType(a.value);
                  //这里需要实时获取控制器类型，因为陀螺仪可能会开启失败
                  var _controlsType = _this12.pano.getControlsType();
                  var _index = arr.findIndex(function (item) {
                    return item.value == _controlsType;
                  });
                  if (_index > -1) item = arr[_index];
                  _this12.setInnerHTML("yb-player-pano-controls", item.label);
                }
                if (item.value == "orbit")
                  _this12.disableGesture(); //禁用手势事件
                else _this12.enableGesture(); //开启手势事件
                _this12.emit("panocontrolschange", item); //派发更改事件，以便开发者外部记录
              },
            };
          });
          var controlsType = this.pano.getControlsType(); //获取传感器类型
          var index = arr.findIndex(function (a) {
            return a.value == controlsType;
          });
          this.showToolbar(".yb-player-pano-controls", list, true, index);
        },

        //展示分P列表
      },
      {
        key: "showWorks",
        value: function showWorks() {
          var _this13 = this;
          this.hideControls();
          var list = this.works.map(function (q, key) {
            return {
              text: q.title,
              click: function click() {
                var activeEl = _this13.container.getElementsByClassName(
                  "yb-player-work-item-active"
                )[0];
                if (activeEl)
                  activeEl.classList.remove("yb-player-work-item-active");
                var elementEl = _this13.container.getElementsByClassName(
                  "yb-player-work-item-" + key
                )[0];
                if (elementEl)
                  elementEl.classList.add("yb-player-work-item-active");
                _this13.workIndex = key;
                _this13.change(key);
              },
            };
          });
          var div = document.createElement("DIV");
          list.forEach(function (item, key) {
            div.innerHTML +=
              '\n\t\t\t\t<div class="yb-player-work-item yb-player-ellipsis yb-player-work-item-'
                .concat(key)
                .concat(
                  _this13.workIndex == key ? " yb-player-work-item-active" : "",
                  '">'
                )
                .concat(item.text, "</div>\n\t\t\t");
          });
          var children = div.children || [];
          for (var i = 0; i < children.length; i++) {
            // children[i].onclick = list[i].click
            YbPlayer.tap(children[i], list[i].click);
          }
          var work = this.custom.work || {};
          var worksName = work.name || "分P";
          this.showPopup(worksName + "列表", div);
          var scrollEl = this.container.getElementsByClassName(
            "yb-player-popup-content"
          )[0];
          var elementEl = this.container.getElementsByClassName(
            "yb-player-work-item-" + this.workIndex
          )[0];
          if (elementEl)
            scrollEl.scroll({
              top: elementEl.offsetTop - elementEl.offsetHeight - 10,
            });
        },
      },
      {
        key: "showDanmuSetting",
        value: function showDanmuSetting() {
          var _this14 = this;
          this.hideControls();
          var config = YbPlayer.deepClone(this.custom.danmu);
          var div = document.createElement("DIV");
          div.setAttribute("class", "yb-player-danmu-setting");
          div.innerHTML =
            '\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5168\u90E8\u663E\u793A</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<span data-visible="1" class="yb-player-setting-switch '
              .concat(
                this.getDanmuVisible() ? "yb-player-setting-switch-active" : "",
                '">\u662F</span>\n\t\t\t\t\t<span data-visible="0" class="yb-player-setting-switch '
              )
              .concat(
                !this.getDanmuVisible()
                  ? "yb-player-setting-switch-active"
                  : "",
                '">\u5426</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u6EDA\u52A8\u663E\u793A</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<span data-scroll="0" class="yb-player-setting-switch '
              )
              .concat(
                !config.disableScroll ? "yb-player-setting-switch-active" : "",
                '">\u662F</span>\n\t\t\t\t\t<span data-scroll="1" class="yb-player-setting-switch '
              )
              .concat(
                config.disableScroll ? "yb-player-setting-switch-active" : "",
                '">\u5426</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u9876\u7AEF\u663E\u793A</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<span data-top="0" class="yb-player-setting-switch '
              )
              .concat(
                !config.disableTop ? "yb-player-setting-switch-active" : "",
                '">\u662F</span>\n\t\t\t\t\t<span data-top="1" class="yb-player-setting-switch '
              )
              .concat(
                config.disableTop ? "yb-player-setting-switch-active" : "",
                '">\u5426</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5E95\u7AEF\u663E\u793A</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<span data-bottom="0" class="yb-player-setting-switch '
              )
              .concat(
                !config.disableBottom ? "yb-player-setting-switch-active" : "",
                '">\u662F</span>\n\t\t\t\t\t<span data-bottom="1" class="yb-player-setting-switch '
              )
              .concat(
                config.disableBottom ? "yb-player-setting-switch-active" : "",
                '">\u5426</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u7981\u6B62\u91CD\u53E0</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<span data-overlap="1" class="yb-player-setting-switch '
              )
              .concat(
                config.overlap ? "yb-player-setting-switch-active" : "",
                '">\u662F</span>\n\t\t\t\t\t<span data-overlap="0" class="yb-player-setting-switch '
              )
              .concat(
                !config.overlap ? "yb-player-setting-switch-active" : "",
                '">\u5426</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5F39\u5E55\u8FC7\u6EE4</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<span data-filter="1" class="yb-player-setting-switch '
              )
              .concat(
                !config.disableFilter ? "yb-player-setting-switch-active" : "",
                '">\u5F00</span>\n\t\t\t\t\t<span data-filter="0" class="yb-player-setting-switch '
              )
              .concat(
                config.disableFilter ? "yb-player-setting-switch-active" : "",
                '">\u5173</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5F39\u5E55\u901F\u5EA6</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<div class="yb-player-setting-reduce yb-player-setting-danmu-speed-reduce"></div>\n\t\t\t\t\t<span class="yb-player-setting-danmu-speed">'
              )
              .concat(
                config.speed,
                '</span>\n\t\t\t\t\t<div class="yb-player-setting-add yb-player-setting-danmu-speed-add"></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u900F\u660E\u5EA6</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<div class="yb-player-setting-reduce yb-player-setting-danmu-opacity-reduce"></div>\n\t\t\t\t\t<span class="yb-player-setting-danmu-opacity-percent">'
              )
              .concat(
                ((config.opacity / 1) * 100).toFixed(0),
                '%</span>\n\t\t\t\t\t<div class="yb-player-setting-add yb-player-setting-danmu-opacity-add"></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5B57\u4F53\u5927\u5C0F</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<div class="yb-player-setting-reduce yb-player-setting-danmu-size-reduce"></div>\n\t\t\t\t\t<span class="yb-player-setting-danmu-size">'
              )
              .concat(
                config.fontScale,
                '\u500D</span>\n\t\t\t\t\t<div class="yb-player-setting-add yb-player-setting-danmu-size-add"></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u65F6\u95F4\u5DEE\uFF08\u79D2\uFF09</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<div class="yb-player-setting-reduce yb-player-setting-danmu-diffrence-reduce"></div>\n\t\t\t\t\t<span class="yb-player-setting-danmu-diffrence">'
              )
              .concat(
                config.timeDiffrence,
                '\u79D2</span>\n\t\t\t\t\t<div class="yb-player-setting-add yb-player-setting-danmu-diffrence-add"></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t'
              );
          var switchEls = div.getElementsByClassName(
            "yb-player-setting-switch"
          );
          var spReduceEl = div.getElementsByClassName(
            "yb-player-setting-danmu-speed-reduce"
          )[0];
          var spAddEl = div.getElementsByClassName(
            "yb-player-setting-danmu-speed-add"
          )[0];
          var spEl = div.getElementsByClassName(
            "yb-player-setting-danmu-speed"
          )[0];
          var opReduceEl = div.getElementsByClassName(
            "yb-player-setting-danmu-opacity-reduce"
          )[0];
          var opAddEl = div.getElementsByClassName(
            "yb-player-setting-danmu-opacity-add"
          )[0];
          var opPercentEl = div.getElementsByClassName(
            "yb-player-setting-danmu-opacity-percent"
          )[0];
          var sizeReduceEl = div.getElementsByClassName(
            "yb-player-setting-danmu-size-reduce"
          )[0];
          var sizeAddEl = div.getElementsByClassName(
            "yb-player-setting-danmu-size-add"
          )[0];
          var sizeEl = div.getElementsByClassName(
            "yb-player-setting-danmu-size"
          )[0];
          var diffrenceEl = div.getElementsByClassName(
            "yb-player-setting-danmu-diffrence"
          )[0];
          var diReduceEl = div.getElementsByClassName(
            "yb-player-setting-danmu-diffrence-reduce"
          )[0];
          var diAddEl = div.getElementsByClassName(
            "yb-player-setting-danmu-diffrence-add"
          )[0];
          var _loop2 = function _loop2(i) {
            // switchEls[i].onclick = () => {
            // 	switchEls[i].classList.add('yb-player-setting-switch-active')
            // 	if ( switchEls[i].getAttribute('data-visible') ) {
            // 		for ( let j = 0; j < switchEls.length; j++ ) if ( switchEls[j].getAttribute('data-visible') ) switchEls[j].classList.remove('yb-player-setting-switch-active')
            // 		config.show = switchEls[i].getAttribute('data-visible') == 1
            // 		if ( config.show ) this.showDanmu()
            // 		else this.hideDanmu()
            // 	}
            // 	if ( switchEls[i].getAttribute('data-scroll') ) {
            // 		for ( let j = 0; j < switchEls.length; j++ ) if ( switchEls[j].getAttribute('data-scroll') ) switchEls[j].classList.remove('yb-player-setting-switch-active')
            // 		config.disableScroll = switchEls[i].getAttribute('data-scroll') == 1
            // 		setConfig('disableScroll', config.disableScroll)
            // 	}
            // 	if ( switchEls[i].getAttribute('data-top') ) {
            // 		for ( let j = 0; j < switchEls.length; j++ ) if ( switchEls[j].getAttribute('data-top') ) switchEls[j].classList.remove('yb-player-setting-switch-active')
            // 		config.disableTop = switchEls[i].getAttribute('data-top') == 1
            // 		setConfig('disableTop', config.disableTop)
            // 	}
            // 	if ( switchEls[i].getAttribute('data-bottom') ) {
            // 		for ( let j = 0; j < switchEls.length; j++ ) if ( switchEls[j].getAttribute('data-bottom') ) switchEls[j].classList.remove('yb-player-setting-switch-active')
            // 		config.disableBottom = switchEls[i].getAttribute('data-bottom') == 1
            // 		setConfig('disableBottom', config.disableBottom)
            // 	}
            // 	if ( switchEls[i].getAttribute('data-overlap') ) {
            // 		for ( let j = 0; j < switchEls.length; j++ ) if ( switchEls[j].getAttribute('data-overlap') ) switchEls[j].classList.remove('yb-player-setting-switch-active')
            // 		config.overlap = switchEls[i].getAttribute('data-overlap') == 1
            // 		setConfig('overlap', config.overlap)
            // 	}
            // 	if ( switchEls[i].getAttribute('data-filter') ) {
            // 		for ( let j = 0; j < switchEls.length; j++ ) if ( switchEls[j].getAttribute('data-filter') ) switchEls[j].classList.remove('yb-player-setting-switch-active')
            // 		config.disableFilter = switchEls[i].getAttribute('data-filter') == 1
            // 		setConfig('disableFilter', config.disableFilter)
            // 	}
            // 	switchEls[i].classList.add('yb-player-setting-switch-active')
            // }
            YbPlayer.tap(switchEls[i], function () {
              switchEls[i].classList.add("yb-player-setting-switch-active");
              if (switchEls[i].getAttribute("data-visible")) {
                for (var j = 0; j < switchEls.length; j++)
                  if (switchEls[j].getAttribute("data-visible"))
                    switchEls[j].classList.remove(
                      "yb-player-setting-switch-active"
                    );
                config.show = switchEls[i].getAttribute("data-visible") == 1;
                if (config.show) _this14.showDanmu();
                else _this14.hideDanmu();
              }
              if (switchEls[i].getAttribute("data-scroll")) {
                for (var _j = 0; _j < switchEls.length; _j++)
                  if (switchEls[_j].getAttribute("data-scroll"))
                    switchEls[_j].classList.remove(
                      "yb-player-setting-switch-active"
                    );
                config.disableScroll =
                  switchEls[i].getAttribute("data-scroll") == 1;
                setConfig("disableScroll", config.disableScroll);
              }
              if (switchEls[i].getAttribute("data-top")) {
                for (var _j2 = 0; _j2 < switchEls.length; _j2++)
                  if (switchEls[_j2].getAttribute("data-top"))
                    switchEls[_j2].classList.remove(
                      "yb-player-setting-switch-active"
                    );
                config.disableTop = switchEls[i].getAttribute("data-top") == 1;
                setConfig("disableTop", config.disableTop);
              }
              if (switchEls[i].getAttribute("data-bottom")) {
                for (var _j3 = 0; _j3 < switchEls.length; _j3++)
                  if (switchEls[_j3].getAttribute("data-bottom"))
                    switchEls[_j3].classList.remove(
                      "yb-player-setting-switch-active"
                    );
                config.disableBottom =
                  switchEls[i].getAttribute("data-bottom") == 1;
                setConfig("disableBottom", config.disableBottom);
              }
              if (switchEls[i].getAttribute("data-overlap")) {
                for (var _j4 = 0; _j4 < switchEls.length; _j4++)
                  if (switchEls[_j4].getAttribute("data-overlap"))
                    switchEls[_j4].classList.remove(
                      "yb-player-setting-switch-active"
                    );
                config.overlap = switchEls[i].getAttribute("data-overlap") == 1;
                setConfig("overlap", config.overlap);
              }
              if (switchEls[i].getAttribute("data-filter")) {
                for (var _j5 = 0; _j5 < switchEls.length; _j5++)
                  if (switchEls[_j5].getAttribute("data-filter"))
                    switchEls[_j5].classList.remove(
                      "yb-player-setting-switch-active"
                    );
                config.disableFilter =
                  switchEls[i].getAttribute("data-filter") == 1;
                setConfig("disableFilter", config.disableFilter);
              }
              switchEls[i].classList.add("yb-player-setting-switch-active");
            });
          };
          for (var i = 0; i < switchEls.length; i++) {
            _loop2(i);
          }
          // spReduceEl.onclick = () => {
          // 	config.speed = config.speed - 1 > 1 ? config.speed - 1 : 1
          // 	spEl.innerHTML = config.speed
          // 	setConfig('speed', config.speed)
          // }
          YbPlayer.tap(spReduceEl, function () {
            config.speed = config.speed - 1 > 1 ? config.speed - 1 : 1;
            spEl.innerHTML = config.speed;
            setConfig("speed", config.speed);
          });
          // spAddEl.onclick = () => {
          // 	config.speed = config.speed + 1 < 10 ? config.speed + 1 : 10
          // 	spEl.innerHTML = config.speed
          // 	setConfig('speed', config.speed)
          // }
          YbPlayer.tap(spAddEl, function () {
            config.speed = config.speed + 1 < 10 ? config.speed + 1 : 10;
            spEl.innerHTML = config.speed;
            setConfig("speed", config.speed);
          });
          // opReduceEl.onclick = () => {
          // 	config.opacity = config.opacity - 0.05 > 0 ? config.opacity - 0.05 : 0
          // 	opPercentEl.innerHTML = (config.opacity / 1 * 100).toFixed(0) + '%'
          // 	setConfig('opacity', config.opacity)
          // }
          YbPlayer.tap(opReduceEl, function () {
            config.opacity =
              config.opacity - 0.05 > 0 ? config.opacity - 0.05 : 0;
            opPercentEl.innerHTML =
              ((config.opacity / 1) * 100).toFixed(0) + "%";
            setConfig("opacity", config.opacity);
          });
          // opAddEl.onclick = () => {
          // 	config.opacity = config.opacity + 0.05 < 1 ? config.opacity + 0.05 : 1
          // 	opPercentEl.innerHTML = (config.opacity / 1 * 100).toFixed(0) + '%'
          // 	setConfig('opacity', config.opacity)
          // }
          YbPlayer.tap(opAddEl, function () {
            config.opacity =
              config.opacity + 0.05 < 1 ? config.opacity + 0.05 : 1;
            opPercentEl.innerHTML =
              ((config.opacity / 1) * 100).toFixed(0) + "%";
            setConfig("opacity", config.opacity);
          });
          // sizeReduceEl.onclick = () => {
          // 	config.fontScale = config.fontScale - 0.1 > 0 ? config.fontScale - 0.1 : 0.1
          // 	config.fontScale = Number(config.fontScale.toFixed(1))
          // 	sizeEl.innerHTML = config.fontScale + '倍'
          // 	setConfig('fontScale', config.fontScale)
          // }
          YbPlayer.tap(sizeReduceEl, function () {
            config.fontScale =
              config.fontScale - 0.1 > 0 ? config.fontScale - 0.1 : 0.1;
            config.fontScale = Number(config.fontScale.toFixed(1));
            sizeEl.innerHTML = config.fontScale + "倍";
            setConfig("fontScale", config.fontScale);
          });
          // sizeAddEl.onclick = () => {
          // 	config.fontScale = config.fontScale + 0.1 < 3 ? config.fontScale + 0.1 : 3
          // 	config.fontScale = Number(config.fontScale.toFixed(1))
          // 	sizeEl.innerHTML = config.fontScale + '倍'
          // 	setConfig('fontScale', config.fontScale)
          // }
          YbPlayer.tap(sizeAddEl, function () {
            config.fontScale =
              config.fontScale + 0.1 < 3 ? config.fontScale + 0.1 : 3;
            config.fontScale = Number(config.fontScale.toFixed(1));
            sizeEl.innerHTML = config.fontScale + "倍";
            setConfig("fontScale", config.fontScale);
          });
          // diReduceEl.onclick = () => {
          // 	config.timeDiffrence = config.timeDiffrence - 1
          // 	diffrenceEl.innerHTML = config.timeDiffrence + '秒'
          // 	setConfig('timeDiffrence', config.timeDiffrence)
          // }
          YbPlayer.tap(diReduceEl, function () {
            config.timeDiffrence = config.timeDiffrence - 1;
            diffrenceEl.innerHTML = config.timeDiffrence + "秒";
            setConfig("timeDiffrence", config.timeDiffrence);
          });
          // diAddEl.onclick = () => {
          // 	config.timeDiffrence = config.timeDiffrence + 1
          // 	diffrenceEl.innerHTML = config.timeDiffrence + '秒'
          // 	setConfig('timeDiffrence', config.timeDiffrence)
          // }
          YbPlayer.tap(diAddEl, function () {
            config.timeDiffrence = config.timeDiffrence + 1;
            diffrenceEl.innerHTML = config.timeDiffrence + "秒";
            setConfig("timeDiffrence", config.timeDiffrence);
          });
          var _configTimer = null;
          var _this = this;
          function setConfig(key, value) {
            if (_configTimer) {
              window.clearTimeout(_configTimer);
              _configTimer = null;
            }
            _configTimer = window.setTimeout(function () {
              _this.custom.danmu = config;
              if (_this.cm) {
                _this.cm.setConfig(key, value);
                if (
                  [
                    "timeDiffrence",
                    "disableScroll",
                    "disableTop",
                    "disableBottom",
                    "fontScale",
                  ].includes(key)
                )
                  _this.cm.reset();
              }
              _this.emit("danmuconfigchange", config); //派发弹幕配置更改事件，以便开发者外部记录
            }, 500);
          }
          this.showPopup("弹幕设置", div);
        },
        //展示弹幕过滤设置弹窗
      },
      {
        key: "showDanmuFilter",
        value: function showDanmuFilter() {
          var _this15 = this;
          this.hideControls();
          var config = this.custom.danmu || {};
          var fontSize = config.fontSize;
          var div = document.createElement("DIV");
          var type = "string";
          div.innerHTML =
            '\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u8FC7\u6EE4\u5185\u5BB9</span>\n\t\t\t\t<div class="yb-player-setting-right" style="flex:1">\n\t\t\t\t\t<input class="yb-player-setting-input yb-player-danmu-filter-text" placeholder="\u8BF7\u8F93\u5165\u8FC7\u6EE4\u5185\u5BB9"></input>\n\t\t\t\t\t<button class="yb-player-setting-mini-btn yb-player-danmu-filter-add" style="margin-left:10px">\u6DFB\u52A0</button>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line" style="margin-bottom:10px;">\n\t\t\t\t<span class="yb-player-setting-label">\u8FC7\u6EE4\u7C7B\u578B</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<span data-type="string" class="yb-player-setting-switch yb-player-danmu-filter-type '
              .concat(
                type == "string" ? "yb-player-setting-switch-active" : "",
                '">\u6587\u672C</span>\n\t\t\t\t\t<span data-type="regex" class="yb-player-setting-switch yb-player-danmu-filter-type '
              )
              .concat(
                type == "regex" ? "yb-player-setting-switch-active" : "",
                '">\u6B63\u5219</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t'
              );
          var filter = this.cm ? this.cm.filter : null;
          var rules = filter ? filter.getRules() : [];
          rules.forEach(pushRuleEl);
          //绑定规则类型点击选择事件
          var typeEls = div.querySelectorAll(".yb-player-danmu-filter-type");
          typeEls.forEach(function (typeEl) {
            // typeEl.onclick = () => {
            // 	typeEls.forEach(el => el.classList.remove('yb-player-setting-switch-active'))
            // 	typeEl.classList.add('yb-player-setting-switch-active')
            // 	type = typeEl.getAttribute('data-type')
            // }
            YbPlayer.tap(typeEl, function () {
              typeEls.forEach(function (el) {
                return el.classList.remove("yb-player-setting-switch-active");
              });
              typeEl.classList.add("yb-player-setting-switch-active");
              type = typeEl.getAttribute("data-type");
            });
          });
          //绑定规则点击添加事件
          var addEl = div.querySelector(".yb-player-danmu-filter-add");
          YbPlayer.tap(addEl, function () {
            var textEl = div.querySelector(".yb-player-danmu-filter-text");
            if (!textEl.value) {
              _this15.showToast("请输入过滤内容");
              return;
            }
            if (filter) {
              //删除过滤规则
              var rule = {
                pattern: textEl.value,
                type: type,
              };
              if (!filter.add(rule)) {
                _this15.showToast("添加过滤规则内容重复");
                return;
              }
              //重置弹幕
              _this15.cm.reset();
              //绘制规则列表
              pushRuleEl(rule, filter.getRules().length - 1);
              //清空文本框
              textEl.value = "";
              _this15.showToast("成功添加规则");
              //抛出过滤规则增加事件
              _this15.emit("danmufilteradd", {
                index: filter.getRules().length - 1,
                detail: rule,
              });
            }
          });
          //绘制规则列表
          var _this = this;
          function pushRuleEl(rule, key) {
            var el = document.createElement("DIV");
            el.setAttribute("class", "yb-player-filter-item");
            el.innerHTML =
              '\n\t\t\t\t<span class="yb-player-filter-item-type" style="background-color:'
                .concat(
                  rule.type == "string"
                    ? "var(--color-primary)"
                    : "var(--color-warning)",
                  '">'
                )
                .concat(
                  rule.type == "string" ? "文本" : "正则",
                  '</span>\n\t\t\t\t<span class="yb-player-filter-item-content yb-player-ellipsis">'
                )
                .concat(
                  rule.pattern,
                  "</span>\n\t\t\t\t<button>\u5220\u9664</button>\n\t\t\t"
                );
            var btn = el.getElementsByTagName("button")[0];
            YbPlayer.tap(btn, function () {
              var filter = _this.cm ? _this.cm.filter : null;
              if (filter) {
                //删除过滤规则
                filter.remove(key);
                //重置弹幕
                _this.cm.reset();
                //抛出过滤规则删除事件
                _this.emit("danmufilterreduce", {
                  index: key,
                  detail: rule,
                });
                _this.showToast("成功删除规则");
              }
              //移除元素
              el.remove();
            });
            div.appendChild(el);
          }
          this.showPopup("弹幕过滤", div);
        },
        //展示弹幕发送弹窗
      },
      {
        key: "showDanmuSend",
        value: function showDanmuSend() {
          var _this16 = this;
          if (this.video) this.video.pause();
          this.hideControls();
          var config = this.custom.danmu || {};
          var fontSize = config.fontSize;
          var div = document.createElement("DIV");
          var mode = 1;
          var boxWidth = this.container.offsetWidth;
          div.setAttribute("style", "width:" + boxWidth * (7 / 10) + "px");
          div.innerHTML =
            '\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5F39\u5E55\u5185\u5BB9</span>\n\t\t\t\t<textarea class="yb-player-danmu-send-textarea yb-player-setting-input" placeholder="\u8BF7\u8F93\u5165\u5F39\u5E55\u5185\u5BB9"></textarea>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5F39\u5E55\u7C7B\u578B</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<span data-type="1" class="yb-player-setting-switch yb-player-danmu-send-type '
              .concat(
                mode == 1 ? "yb-player-setting-switch-active" : "",
                '">\u6EDA\u52A8</span>\n\t\t\t\t\t<span data-type="5" class="yb-player-setting-switch yb-player-danmu-send-type '
              )
              .concat(
                mode == 5 ? "yb-player-setting-switch-active" : "",
                '">\u9876\u7AEF</span>\n\t\t\t\t\t<span data-type="4" class="yb-player-setting-switch yb-player-danmu-send-type '
              )
              .concat(
                mode == 4 ? "yb-player-setting-switch-active" : "",
                '">\u5E95\u7AEF</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5F39\u5E55\u5927\u5C0F</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<div class="yb-player-setting-reduce yb-player-setting-danmu-size-reduce"></div>\n\t\t\t\t\t<span class="yb-player-setting-danmu-size">'
              )
              .concat(
                fontSize,
                '</span>\n\t\t\t\t\t<div class="yb-player-setting-add yb-player-setting-danmu-size-add"></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-setting-line">\n\t\t\t\t<span class="yb-player-setting-label">\u5F39\u5E55\u989C\u8272</span>\n\t\t\t\t<div class="yb-player-setting-right">\n\t\t\t\t\t<input class="yb-player-danmu-send-color" type="color" value="'
              )
              .concat(
                config.color,
                '">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="yb-player-danmu-send-btn">\u53D1\u9001</div>\n\t\t'
              );
          var textEl = div.getElementsByClassName(
            "yb-player-danmu-send-textarea"
          )[0];
          var typeEls = div.getElementsByClassName("yb-player-danmu-send-type");
          var colorEl = div.getElementsByClassName(
            "yb-player-danmu-send-color"
          )[0];
          var sizeEl = div.getElementsByClassName(
            "yb-player-setting-danmu-size"
          )[0];
          var reduceEl = div.getElementsByClassName(
            "yb-player-setting-danmu-size-reduce"
          )[0];
          var addEl = div.getElementsByClassName(
            "yb-player-setting-danmu-size-add"
          )[0];
          var btnEl = div.getElementsByClassName("yb-player-danmu-send-btn")[0];
          var _loop3 = function _loop3(i) {
            // typeEls[i].onclick = () => {
            // 	for ( let j = 0; j < typeEls.length; j++ ) typeEls[j].classList.remove('yb-player-setting-switch-active')
            // 	typeEls[i].classList.add('yb-player-setting-switch-active')
            // 	mode = typeEls[i].getAttribute('data-type')
            // }
            YbPlayer.tap(typeEls[i], function () {
              for (var j = 0; j < typeEls.length; j++)
                typeEls[j].classList.remove("yb-player-setting-switch-active");
              typeEls[i].classList.add("yb-player-setting-switch-active");
              mode = typeEls[i].getAttribute("data-type");
            });
          };
          for (var i = 0; i < typeEls.length; i++) {
            _loop3(i);
          }
          textEl.oninput = function () {
            textEl.style.height =
              textEl.scrollHeight > 100
                ? 100
                : textEl.scrollHeight < 35
                ? 35
                : textEl.scrollHeight;
          };
          // reduceEl.onclick = () => {
          // 	fontSize = fontSize - 1 > 14 ? fontSize - 1 : 14
          // 	sizeEl.innerHTML = fontSize
          // }
          YbPlayer.tap(reduceEl, function () {
            fontSize = fontSize - 1 > 14 ? fontSize - 1 : 14;
            sizeEl.innerHTML = fontSize;
          });
          // addEl.onclick = () => {
          // 	fontSize = fontSize + 1 < 30 ? fontSize + 1 : 30
          // 	sizeEl.innerHTML = fontSize
          // }
          YbPlayer.tap(addEl, function () {
            fontSize = fontSize + 1 < 30 ? fontSize + 1 : 30;
            sizeEl.innerHTML = fontSize;
          });
          // btnEl.onclick = () => {
          // 	if ( !textEl.value ) {
          // 		this.showToast('请输入弹幕内容')
          // 		return
          // 	}
          // 	this.sendDanmu({
          // 		mode,
          // 		text: textEl.value,
          // 		color: colorEl.value,
          // 		fontSize: fontSize
          // 	}, true)
          // 	this.hidePopup()
          // }
          YbPlayer.tap(btnEl, function () {
            if (!textEl.value) {
              _this16.showToast("请输入弹幕内容");
              return;
            }
            _this16.sendDanmu(
              {
                mode: mode,
                text: textEl.value,
                color: colorEl.value,
                fontSize: fontSize,
              },
              true
            );
            _this16.hidePopup();
          });
          this.showPopup("发送弹幕", div, "center");
        },

        //加载自定义内容
      },
      {
        key: "loadCustom",
        value: function loadCustom() {
          var _this17 = this;
          //加载自定义进度条栏
          var progressEl =
            this.container.getElementsByClassName("yb-player-progress")[0];
          if (progressEl) {
            var progress = this.custom.progress || {}; //获取进度条栏配置
            var lSlots = YbPlayer.deepClone(progress.leftSlots || []); //获取左边插槽
            var rSlots = YbPlayer.deepClone(progress.rightSlots || []); //获取右边插槽

            //是否展示播放下一个按钮
            if (!progress.disableNext && this.works && this.works.length > 0) {
              lSlots.unshift({
                innerHTML:
                  '<span class="yb-player-next yb-player-unfull">'.concat(
                    this.workIndex < this.works.length - 1
                      ? YbPlayer.nextIcon
                      : "",
                    "</span>"
                  ),
                click: function click() {
                  _this17.next();
                },
              });
            }
            if (!progress.disableToggle) {
              lSlots.unshift({
                innerHTML:
                  '<span class="yb-player-toggle yb-player-unfull">'.concat(
                    this.video.paused ? YbPlayer.playIcon : YbPlayer.pauseIcon,
                    "</span>"
                  ),
                click: function click() {
                  _this17.toggle();
                },
              });
            }
            //是否展示播放上一个按钮
            if (!progress.disablePrev && this.works && this.works.length > 0) {
              lSlots.unshift({
                innerHTML:
                  '<span class="yb-player-prev yb-player-unfull">'.concat(
                    this.workIndex > 0 ? YbPlayer.prevIcon : "",
                    "</span>"
                  ),
                click: function click() {
                  _this17.prev();
                },
              });
            }
            lSlots.push({
              innerHTML:
                '\n\t\t\t\t\t<div class="yb-player-progress-center">\n\t\t\t\t\t\t<span class="yb-player-time">'
                  .concat(this.isLive ? "直播中 · " : "")
                  .concat(
                    typeof this.video.currentTime == "number"
                      ? YbPlayer.timeFormat(this.video.currentTime)
                      : "开始",
                    "</span>\n\t\t\t\t\t\t"
                  )
                  .concat(
                    !this.isLive
                      ? '\n\t\t\t\t\t\t\t<div class="yb-player-range-box">\n\t\t\t\t\t\t\t\t<div class="yb-player-range-track"></div>\n\t\t\t\t\t\t\t\t<div class="yb-player-range-preload"></div>\n\t\t\t\t\t\t\t\t<div class="yb-player-range-focus"></div>\n\t\t\t\t\t\t\t\t'
                          .concat(
                            !progress.disableRange
                              ? '<div class="yb-player-range-thumb"></div>'
                              : "",
                            '\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<span class="yb-player-duration">'
                          )
                          .concat(
                            this.getDuration()
                              ? YbPlayer.timeFormat(this.getDuration())
                              : "结束",
                            "</span>\n\t\t\t\t\t\t"
                          )
                      : "",
                    "\n\t\t\t\t\t</div>\n\t\t\t\t"
                  ),
              click: function click() {},
            });
            if (!progress.disableFullscreen) {
              rSlots.push({
                innerHTML: '<span class="yb-player-fullscreen">'.concat(
                  this.getFullscreen()
                    ? YbPlayer.exitfullIcon
                    : YbPlayer.openfullIcon,
                  "</span>"
                ),
                click: function click() {
                  if (_this17.getFullscreen()) _this17.exitFullscreen();
                  else _this17.openFullscreen();
                },
              });
            }
            var arr = lSlots.concat(rSlots);
            arr.forEach(function (item, key) {
              progressEl.innerHTML += item.innerHTML;
            });
            var children = progressEl.children;
            for (var i = 0; i < children.length; i++) {
              // children[i].onclick = arr[i].click
              YbPlayer.tap(children[i], arr[i].click);
              //如果标记了非全屏元素，则在全屏时需要隐藏
              if (
                children[i].classList.contains("yb-player-unfull") &&
                this.getFullscreen()
              ) {
                children[i].classList.add("yb-player-hide");
              }
            }
            //是否关闭进度条拖动
            if (!progress.disableRange) this.loadRange();
          }

          //加载控制栏自定义配置
          var controlsBottomEl = this.container.getElementsByClassName(
            "yb-player-controls-bottom"
          )[0];
          if (controlsBottomEl) {
            var controls = this.custom.controls || {}; //获取控制栏配置
            var lSlots = YbPlayer.deepClone(controls.leftSlots || []); //获取左边插槽
            var rSlots = YbPlayer.deepClone(controls.rightSlots || []); //获取右边吧插槽

            //是否展示播放下一个按钮
            if (!controls.disableNext && this.works && this.works.length > 0) {
              lSlots.unshift({
                innerHTML: '<span class="yb-player-next">'.concat(
                  this.workIndex < this.works.length - 1
                    ? YbPlayer.nextIcon
                    : "",
                  "</span>"
                ),
                click: function click() {
                  _this17.next();
                },
              });
            }
            if (!controls.disableToggle) {
              lSlots.unshift({
                innerHTML: '<span class="yb-player-toggle">'.concat(
                  this.video.paused ? YbPlayer.playIcon : YbPlayer.pauseIcon,
                  "</span>"
                ),
                click: function click() {
                  _this17.toggle();
                },
              });
            }
            //是否展示播放上一个按钮
            if (!controls.disablePrev && this.works && this.works.length > 0) {
              lSlots.unshift({
                innerHTML: '<span class="yb-player-prev">'.concat(
                  this.workIndex > 0 ? YbPlayer.prevIcon : "",
                  "</span>"
                ),
                click: function click() {
                  _this17.prev();
                },
              });
            }
            if (this.cm && !controls.disableDanmuSend) {
              lSlots.push({
                innerHTML:
                  '<div class="yb-player-danmu-send yb-player-ellipsis">\u53D1\u6761\u5F39\u5E55\u5427</div>',
                click: function click() {
                  if (_this17.getPopup()) _this17.hidePopup();
                  else _this17.showDanmuSend();
                },
              });
            } else {
              lSlots.push({
                innerHTML: '<div style="flex:1"></div>',
                click: function click(e) {
                  e.preventDefault();
                },
              });
            }
            //显示手势开启\关闭按钮
            if (this.pano && !controls.disablePanoControlsType) {
              var controlsType = this.pano.getControlsType();
              rSlots.push({
                innerHTML:
                  '<span class="yb-player-pano-controls yb-player-icon '
                    .concat(
                      controlsType == "close" ? " yb-player-icon-close" : "",
                      '">'
                    )
                    .concat(
                      controlsType == "orientation"
                        ? "陀螺仪"
                        : controlsType == "orbit"
                        ? "滑动"
                        : "传感器",
                      "</span>"
                    ),
                click: function click() {
                  _this17.showPanoControls();
                },
              });
            }
            //显示画质切换按钮
            if (
              this.quality &&
              this.quality.length > 0 &&
              !controls.disableQuality
            ) {
              var index = this.quality.findIndex(function (q) {
                return q.src == _this17.src;
              });
              var title = index > -1 ? this.quality[index].title : "";
              var quality = this.custom.quality || {};
              var qualityName = quality.name || "画质";
              rSlots.push({
                innerHTML:
                  '<span class="yb-player-quality yb-player-icon">'.concat(
                    title || qualityName,
                    "</span>"
                  ),
                click: function click() {
                  if (_this17.getToolbar()) _this17.hideToolbar();
                  else _this17.showQuality();
                },
              });
            }
            //显示字幕切换按钮
            if (
              !controls.disableSubtitle &&
              this.subtitles &&
              this.subtitles.length > 0
            ) {
              rSlots.push({
                innerHTML:
                  '<span class="yb-player-subtitle yb-player-icon'.concat(
                    this.subtitleIndex == -1 ? " yb-player-icon-close" : "",
                    '">\u5B57\u5E55</span>'
                  ),
                click: function click() {
                  if (_this17.getToolbar()) _this17.hideToolbar();
                  else _this17.showSubtitle();
                },
              });
            }
            //显示弹幕开启\关闭按钮
            if (this.cm && !controls.disableDanmuVisible) {
              rSlots.push({
                innerHTML:
                  '<span class="yb-player-danmu-visible yb-player-icon '.concat(
                    this.getDanmuVisible() ? "" : " yb-player-icon-close",
                    '">\u5F39\u5E55</span>'
                  ),
                click: function click() {
                  if (_this17.getDanmuVisible()) _this17.hideDanmu();
                  else _this17.showDanmu();
                },
              });
            }
            //显示静音按钮
            if (!controls.disableMuted) {
              rSlots.push({
                innerHTML: '<span class="yb-player-muted yb-player-icon '
                  .concat(this.video.muted ? " yb-player-icon-close" : "", '">')
                  .concat(YbPlayer.voiceIcon, "</span>"),
                click: function click() {
                  _this17.video.muted = !_this17.video.muted;
                },
              });
            }
            var arr = lSlots.concat(rSlots);
            if (arr.length == 0) controlsBottomEl.style.display = "none";
            arr.forEach(function (item, key) {
              controlsBottomEl.innerHTML += item.innerHTML;
            });
            var children = controlsBottomEl.children;
            for (var _i = 0; _i < children.length; _i++) {
              // children[i].onclick = arr[i].click
              YbPlayer.tap(children[_i], arr[_i].click);
            }
          }

          //加载头部自定义内容
          var heightEl =
            this.container.getElementsByClassName("yb-player-header")[0];
          if (heightEl) {
            var header = this.custom.header || {}; //获取头部自定义配置
            var lSlots = YbPlayer.deepClone(header.leftSlots || []); //获取左边插槽
            var rSlots = YbPlayer.deepClone(header.rightSlots || []); //获取右边吧插槽
            //是否开启返回按钮
            if (!header.disableBack) {
              lSlots.push({
                innerHTML: '<span class="yb-player-back">'.concat(
                  YbPlayer.backIcon,
                  "</span>"
                ),
                click: function click() {
                  if (_this17.getFullscreen()) _this17.exitFullscreen();
                  else _this17.emit("back");
                },
              });
            }
            //是否开启顶部标题
            if (!header.disableTitle) {
              lSlots.push({
                innerHTML:
                  '<span class="yb-player-title yb-player-ellipsis">'.concat(
                    this.title,
                    "</span>"
                  ),
                click: function click(e) {
                  e.preventDefault();
                },
              });
            }
            //是否开启分P选择
            if (!header.disableWorks && this.works && this.works.length > 0) {
              var work = this.custom.work || {};
              var worksName = work.name || "分P";
              rSlots.push({
                innerHTML:
                  '<span class="yb-player-header-works yb-player-icon yb-player-full yb-player-hide">'.concat(
                    worksName,
                    "</span>"
                  ),
                click: function click() {
                  if (_this17.getPopup()) _this17.hidePopup();
                  else _this17.showWorks();
                },
              });
            }
            //是否开启倍速选择
            if (!header.disableRate) {
              rSlots.push({
                innerHTML:
                  '<span class="yb-player-header-rate yb-player-icon">\u500D\u901Fx'.concat(
                    this.video.playbackRate,
                    "</span>"
                  ),
                click: function click() {
                  if (_this17.getToolbar()) _this17.hideToolbar();
                  else _this17.showPlaybackRate();
                },
              });
            }
            //是否开启3D选择
            if (header.enableThree) {
              rSlots.push({
                innerHTML:
                  '<span class="yb-player-header-three yb-player-icon">'.concat(
                    this.three == "none" ? "关闭3D" : this.three,
                    "</span>"
                  ),
                click: function click() {
                  if (_this17.getToolbar()) _this17.hideToolbar();
                  else _this17.showThree();
                },
              });
            }
            //是否展示更多按钮
            if (!header.disableMore) {
              rSlots.push({
                innerHTML: '<span class="yb-player-more">'.concat(
                  YbPlayer.moreIcon,
                  "</span>"
                ),
                click: function click() {
                  if (_this17.getToolbar()) _this17.hideToolbar();
                  else _this17.showMoreSetting();
                },
              });
            }
            var arr = lSlots.concat(rSlots);
            arr.forEach(function (slot, key) {
              heightEl.innerHTML += slot.innerHTML;
            });
            var children = heightEl.children;
            for (var _i2 = 0; _i2 < children.length; _i2++) {
              // children[i].onclick = arr[i].click
              YbPlayer.tap(children[_i2], arr[_i2].click);
            }
          }

          //加载其它自定义内容
          var slots = YbPlayer.deepClone(this.custom.slots || []);
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          if (slots.length > 0 && wrapperEl) {
            var slotEl = document.createElement("DIV");
            slotEl.setAttribute("class", "yb-player-slot");
            slots.forEach(function (slot, key) {
              slotEl.innerHTML += slot.innerHTML;
            });
            var children = slotEl.children;
            for (var _i3 = 0; _i3 < children.length; _i3++) {
              // children[i].onclick = slots[i].click
              YbPlayer.tap(children[_i3], slots[_i3].click);
              if (slots[_i3].followControls) {
                children[_i3].setAttribute("data-controls", 1);
                if (!this.getControls())
                  children[_i3].classList.add("yb-player-hide");
              }
            }
            wrapperEl.appendChild(slotEl);
          }
          //重新设置一次全屏状态
          this._setFullscreenStatus();
        },
        //卸载自定义
      },
      {
        key: "unloadCustom",
        value: function unloadCustom() {
          //卸载进度条栏自定义内容
          var progressEl =
            this.container.getElementsByClassName("yb-player-progress")[0];
          this.unloadRange();
          var children = progressEl.children;
          // for ( let i = 0; i < children.length; i++ ) children[i].onclick = null
          progressEl.innerHTML = "";

          //卸底部控制栏自定义内容
          var controlsBottomEl = this.container.getElementsByClassName(
            "yb-player-controls-bottom"
          )[0];
          var children = controlsBottomEl ? controlsBottomEl.childen : [];
          // for ( let i = 0; i < children.length; i++ ) children[i].onclick = null
          controlsBottomEl.innerHTML = "";

          //卸载头部自定义内容
          var heightEl =
            this.container.getElementsByClassName("yb-player-header")[0];
          var children = heightEl ? heightEl.childen : [];
          // for ( let i = 0; i < children.length; i++ ) children[i].onclick = null
          heightEl.innerHTML = "";

          //卸载其它自定义内容
          var slotEl =
            this.container.getElementsByClassName("yb-player-slot")[0];
          var children = slotEl ? slotEl.children : [];
          // for ( let i = 0; i < children.length; i++ ) children[i].onclick = null
          if (slotEl) slotEl.remove();
          slotEl = null;
        },

        //注册手势事件
      },
      {
        key: "loadGestureEvent",
        value: function loadGestureEvent() {
          this.gesture = new YbGesture(this, this.custom.gesture || {});
          this.gesture.load();
          if (this.pano) {
            //如果开启了3D模式
            var controlsType = this.pano.getControlsType();
            //判断控制器类型来控制是否禁用手势事件
            if (controlsType == "gyro") this.enableGesture();
            else this.disableGesture();
          }
        },
        //注销手势事件
      },
      {
        key: "unloadGestureEvent",
        value: function unloadGestureEvent() {
          this.gesture.unload();
          this.gesture = null;
        },
        //禁用手势事件
      },
      {
        key: "disableGesture",
        value: function disableGesture() {
          if (this.gesture) this.gesture.disable();
        },
        //启用手势事件
      },
      {
        key: "enableGesture",
        value: function enableGesture() {
          if (this.gesture) this.gesture.enable();
        },

        //加载进度条
      },
      {
        key: "loadRange",
        value: function loadRange() {
          var _this18 = this;
          var progress = this.custom.progress || {};
          var rangeEl = this.container.getElementsByClassName(
            "yb-player-range-box"
          )[0];
          var focusEl = this.container.getElementsByClassName(
            "yb-player-range-focus"
          )[0];
          var thumbEl = this.container.getElementsByClassName(
            "yb-player-range-thumb"
          )[0];
          var timeEl =
            this.container.getElementsByClassName("yb-player-time")[0];
          var _touchstartX = null;
          var _touchstartY = null;
          var _rate = null;
          var _mousedown = null;
          if (rangeEl) {
            var touchstart = function touchstart(e) {
              if (!_this18.video || !_this18.getDuration()) return; //视频未加载前，进度条禁止拖动
              _this18.showControls();
              _this18._isSeeking = true;
              var touch = e.touches[0];
              _touchstartX = touch.pageX;
              _touchstartY = touch.pageY;
              var touchstartX = _touchstartX; //根据旋转方向获取
              touchstartX = touchstartX - rangeEl.offsetLeft;
              var rangeWidth = rangeEl.offsetWidth;
              touchstartX =
                touchstartX < 0
                  ? 0
                  : touchstartX > rangeWidth
                  ? rangeWidth
                  : touchstartX;
              setProgress(touchstartX);
            };
            var touchmove = function touchmove(e) {
              if (_touchstartX >= 0 || _touchstartY >= 0) {
                _this18.showControls();
                var touch = e.touches[0];
                var touchmoveX = touch.pageX;
                touchmoveX = touchmoveX - rangeEl.offsetLeft;
                var rangeWidth = rangeEl.offsetWidth;
                touchmoveX =
                  touchmoveX < 0
                    ? 0
                    : touchmoveX > rangeWidth
                    ? rangeWidth
                    : touchmoveX;
                setProgress(touchmoveX);
              }
            };
            var touchend = function touchend(e) {
              if (_rate >= 0) _this18.seek(_this18.getDuration() * _rate);
              _touchstartX = null;
              _touchstartY = null;
              _rate = null;
              _this18._isSeeking = false;
            };
            var setProgress = function setProgress(touchX) {
              var rangeWidth = rangeEl.offsetWidth;
              _rate = touchX / rangeWidth;
              focusEl.style.width = _rate * 100 + "%";
              thumbEl.style.transform = "translate(calc(-50% + ".concat(
                _rate * rangeWidth,
                "px), -50%)"
              );
              timeEl.innerHTML = YbPlayer.timeFormat(
                _this18.getDuration() * _rate
              );
            };
            rangeEl.oncontextmenu = function (event) {
              event.preventDefault();
            };
            rangeEl.ontouchstart = touchstart;
            rangeEl.ontouchmove = touchmove;
            rangeEl.ontouchend = touchend;
            rangeEl.ontouchcancel = touchend;
            rangeEl.onmousedown = function (e) {
              if (
                "ontouchstart" in window ||
                (window.DocumentTouch && document instanceof DocumentTouch)
              )
                return; //设备支持触屏则不触发mousedown
              _mousedown = true;
              touchstart({
                touches: [
                  {
                    pageX: e.pageX,
                    pageY: e.pageY,
                  },
                ],
              });
            };
            rangeEl.onmousemove = function (e) {
              if (!_mousedown) return;
              touchmove({
                touches: [
                  {
                    pageX: e.pageX,
                    pageY: e.pageY,
                  },
                ],
              });
            };
            rangeEl.onmouseup = function (e) {
              if (!_mousedown) return;
              _mousedown = false;
              touchend({
                touches: [
                  {
                    pageX: e.pageX,
                    pageY: e.pageY,
                  },
                ],
              });
            };
          }
        },

        //卸载进度条
      },
      {
        key: "unloadRange",
        value: function unloadRange() {
          var rangeEl = this.container.getElementsByClassName(
            "yb-player-range-box"
          )[0];
          if (rangeEl) {
            rangeEl.oncontextmenu = null;
            rangeEl.ontouchstart = null;
            rangeEl.ontouchmove = null;
            rangeEl.ontouchend = null;
            rangeEl.ontouchcancel = null;
            rangeEl.onmousedown = null;
            rangeEl.onmousemove = null;
            rangeEl.onmouseup = null;
          }
        },

        //注册事件监听
      },
      {
        key: "on",
        value: function on(event, callback) {
          this._event[event] = callback;
        },
        //注销事件监听
      },
      {
        key: "off",
        value: function off(event) {
          var _this19 = this;
          this._event[event] = null;
          var obj = {};
          Object.keys(this._event).forEach(function (key) {
            if (_this19._event[key]) obj[key] = _this19._event[key];
          });
          this._event = obj;
        },
        /**
         * 主动触发事件
         * @param {String} event 事件名称
         * @param {Any} data 传递参数
         */
      },
      {
        key: "emit",
        value: function emit(event, data) {
          var handle = this._event[event];
          handle && handle(data);
          var arg = {};
          arg[event] = ["undefined", "null"].includes(_typeof(data))
            ? true
            : data;
          this._event.onmessage &&
            this._event.onmessage(YbPlayer.deepClone(arg));
        },
        //动态修改video配置
      },
      {
        key: "setVideo",
        value: function setVideo(key, value) {
          if (this.video) this.video[key] = value;
        },
        //动态主要配置
      },
      {
        key: "setConfig",
        value: function setConfig(key, value) {
          var _this20 = this;
          Object.keys(this).forEach(function (k) {
            if (k == key) _this20[k] = value;
          });
        },
        //动态手势事件配置
      },
      {
        key: "setGesture",
        value: function setGesture(key, value) {
          this.custom.gesture[key] = value;
          this.gesture.setConfig(key, value);
        },
        //动态字幕配置
      },
      {
        key: "setSubtitle",
        value: function setSubtitle(key, value) {
          this.custom.subtitle[key] = value;
          this.subtitle.setConfig(key, value);
        },
        //弹幕动态配置，动态改变需要重新装载弹幕
      },
      {
        key: "setDanmu",
        value: function setDanmu(key, value) {
          this.custom.danmu[key] = value;
          this.cm.setConfig(key, value);
        },
        //自定义动态配置，动态改变该配置需要unloadCustom再loadCustom
      },
      {
        key: "setCustom",
        value: function setCustom(key, value) {
          this.custom[key] = value;
        },
        /**
         * 设置元素内容
         * @param selector 选择器
         * @param content 修改的内容
         */
      },
      {
        key: "setInnerHTML",
        value: function setInnerHTML(selector, content) {
          var dom = this.container.getElementsByClassName(selector);
          if (dom && dom.length > 0) {
            if (dom.length > 1)
              for (var i = 0; i < dom.length; i++) dom[i].innerHTML = content;
            else dom[0].innerHTML = content;
          }
        },
        //获取是否加载错误
      },
      {
        key: "getError",
        value: function getError() {
          return this.container.getElementsByClassName("yb-player-error")[0];
        },
        //获取是否在加载中
      },
      {
        key: "getLoading",
        value: function getLoading() {
          return this.container.getElementsByClassName("yb-player-loading")[0];
        },
        //获取是否全屏
      },
      {
        key: "getFullscreen",
        value: function getFullscreen() {
          return (
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            document.webkitFullscreenElement ||
            this.container.classList.contains("yb-player-openfull")
          );
        },
        //获取全屏类型
      },
      {
        key: "getFullscreenType",
        value: function getFullscreenType() {
          return document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            document.webkitFullscreenElement
            ? "api"
            : "css";
        },
        //获取控制栏是否显示中
      },
      {
        key: "getControls",
        value: function getControls() {
          var controlsEl =
            this.container.getElementsByClassName("yb-player-controls")[0];
          var locksEl =
            this.container.getElementsByClassName("yb-player-locks")[0];
          return (
            controlsEl.classList.contains("yb-player-controls-show") ||
            !locksEl.classList.contains("yb-player-hide")
          );
        },
        //获取弹幕是否显示
      },
      {
        key: "getDanmuVisible",
        value: function getDanmuVisible() {
          return this.cm ? this.cm.getVisible() : false;
        },
        //是否有工具栏正在显示
      },
      {
        key: "getToolbar",
        value: function getToolbar() {
          return this.container.getElementsByClassName("yb-player-toolbar")[0];
        },
        //是否有弹窗正在显示
      },
      {
        key: "getPopup",
        value: function getPopup() {
          return this.container.getElementsByClassName("yb-player-popup")[0];
        },
        //获取播放时长
      },
      {
        key: "getDuration",
        value: function getDuration() {
          return this.video
            ? this.duration
              ? Math.min(this.duration, this.video.duration)
              : this.video.duration
            : 0;
        },
        //获取video元素对象
      },
      {
        key: "getVideoElement",
        value: function getVideoElement() {
          return this.video && this.video.canvas
            ? this.video.canvas
            : this.video;
        },

        //开启锁屏
      },
      {
        key: "disable",
        value: function disable() {
          this.disabled = true;
          this.hideControls();
          this.showControls();
          var llockEL = this.container.getElementsByClassName(
            "yb-player-lock-left"
          )[0];
          var rlockEL = this.container.getElementsByClassName(
            "yb-player-lock-right"
          )[0];
          llockEL.innerHTML = YbPlayer.lockIcon;
          rlockEL.innerHTML = YbPlayer.lockIcon;
        },
        //解开锁屏
      },
      {
        key: "enable",
        value: function enable() {
          this.disabled = false;
          this.showControls();
          var llockEL = this.container.getElementsByClassName(
            "yb-player-lock-left"
          )[0];
          var rlockEL = this.container.getElementsByClassName(
            "yb-player-lock-right"
          )[0];
          llockEL.innerHTML = YbPlayer.unlockIcon;
          rlockEL.innerHTML = YbPlayer.unlockIcon;
        },

        /**
         * 截图
         * @param {String} type 截图类型 video-使用video元素截图 three-将3D元素截图
         * @param {String} show 展示截图
         */
      },
      {
        key: "capture",
        value: function capture() {
          var _this21 = this;
          var type =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : "video";
          var show =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : true;
          var element =
            type == "video"
              ? this.getVideoElement()
              : this.container.getElementsByClassName("yb-player-pano")[0]
                  .children[0];
          if (!element) {
            this.showToast("视频还未加载");
            return;
          }
          this.hideControls();
          this.video.pause();
          var canvas = document.createElement("canvas");
          canvas.width =
            type == "video" ? this.video.videoWidth : element.offsetWidth;
          canvas.height =
            type == "video" ? this.video.videoHeight : element.offsetHeight;
          canvas
            .getContext("2d")
            .drawImage(element, 0, 0, canvas.width, canvas.height);
          try {
            canvas.toBlob(function (blob) {
              var base64 = canvas.toDataURL("image/jpg");
              var captureData = {
                blob: blob,
                base64: base64,
              };
              var url = URL.createObjectURL(blob);
              canvas = null;
              _this21.emit("capturefinish", captureData);
              if (show) {
                var wrapperEL =
                  _this21.container.getElementsByClassName(
                    "yb-player-wrapper"
                  )[0];
                var div = document.createElement("DIV");
                div.setAttribute("class", "yb-player-capture-popup");
                div.innerHTML =
                  '\n\t\t\t\t\t\t<img class="yb-player-capture-image" src="'.concat(
                    url,
                    '" object="cover">\n\t\t\t\t\t\t<div class="yb-player-capture-btns">\n\t\t\t\t\t\t\t<div class="yb-player-capture-btn yb-player-capture-close">\u5173\u95ED</div>\n\t\t\t\t\t\t\t<div class="yb-player-capture-btn yb-player-capture-save">\u4FDD\u5B58</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t'
                  );
                var closeEl = div.getElementsByClassName(
                  "yb-player-capture-close"
                )[0];
                var saveEl = div.getElementsByClassName(
                  "yb-player-capture-save"
                )[0];
                YbPlayer.tap(closeEl, function () {
                  div.remove();
                  div = null;
                  URL.revokeObjectURL(url);
                });
                // closeEl.onclick = () => {
                // 	div.remove()
                // 	div = null
                // 	closeEl.onclick = null
                // 	URL.revokeObjectURL(url);
                // }
                YbPlayer.tap(saveEl, function () {
                  div.remove();
                  div = null;
                  URL.revokeObjectURL(url);
                  _this21.saveCapture(captureData);
                });
                // saveEl.onclick = () => {
                // 	div.remove()
                // 	div = null
                // 	saveEl.onclick = null
                // 	URL.revokeObjectURL(url);
                // 	this.saveCapture(captureData)
                // }
                wrapperEL.appendChild(div);
              }
            }, "image/jpg");
          } catch (e) {
            this.showToast("截图失败，请检查视频链接是否跨域");
            //截图失败，多半是跨域导致的
            this.emit("captureerror", {
              type: type,
              errMsg: e.toString(),
            });
          }
        },
      },
      {
        key: "saveCapture",
        value: (function () {
          var _saveCapture = _asyncToGenerator(
            /*#__PURE__*/ _regenerator().m(function _callee3(data) {
              var fileName, a, url, filePath, code, _t;
              return _regenerator().w(
                function (_context3) {
                  while (1)
                    switch ((_context3.p = _context3.n)) {
                      case 0:
                        fileName =
                          new Date().getTime().toString() +
                          Math.round(Math.random() * 10000) +
                          ".jpg";
                        if (navigator.userAgent.includes("uni-app")) {
                          _context3.n = 1;
                          break;
                        }
                        //非uni-app环境，使用a标签下载
                        a = document.createElement("A");
                        url = URL.createObjectURL(data.blob);
                        a.href = url;
                        a.setAttribute("download", fileName);
                        // 兼容：某些浏览器不支持HTML5的download属性
                        if (typeof a.download === "undefined") {
                          a.setAttribute("target", "_blank");
                        }
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                        _context3.n = 6;
                        break;
                      case 1:
                        //如果plus属性不为空，说明在h5+环境下，直接调用plusAPI.实现图片保存到临时路径
                        (filePath = ""), (code = 404);
                        if (!(_typeof(window.plus) == "object")) {
                          _context3.n = 5;
                          break;
                        }
                        _context3.p = 2;
                        _context3.n = 3;
                        return this.saveBase64ImageToAlbum(
                          data.base64,
                          fileName
                        );
                      case 3:
                        filePath = _context3.v;
                        code = 200;
                        this.showToast("保存到相册成功");
                        _context3.n = 5;
                        break;
                      case 4:
                        _context3.p = 4;
                        _t = _context3.v;
                        code = 401;
                        this.showToast("保存到相册失败");
                      case 5:
                        this.emit("capturesaved", {
                          code: code,
                          fileName: fileName,
                          filePath: filePath,
                          data: data,
                        });
                      case 6:
                        return _context3.a(2);
                    }
                },
                _callee3,
                this,
                [[2, 4]]
              );
            })
          );
          function saveCapture(_x) {
            return _saveCapture.apply(this, arguments);
          }
          return saveCapture;
        })(),
        /**
         * 保存base64图片到相册（仅限5+环境）
         * @param {String} base64 图片
         * @param {String} fileName 图片名称
         */
      },
      {
        key: "saveBase64ImageToAlbum",
        value: function saveBase64ImageToAlbum(base64, fileName) {
          return new Promise(function (resolve, reject) {
            var basePath = "_doc";
            var dirPath = "uniapp_temp";
            var tempFilePath = basePath + "/" + dirPath + "/" + fileName;
            var bitmap = new plus.nativeObj.Bitmap(fileName);
            bitmap.loadBase64Data(
              base64,
              function () {
                bitmap.save(
                  tempFilePath,
                  {},
                  function () {
                    bitmap.clear();
                    plus.gallery.save(
                      tempFilePath,
                      function (e) {
                        resolve(e.path);
                      },
                      function (error) {
                        reject(error);
                      }
                    );
                  },
                  function (error) {
                    bitmap.clear();
                    reject(error);
                  }
                );
              },
              function (error) {
                bitmap.clear();
                reject(error);
              }
            );
          });
        },

        //展示loading
      },
      {
        key: "showLoading",
        value: function showLoading() {
          this.hideCenter();
          if (this.custom.disableLoading) return; //是否关闭了loading
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          var div = document.createElement("DIV");
          div.setAttribute("class", "yb-player-center yb-player-loading");
          div.innerHTML = YbPlayer.loadIcon;
          wrapperEl.appendChild(div);
        },
        //关闭loading
      },
      {
        key: "hideLoading",
        value: function hideLoading() {
          var div =
            this.container.getElementsByClassName("yb-player-loading")[0];
          if (div) div.remove();
          if (this.video.paused) this.showCenterPlay();
          else this.hideCenter();
        },
        //展示中间播放按钮
      },
      {
        key: "showCenterPlay",
        value: function showCenterPlay() {
          var _this22 = this;
          this.hideCenter();
          if (this.custom.disableCenterPlay) return; //是否关闭了中间按钮
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          var div = document.createElement("DIV");
          div.setAttribute("class", "yb-player-center yb-player-center-play");
          div.innerHTML = YbPlayer.playcenterIcon;
          YbPlayer.tap(div, function () {
            _this22.video.play();
            div.onclick = null;
            div.remove();
            div = null;
          });
          // div.onclick = () => {
          // 	this.video.play()
          // 	div.onclick = null
          // 	div.remove()
          // 	div = null
          // }
          wrapperEl.appendChild(div);
        },
        //展示错误提示
      },
      {
        key: "showError",
        value: function showError(errorMsg) {
          var _this23 = this;
          this.initialTime = this.currentTime; //记录当前播放时间，重启视频后定位回来
          this.hideCenter();
          if (this.custom.disableError) return; //是否关闭错误提示
          var wrapperEl =
            this.container.getElementsByClassName("yb-player-wrapper")[0];
          var div = document.createElement("DIV");
          div.setAttribute("class", "yb-player-center yb-player-error");
          div.innerHTML = "\n\t\t\t"
            .concat(YbPlayer.errorIcon, "\n\t\t\t<span>")
            .concat(errorMsg || "加载失败", "</span>\n\t\t");
          // div.onclick = () => {
          // 	this.unloadVideo()
          // 	this.loadVideo('error')
          // 	div.onclick = null
          // 	div.remove()
          // 	div = null
          // }
          YbPlayer.tap(div, function () {
            _this23.unloadVideo();
            _this23.loadVideo("error");
            div.onclick = null;
            div.remove();
            div = null;
          });
          wrapperEl.appendChild(div);
        },
        //关闭视频中间显示的任何内容
      },
      {
        key: "hideCenter",
        value: function hideCenter() {
          var divs = this.container.querySelectorAll(".yb-player-center");
          divs.forEach(function (div) {
            return div.remove();
          });
        },
        //展示消息提示
      },
      {
        key: "showToast",
        value: function showToast(data) {
          var _this24 = this;
          this._clearToastTimer();
          var options =
            typeof data == "string"
              ? {
                  message: data,
                  duration: 2000,
                }
              : data;
          var toastEl =
            this.container.getElementsByClassName("yb-player-toast")[0];
          if (toastEl) {
            toastEl.innerHTML =
              '<span class="yb-player-toast-message">' +
              options.message +
              "</span>";
            toastEl.classList.remove("yb-player-toast-hide");
            toastEl.classList.add("yb-player-toast-show");
            this._toastTimer = window.setTimeout(function () {
              _this24.hideToast();
            }, options.duration);
          }
        },
        //关闭消息提示
      },
      {
        key: "hideToast",
        value: function hideToast() {
          this._clearToastTimer();
          var toastEl =
            this.container.getElementsByClassName("yb-player-toast")[0];
          if (toastEl) {
            toastEl.classList.remove("yb-player-toast-show");
            toastEl.classList.add("yb-player-toast-hide");
          }
        },
        //播放/暂停
      },
      {
        key: "toggle",
        value: function toggle() {
          this.video.paused ? this.video.play() : this.video.pause();
        },
        /**
         * 跳转进度条
         * @param {Number} time 进度位置（单位s）
         */
      },
      {
        key: "seek",
        value: function seek(time) {
          if (this.video) this.video.currentTime = time;
        },
        //播放上一个视频
      },
      {
        key: "prev",
        value: function prev() {
          var prevIndex = this.workIndex - 1;
          this.change(prevIndex < 0 ? 0 : prevIndex);
        },
        //播放下一个视频
      },
      {
        key: "next",
        value: function next() {
          var nextIndex = Number(this.workIndex) + 1;
          this.change(
            nextIndex > this.works.length - 1
              ? this.works.length - 1
              : nextIndex
          );
        },
        //切换视频播放
      },
      {
        key: "change",
        value: function change(index) {
          this.workIndex = index;
          this.setInnerHTML(
            "yb-player-prev",
            index > 0 ? YbPlayer.prevIcon : ""
          );
          this.setInnerHTML(
            "yb-player-next",
            index < this.works.length - 1 ? YbPlayer.nextIcon : ""
          );
          this.emit("workchange", {
            index: index,
            detail: this.works[index],
          });
        },
        /**
         * 设置视频方向
         * @param {Boolean} fullscreen 是否全屏
         */
      },
      {
        key: "setDirection",
        value: function setDirection(fullscreen) {
          var _this25 = this;
          this._isDirection = true;
          return new Promise(
            /*#__PURE__*/ (function () {
              var _ref2 = _asyncToGenerator(
                /*#__PURE__*/ _regenerator().m(function _callee4(resolve) {
                  var direction,
                    directionCode,
                    directionMsg,
                    width,
                    height,
                    _t2;
                  return _regenerator().w(
                    function (_context4) {
                      while (1)
                        switch ((_context4.p = _context4.n)) {
                          case 0:
                            direction = fullscreen
                              ? _this25.openDirection
                              : _this25.exitDirection; //如果打开全屏方向为auto,则自动根据视频尺寸计算屏幕方向
                            if (
                              _this25.openDirection == "auto" &&
                              fullscreen &&
                              _this25.video
                            ) {
                              width = _this25.video.videoWidth;
                              height = _this25.video.videoHeight;
                              direction =
                                width < height ? "portrait" : "landscape";
                            }
                            //如果plus属性不为空，说明在h5+环境下，直接调用plusAPI.实现屏幕旋转和隐藏导航栏状态栏等
                            if (!(_typeof(window.plus) == "object")) {
                              _context4.n = 1;
                              break;
                            }
                            if (direction)
                              plus.screen.lockOrientation(
                                direction
                              ); //锁定屏幕方向
                            else plus.screen.unlockOrientation(); //解除屏幕方向锁定
                            directionCode = 200;
                            directionMsg = "plus.screen.lockOrientation:ok";
                            //不支持全屏API，需要自行模拟全屏
                            if (!_this25.isSupportedFull()) {
                              _this25.setSystemFullscreen(fullscreen); //退出全屏前调用setFullscreen(false)，才会生效
                              if (fullscreen) {
                                _this25._bindbackbutton =
                                  _this25.exitFullscreen.bind(_this25);
                                plus.key.addEventListener(
                                  "backbutton",
                                  _this25._bindbackbutton
                                ); //增加返回键监听，用于点击返回退出全屏
                              } else {
                                _this25._removeBackbuttonListener(); //移除监听事件
                              }
                            }
                            _context4.n = 9;
                            break;
                          case 1:
                            if (
                              !(
                                "screen" in window &&
                                "orientation" in screen &&
                                "lock" in screen.orientation
                              )
                            ) {
                              _context4.n = 8;
                              break;
                            }
                            _context4.p = 2;
                            if (!direction) {
                              _context4.n = 4;
                              break;
                            }
                            _context4.n = 3;
                            return screen.orientation.lock(direction);
                          case 3:
                            _context4.n = 5;
                            break;
                          case 4:
                            screen.orientation.unlock();
                          case 5:
                            //解除屏幕方向锁定
                            directionCode = 200;
                            directionMsg = "window.screen.orientation.lock:ok";
                            _context4.n = 7;
                            break;
                          case 6:
                            _context4.p = 6;
                            _t2 = _context4.v;
                            directionCode = 403; //多半是权限问题导致的锁定屏幕失败，当前设备或目前的条件不允许调用
                            directionMsg = _t2.toString();
                          case 7:
                            _context4.n = 9;
                            break;
                          case 8:
                            directionCode = 404; //未找到相应的锁定屏幕函数
                            directionMsg =
                              "plus.screen.lockOrientation undefined;window.screen.orientation.lock undefined";
                          case 9:
                            _this25.emit("directionchange", {
                              to: direction,
                              //预期的屏幕方向
                              code: directionCode,
                              //锁定屏幕结果码
                              msg: directionMsg, //锁定屏幕的结果消息
                            });
                            window.setTimeout(function () {
                              resolve();
                            }, 200);
                          case 10:
                            return _context4.a(2);
                        }
                    },
                    _callee4,
                    null,
                    [[2, 6]]
                  );
                })
              );
              return function (_x2) {
                return _ref2.apply(this, arguments);
              };
            })()
          )["catch"](function (err) {
            resolve();
          });
        },
        /**
         * 设置系统fullscreen
         * @param {Boolean} fullscreen 是否全屏
         */
      },
      {
        key: "setSystemFullscreen",
        value: function setSystemFullscreen(fullscreen) {
          if (_typeof(window.plus) != "object") return;
          if (fullscreen) {
            plus.navigator.setFullscreen(true); //调用系统全屏
            plus.navigator.hideSystemNavigation(); //隐藏系统导航栏
          } else {
            plus.navigator.setFullscreen(false); //退出系统全屏
            window.setTimeout(function () {
              //不延迟，无法重新显示导航栏
              plus.navigator.showSystemNavigation(); //隐藏系统导航栏
            }, 200);
          }
        },
        //退出全屏
      },
      {
        key: "exitFullscreen",
        value: function exitFullscreen() {
          var _this26 = this;
          this.setDirection(false).then(function () {
            var cfs =
              document.exitFullscreen ||
              document.mozCancelFullScreen ||
              document.msExitFullscreen ||
              document.webkitExitFullscreen;
            if (typeof cfs != "undefined" && cfs) {
              cfs.call(document);
            } else if (typeof window.ActiveXObject !== "undefined") {
              //IE浏览器，模拟按下F11键退出全屏
              var wscript = new ActiveXObject("WScript.Shell");
              if (wscript != null) {
                wscript.SendKeys("{F11}");
              }
            } else {
              _this26.container.classList.remove("yb-player-openfull");
              _this26._fullscreenchanged();
            }
          });
        },
        //开启全屏
      },
      {
        key: "openFullscreen",
        value: function openFullscreen(direction) {
          var _this27 = this;
          this.openDirection = direction || this.openDirection;
          this.setDirection(true).then(function () {
            var rfs =
              document.documentElement.requestFullscreen ||
              document.documentElement.webkitRequestFullscreen ||
              document.documentElement.mozRequestFullscreen ||
              document.documentElement.requestFullScreen ||
              document.documentElement.webkitRequestFullScreen ||
              document.documentElement.mozRequestFullScreen;
            if (typeof rfs != "undefined" && rfs) {
              rfs.call(_this27.container);
            } else if (typeof window.ActiveXObject !== "undefined") {
              //IE浏览器，模拟按下F11全屏
              var wscript = new ActiveXObject("WScript.Shell");
              if (wscript != null) {
                wscript.SendKeys("{F11}");
              }
            } else {
              _this27._fullscreenerror();
            }
          });
        },
        //是否支持全屏API
      },
      {
        key: "isSupportedFull",
        value: function isSupportedFull() {
          if (
            document.documentElement.requestFullscreen ||
            document.documentElement.webkitRequestFullscreen ||
            document.documentElement.mozRequestFullscreen ||
            document.documentElement.requestFullScreen ||
            document.documentElement.webkitRequestFullScreen ||
            document.documentElement.mozRequestFullScreen
          ) {
            return true;
          } else if (typeof window.ActiveXObject !== "undefined") {
            return true;
          } else {
            return false;
          }
        },
        //展示控制栏
      },
      {
        key: "showControls",
        value: function showControls() {
          var _this28 = this;
          this._clearControlsTimer();
          if (this.disabled) {
            //锁屏之后显示锁屏图标
            this.container
              .getElementsByClassName("yb-player-locks")[0]
              .classList.remove("yb-player-hide");
          } else {
            //未锁屏则显示控制栏
            this.container
              .getElementsByClassName("yb-player-controls")[0]
              .classList.add("yb-player-controls-show");
            var progressEl =
              this.container.getElementsByClassName("yb-player-progress")[0];
            var progressCenterEl = this.container.getElementsByClassName(
              "yb-player-progress-center"
            )[0];

            //如果开启了全屏或者非全屏显示头部控制器
            if (this.getFullscreen() || this.header) {
              this.container
                .getElementsByClassName("yb-player-header")[0]
                .classList.add("yb-player-header-show");
            }
            if (this.getFullscreen()) {
              if (progressEl) progressEl.style.marginBottom = "15px";
              if (
                progressCenterEl &&
                progressCenterEl.previousElementSibling &&
                progressCenterEl.previousElementSibling.classList.contains(
                  "yb-player-hide"
                )
              )
                progressCenterEl.style.marginLeft = 0;
            } else {
              if (progressEl) progressEl.style.marginBottom = "";
              if (progressCenterEl) progressCenterEl.style.marginLeft = "5px";
            }
            var slotEl =
              this.container.getElementsByClassName("yb-player-slot")[0];
            //找到跟随控制栏的插槽内容并显示
            var children = slotEl ? slotEl.children : [];
            for (var i = 0; i < children.length; i++) {
              if (children[i].getAttribute("data-controls") == 1) {
                var isFull = children[i].classList.contains("yb-player-full"); //判断是否有全屏元素标记
                var isUnFull =
                  children[i].classList.contains("yb-player-unfull"); //判断是否有非全屏元素标记
                if (
                  (isFull && this.getFullscreen()) ||
                  (isUnFull && !this.getFullscreen()) ||
                  (!isFull && !isUnFull)
                )
                  children[i].classList.remove("yb-player-hide");
              }
            }
            //隐藏底部进度条
            this.container
              .getElementsByClassName("yb-player-bottom-progress")[0]
              .classList.add("yb-player-hide");
          }
          this.emit("controlschange", {
            show: true,
          });
          this._controlsTimer = window.setTimeout(function () {
            _this28.hideControls();
          }, 5000);
        },
        //关闭控制栏
      },
      {
        key: "hideControls",
        value: function hideControls(item, timer) {
          this._clearControlsTimer();
          this.container
            .getElementsByClassName("yb-player-controls")[0]
            .classList.remove("yb-player-controls-show");
          this.container
            .getElementsByClassName("yb-player-header")[0]
            .classList.remove("yb-player-header-show");
          this.container
            .getElementsByClassName("yb-player-locks")[0]
            .classList.add("yb-player-hide");
          var slotEl =
            this.container.getElementsByClassName("yb-player-slot")[0];
          //找到跟随控制栏的插槽内容并隐藏
          var children = slotEl ? slotEl.children : [];
          for (var i = 0; i < children.length; i++)
            if (children[i].getAttribute("data-controls") == 1)
              children[i].classList.add("yb-player-hide");
          //显示底部进度条
          if (!this.custom.disableBottomProgress && !this.isLive)
            this.container
              .getElementsByClassName("yb-player-bottom-progress")[0]
              .classList.remove("yb-player-hide");
          this.emit("controlschange", {
            show: false,
          });
        },
        //全屏开启错误事件
      },
      {
        key: "_fullscreenerror",
        value: function _fullscreenerror() {
          this.container.classList.add("yb-player-openfull");
          this._fullscreenchanged();
        },
        //全屏改变事件
      },
      {
        key: "_fullscreenchanged",
        value: (function () {
          var _fullscreenchanged2 = _asyncToGenerator(
            /*#__PURE__*/ _regenerator().m(function _callee5() {
              var e,
                wrapperEl,
                _args5 = arguments;
              return _regenerator().w(
                function (_context5) {
                  while (1)
                    switch (_context5.n) {
                      case 0:
                        e =
                          _args5.length > 0 && _args5[0] !== undefined
                            ? _args5[0]
                            : {};
                        this._setFullscreenStatus();
                        this._isDirection = false;
                        wrapperEl =
                          this.container.getElementsByClassName(
                            "yb-player-wrapper"
                          )[0];
                        if (this.getFullscreen()) {
                          this.video.style.height = "100%";
                          wrapperEl.style.height = "100%";
                          this.emit("fullscreenchange", {
                            fullscreen: true,
                            videoWidth: this.video.videoWidth,
                            videoHeight: this.video.videoHeight,
                            type: this.getFullscreenType(),
                          });
                        } else {
                          this.video.style.height = this.height;
                          wrapperEl.style.height = this.height;
                          this.emit("fullscreenchange", {
                            fullscreen: false,
                            type: e.isTrusted ? "api" : "css",
                          });
                        }
                        //如果没有调用过setDirection，说明是通过其它方式调用的打开全屏或退出全屏，需要去处理屏幕方向
                        if (!this._isDirection)
                          this.setDirection(this.getFullscreen());
                        this.refreshDanmu();
                        this.refreshPano();
                        this._isDirection = false;
                      case 1:
                        return _context5.a(2);
                    }
                },
                _callee5,
                this
              );
            })
          );
          function _fullscreenchanged() {
            return _fullscreenchanged2.apply(this, arguments);
          }
          return _fullscreenchanged;
        })(), //设置全屏改变状态
      },
      {
        key: "_setFullscreenStatus",
        value: function _setFullscreenStatus() {
          this.hidePopup();
          this.hideToolbar();
          var controlsEl =
            this.container.getElementsByClassName("yb-player-controls")[0];
          var headerEl =
            this.container.getElementsByClassName("yb-player-header")[0];
          var locksEl =
            this.container.getElementsByClassName("yb-player-locks")[0];
          var unFullEls =
            this.container.getElementsByClassName("yb-player-unfull"); //获取标记了非全屏的元素
          var fullEls = this.container.getElementsByClassName("yb-player-full"); //获取标记了全屏的元素
          if (this.getFullscreen()) {
            //全屏时隐藏非全屏元素
            for (var i = 0; i < unFullEls.length; i++)
              unFullEls[i].classList.add("yb-player-hide");
            //全屏时显示全屏元素
            for (var _i4 = 0; _i4 < fullEls.length; _i4++)
              fullEls[_i4].classList.remove("yb-player-hide");
            controlsEl.classList.add("yb-player-controls-safearea");
            headerEl.classList.add("yb-player-header-safearea");
            locksEl && locksEl.classList.add("yb-player-locks-safearea");
            this.setInnerHTML("yb-player-fullscreen", YbPlayer.exitfullIcon);
            if (this.controls) this.showControls();
          } else {
            //非全屏时显示非全屏元素
            for (var _i5 = 0; _i5 < unFullEls.length; _i5++)
              unFullEls[_i5].classList.remove("yb-player-hide");
            //全屏时隐藏全屏元素
            for (var _i6 = 0; _i6 < fullEls.length; _i6++)
              fullEls[_i6].classList.add("yb-player-hide");
            //移除安全区域
            controlsEl.classList.remove("yb-player-controls-safearea");
            headerEl.classList.remove("yb-player-header-safearea");
            locksEl && locksEl.classList.remove("yb-player-locks-safearea");
            this.setInnerHTML("yb-player-fullscreen", YbPlayer.openfullIcon);
            this.hideControls();
          }
        },

        /***** 清除定时器 *****/
      },
      {
        key: "_clearToastTimer",
        value: function _clearToastTimer() {
          if (this._toastTimer) {
            window.clearTimeout(this._toastTimer);
            this._toastTimer = null;
          }
        },
      },
      {
        key: "_clearControlsTimer",
        value: function _clearControlsTimer() {
          if (this._controlsTimer) {
            window.clearTimeout(this._controlsTimer);
            this._controlsTimer = null;
          }
        },
      },
      {
        key: "_clearDanmuTimer",
        value: function _clearDanmuTimer() {
          if (this._danmuTimer) {
            window.clearInterval(this._danmuTimer);
            this._danmuTimer = null;
          }
        },
      },
      {
        key: "_clearSeizingTimer",
        value: function _clearSeizingTimer() {
          if (this._seizingTimer) {
            window.clearTimeout(this._seizingTimer);
            this._seizingTimer = null;
          }
        },
      },
      {
        key: "_removeBackbuttonListener",
        value: function _removeBackbuttonListener() {
          if (this._bindbackbutton) {
            plus.key.removeEventListener("backbutton", this._bindbackbutton);
            this._bindbackbutton = null;
          }
        },
      },
    ],
    [
      {
        key: "tap",
        value:
          //无延迟点击事件
          function tap(obj, callback) {
            //判断一下是否支持touchstart，看看是否是移动端设备
            if ("ontouchstart" in window) {
              var isMove = false; //记录手指是否移动
              var startTime = 0; //记录手指触摸的时间
              obj.ontouchstart = function (e) {
                startTime = Date.now(); //记录触摸时间
              };
              obj.ontouchmove = function (e) {
                isMove = true; //查看手指是否滑动
              };
              obj.ontouchend = function (e) {
                if (!isMove && Date.now() - startTime < 150) {
                  callback && callback();
                }
                isMove = false; //取反 重置
                startTime = 0;
              };
            } else {
              obj.onclick = function (e) {
                callback && callback();
              };
            }
          },
      },
      {
        key: "getDecodeType",
        value: function getDecodeType(decoder, src) {
          //根据后缀获取解码类型
          if (
            src.startsWith("ws://") ||
            src.startsWith("wss://") ||
            src.includes(".ts")
          )
            return "jsmpeg";
          else if (src.includes(".m3u8") && decoder.hls.loader.isSupported())
            return "hls";
          else if (src.includes(".flv") && decoder.flv.loader.isSupported())
            return "flv";
          else if (
            src.includes(".mp4") ||
            src.includes(".webm") ||
            src.includes(".ogg") ||
            (!decoder.hls.loader.isSupported() && src.includes(".m3u8")) ||
            (!decoder.flv.loader.isSupported() && src.includes(".flv"))
          )
            return "video";
          else return "";
        },
        //尝试加载hls
      },
      {
        key: "checkWithHls",
        value: function checkWithHls(Hls, src) {
          return new Promise(function (resolve) {
            var hls = new Hls();
            var timeout = setTimeout(function () {
              cleanup();
              resolve("");
            }, 10000); // 10秒超时
            function cleanup() {
              clearTimeout(timeout);
              timeout = null;
              if (hls) {
                hls.destroy();
                hls = null;
              }
            }
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data.fatal) {
                //加载失败返回false
                cleanup();
                resolve("");
              }
            });
            hls.loadSource(src);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              cleanup();
              resolve("hls");
            });
          });
        },
        //尝试加载flv
      },
      {
        key: "checkWithFlv",
        value: function checkWithFlv(flvjs, src) {
          return new Promise(function (resolve) {
            // 创建一个临时的视频元素
            var mediaElement = document.createElement("video");
            mediaElement.style.display = "none"; // 隐藏视频元素
            document.body.appendChild(mediaElement);
            var flvPlayer = flvjs.createPlayer(
              {
                type: "flv",
                url: src,
              },
              {
                enableWorker: false,
                // 禁用Worker以提高兼容性
                lazyLoad: false,
                lazyLoadMaxDuration: 3 * 60,
                seekType: "range", // 使用range seek
              }
            );
            // 绑定到媒体元素
            flvPlayer.attachMediaElement(mediaElement);
            var timeout = setTimeout(function () {
              cleanup();
              resolve("");
            }, 10000); // 10秒超时
            function cleanup() {
              clearTimeout(timeout);
              timeout = null;
              if (flvPlayer) {
                flvPlayer.pause();
                flvPlayer.unload();
                flvPlayer.detachMediaElement();
                flvPlayer.destroy();
                flvPlayer = null;
              }
              if (mediaElement && mediaElement.parentNode) {
                mediaElement.parentNode.removeChild(mediaElement);
              }
            }
            flvPlayer.on(flvjs.Events.ERROR, function (e) {
              cleanup();
              resolve("");
            });
            flvPlayer.on(flvjs.Events.LOADING_COMPLETE, function () {
              cleanup();
              resolve("flv");
            });

            // 添加更多事件监听
            flvPlayer.on(flvjs.Events.METADATA_ARRIVED, function () {
              // 收到元数据也算成功
              cleanup();
              resolve("flv");
            });
            flvPlayer.on(flvjs.Events.STATISTICS_INFO, function () {
              // 有统计信息说明在正常工作
              cleanup();
              resolve("flv");
            });
            flvPlayer.load();
            try {
              flvPlayer.load();
              flvPlayer.play();
            } catch (error) {
              cleanup();
              resolve("");
            }
          });
        },
        //检测是否支持video播放
      },
      {
        key: "checkWithVideo",
        value: function checkWithVideo(src) {
          return new Promise(function (resolve, reject) {
            // 创建一个临时的视频元素
            var mediaElement = document.createElement("video");
            mediaElement.muted = true; //静音
            mediaElement.playsInline = true; //避免被劫持
            mediaElement.style.display = "none"; //隐藏视频元素
            var timeout = setTimeout(function () {
              cleanup();
              resolve("");
            }, 10000); // 10秒超时
            function cleanup() {
              clearTimeout(timeout);
              timeout = null;
              if (mediaElement && mediaElement.parentNode) {
                mediaElement.parentNode.removeChild(mediaElement);
              }
            }
            mediaElement.onerror = function (e) {
              cleanup();
              resolve("");
            };
            mediaElement.onloadedmetadata = function (e) {
              cleanup();
              resolve("video");
            };
            mediaElement.src = src;
          });
        },

        //时间格式化
      },
      {
        key: "timeFormat",
        value: function timeFormat(value) {
          var hours =
            Math.floor((value / 60 / 60) % 60) >= 10
              ? Math.floor((value / 60 / 60) % 60)
              : "0" + Math.floor((value / 60 / 60) % 60);
          var minutes =
            Math.floor((value / 60) % 60) >= 10
              ? Math.floor((value / 60) % 60)
              : "0" + Math.floor((value / 60) % 60);
          var seconds =
            Math.floor(value % 60) >= 10
              ? Math.floor(value % 60)
              : "0" + Math.floor(value % 60);
          return hours == "00"
            ? minutes + ":" + seconds
            : hours + ":" + minutes + ":" + seconds;
        },
        //时分秒转换秒
      },
      {
        key: "timeToSeconds",
        value: function timeToSeconds(timeStr) {
          var timeRegex = /^(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{1,3})$/;
          var match = timeStr.match(timeRegex);
          if (!match) {
            throw new Error("Invalid time format");
          }
          // 提取匹配结果
          var _match = _slicedToArray(match, 5),
            hours = _match[1],
            minutes = _match[2],
            seconds = _match[3],
            milliseconds = _match[4];

          // 将时分秒毫秒转换为总秒数
          var totalSeconds =
            +hours * 3600 + +minutes * 60 + +seconds + +milliseconds / 1000;
          return totalSeconds;
        },

        /**
         * 深度克隆
         * @param { Object } obj 克隆对象
         */
      },
      {
        key: "deepClone",
        value: function deepClone(obj) {
          if (_typeof(obj) !== "object" && typeof obj !== "function") {
            //原始类型直接返回
            return obj;
          }
          var o =
            Object.prototype.toString.call(obj) === "[object Array]" ? [] : {};
          for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
              o[i] =
                i === "loader"
                  ? ""
                  : Object.prototype.toString.call(obj[i]) ===
                    "[object XMLHttpRequest]"
                  ? ""
                  : _typeof(obj[i]) === "object"
                  ? YbPlayer.deepClone(obj[i])
                  : obj[i];
            }
          }
          return o;
        },
      },
      {
        key: "isFlvFatalError",
        value: function isFlvFatalError(errorType, errorDetail, errorInfo) {
          // HTTP 状态码错误
          return errorInfo && errorInfo.code && errorInfo.code >= 400;
          // 格式不支持错误
          var fatalErrors = [
            "MEDIA_FORMAT_UNSUPPORTED",
            "MEDIA_CODEC_UNSUPPORTED",
            "NETWORK_STATUS_CODE_INVALID",
            "DEMUXER_ERROR",
          ];
          return fatalErrors.includes(errorDetail);
        },
      },
    ]
  );
})(); //兼容new Function，为了挂载到window对象上
_defineProperty(
  YbPlayer,
  "openfullIcon",
  '\n\t\t<svg t="1758178660741" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18274" width="48" height="48"><path d="M392.704 893.44H186.368c-31.232 0-55.808-24.576-55.808-55.808v-204.8c0-7.168 6.144-13.312 13.312-13.312h83.456c7.168 0 13.312 6.144 13.312 13.312v138.24c0 7.168 6.144 13.312 13.312 13.312h137.728c7.168 0 13.312 6.144 13.312 13.312v81.408c1.024 8.192-5.12 14.336-12.288 14.336z m444.928 0h-200.704c-7.168 0-13.312-6.144-13.312-13.312V798.72c0-7.168 6.144-13.312 13.312-13.312h133.632c7.168 0 13.312-6.144 13.312-13.312V634.88c0-7.168 6.144-13.312 13.312-13.312h82.432c7.168 0 13.312 6.144 13.312 13.312v202.752c0.512 31.232-24.064 55.808-55.296 55.808z m42.496-490.496h-82.432c-7.168 0-13.312-6.144-13.312-13.312V252.416c0-7.168-6.144-13.312-13.312-13.312h-134.656c-7.168 0-13.312-6.144-13.312-13.312v-81.92c0-7.168 6.144-13.312 13.312-13.312h201.728c31.232 0 55.808 24.576 55.808 55.808v203.264c-0.512 7.168-6.656 13.312-13.824 13.312zM227.328 404.48H143.872c-7.168 0-13.312-6.144-13.312-13.312v-204.8c0-31.232 24.576-55.808 55.808-55.808h206.336c7.168 0 13.312 6.144 13.312 13.312V225.28c0 7.168-6.144 13.312-13.312 13.312h-138.24c-7.168 0-13.312 6.144-13.312 13.312v137.728c-0.512 8.704-6.144 14.848-13.824 14.848z" p-id="18275"></path></svg>\n\t'
);
//退出全屏按钮
_defineProperty(
  YbPlayer,
  "exitfullIcon",
  '\n\t\t<svg viewBox="0 0 24 24">\n\t\t    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>\n\t\t</svg>\n\t'
);
//中间播放按钮
_defineProperty(
  YbPlayer,
  "playcenterIcon",
  '\n\t\t<svg width="100" height="100" viewBox="0 0 100 100" id="svgButton">\n\t\t    <circle cx="50" cy="50" r="45" stroke="white" stroke-width="2" fill="none" />\n\t\t    <path id="play" d="M40,30 L40,70 L70,50 Z" fill="white" />\n\t\t</svg>\n\t'
);
//播放按钮
_defineProperty(
  YbPlayer,
  "playIcon",
  '\n\t\t<svg t="1758177095662" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5880" width="48" height="48"><path d="M882.734114 459.147258l0.024559-0.024559L244.016061 21.12718l-0.199545 0.188288C230.582097 8.748245 212.62819 1.014096 192.840518 1.014096c-40.704051 0-73.699536 32.66905-73.699536 72.996524 0 22.148439-0.954745 65.513086 0 64.572668l0 373.422851 0 393.071354c0 0.325411 0 25.249057 0 44.935422 0 40.302915 32.995485 72.972988 73.699536 72.972988 19.862373 0 37.892005-7.78429 51.125401-20.466124l0.050142 0.025583 638.742613-437.982216-0.024559-0.038886c13.886265-13.270235 22.549575-31.889291 22.549575-52.531424 0-0.050142 0-0.088004 0-0.150426 0-0.050142 0-0.11154 0-0.149403C905.28369 491.048829 896.620379 472.41647 882.734114 459.147258z" p-id="5881"></path></svg>\n\t'
);
//暂停按钮
_defineProperty(
  YbPlayer,
  "pauseIcon",
  '\n\t\t<svg t="1758178251644" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11765" width="48" height="48"><path d="M432 176v672c0 26.5-21.5 48-48 48H224c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48h160c26.5 0 48 21.5 48 48zM848 176v672c0 26.5-21.5 48-48 48H640c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48h160c26.5 0 48 21.5 48 48z" p-id="11766"></path></svg>\n\t'
);
//上一个按钮
_defineProperty(
  YbPlayer,
  "prevIcon",
  '\n\t\t<svg viewBox="0 0 1024 1024"><path d="M409.6 379.965l290.673-183.214c43.049-27.136 77.967-8.396 77.967 42.046v546.406c0 50.36-34.857 69.223-77.967 42.046L409.6 644.035V757.76a81.92 81.92 0 1 1-163.84 0V266.24a81.92 81.92 0 1 1 163.84 0v113.725z"></path></svg>\n\t'
);
//下一个按钮
_defineProperty(
  YbPlayer,
  "nextIcon",
  '\n\t\t<svg viewBox="0 0 1024 1024"><path d="M614.4 379.965V266.24a81.92 81.92 0 1 1 163.84 0v491.52a81.92 81.92 0 1 1-163.84 0V644.035L323.727 827.249c-43.11 27.177-77.967 8.315-77.967-42.046V238.797c0-50.442 34.918-69.182 77.967-42.046L614.4 379.965z"></path></svg>\n\t'
);
//加载图标
_defineProperty(
  YbPlayer,
  "loadIcon",
  '\n\t\t<svg class="spinner" viewBox="0 0 50 50">\n\t\t    <circle cx="25" cy="25" r="20" fill="none"/>\n\t\t</svg>\n\t'
);
//音量图标
_defineProperty(
  YbPlayer,
  "voiceIcon",
  '\n\t\t<svg viewBox="0 0 24 24">\n\t\t    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>\n\t\t</svg>\n\t'
);
//返回图标
_defineProperty(
  YbPlayer,
  "backIcon",
  '\n\t\t<svg width="24" height="24" viewBox="0 0 24 24" fill="none">\n\t\t  <path d="M19 12H5M5 12L11 18M5 12L11 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n\t\t</svg>\n\t'
);
//重加载图标
_defineProperty(
  YbPlayer,
  "errorIcon",
  '\n\t\t<svg t="1756091252738" class="icon" viewBox="0 0 1024 1024" p-id="5051">\n\t\t\t<path d="M637.76 138.112a391.744 391.744 0 0 1 5.12 748.8l43.776 26.24a32 32 0 0 1-19.008 59.52 32 32 0 0 1-16-4.8l-106.56-65.6a32 32 0 0 1-10.56-43.968l65.6-106.56a32 32 0 1 1 54.592 33.408l-22.848 38.144a327.808 327.808 0 0 0-12.544-624 32 32 0 0 1 18.432-61.184zM391.872 79.36l115.2 49.152a32 32 0 0 1 17.088 17.6 32 32 0 0 1 0 24.448l-49.088 115.008a32 32 0 0 1-29.76 19.52 32 32 0 0 1-29.44-44.608l21.44-49.92a327.808 327.808 0 0 0-3.84 633.792 32 32 0 0 1-7.68 62.912 29.76 29.76 0 0 1-8.32-1.152 391.744 391.744 0 0 1-14.08-752.256L366.72 138.24a32 32 0 1 1 25.152-58.88z" p-id="5052"></path>\n\t\t</svg>\n\t'
);
//锁屏图标
_defineProperty(
  YbPlayer,
  "lockIcon",
  '\n\t\t<svg t="1756887430264" viewBox="0 0 1024 1024"><path d="M394.304 316.608A124.672 124.672 0 0 1 518.72 192a124.704 124.704 0 0 1 124.48 124.608V416h-248.896V316.608zM544 704a32 32 0 0 1-64 0v-128a32 32 0 0 1 64 0v128z m256.256-288H707.2V316.608A188.736 188.736 0 0 0 518.72 128c-103.904 0-188.416 84.608-188.416 188.608V416h-106.56A64 64 0 0 0 160 480.096v319.84A64 64 0 0 0 223.744 864h576.512A64 64 0 0 0 864 799.936v-319.84A64 64 0 0 0 800.256 416z" p-id="10429"></path></svg>\n\t'
);
//解开锁屏图标
_defineProperty(
  YbPlayer,
  "unlockIcon",
  '\n\t\t<svg t="1756887487890" class="icon" viewBox="0 0 1024 1024"><path d="M544 704a32 32 0 0 1-64 0v-128a32 32 0 0 1 64 0v128z m256.256-288H394.304V316.608A124.672 124.672 0 0 1 518.72 192a124.704 124.704 0 0 1 124.48 124.608 32 32 0 1 0 64 0A188.736 188.736 0 0 0 518.72 128c-103.904 0-188.416 84.608-188.416 188.608V416h-106.56A64 64 0 0 0 160 480.096v319.84A64 64 0 0 0 223.744 864h576.512A64 64 0 0 0 864 799.936v-319.84A64 64 0 0 0 800.256 416z" p-id="11412"></path></svg>\n\t'
);
//更多图标
_defineProperty(
  YbPlayer,
  "moreIcon",
  '\n\t\t<svg t="1756887864084" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="21526" width="48" height="48"><path d="M512 416c53.02 0 96 42.98 96 96s-42.98 96-96 96-96-42.98-96-96 42.98-96 96-96z m320 0c53.02 0 96 42.98 96 96s-42.98 96-96 96-96-42.98-96-96 42.98-96 96-96z m-640 0c53.02 0 96 42.98 96 96s-42.98 96-96 96-96-42.98-96-96 42.98-96 96-96z" p-id="21527"></path></svg>\n\t'
);
if (typeof window != "undefined") {
  window.YbPlayer = YbPlayer;
}

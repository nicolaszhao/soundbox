(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("events-trigger"));
	else if(typeof define === 'function' && define.amd)
		define(["events-trigger"], factory);
	else if(typeof exports === 'object')
		exports["AudioEngine"] = factory(require("events-trigger"));
	else
		root["AudioEngine"] = factory(root["EventsTrigger"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.STATES = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _states = __webpack_require__(1);

	Object.defineProperty(exports, 'STATES', {
		enumerable: true,
		get: function get() {
			return _interopRequireDefault(_states).default;
		}
	});

	var _eventsTrigger = __webpack_require__(2);

	var _eventsTrigger2 = _interopRequireDefault(_eventsTrigger);

	var _core = __webpack_require__(3);

	var _core2 = _interopRequireDefault(_core);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var id = 0;

	var uniqueId = function uniqueId(prefix) {
		id++;
		return prefix ? prefix + '-' + id : id;
	};

	var time2str = function time2str(time) {
		var floor = Math.floor,
		    r = [],
		    hour = void 0,
		    minute = void 0,
		    pad = void 0,
		    second = void 0;

		time = Math.round(time);
		hour = floor(time / 3600);
		minute = floor((time - 3600 * hour) / 60);
		second = time % 60;

		pad = function pad(source, length) {
			var nagative = void 0,
			    pre = void 0,
			    str = void 0;

			pre = '';
			nagative = '';

			if (source < 0) {
				nagative = '-';
			}

			str = String(Math.abs(source));

			if (str.length < length) {
				pre = new Array(length - str.length + 1).join('0');
			}

			return nagative + pre + str;
		};

		if (hour) {
			r.push(hour);
		}

		r.push(pad(minute, 2));
		r.push(pad(second, 2));

		return r.join(':');
	};

	var Song = function (_Events) {
		_inherits(Song, _Events);

		function Song(options) {
			_classCallCheck(this, Song);

			var _this = _possibleConstructorReturn(this, (Song.__proto__ || Object.getPrototypeOf(Song)).call(this));

			options = Object.assign({
				volume: 100,
				muted: false
			}, options);

			_this.id = uniqueId('song');
			_this.url = options.url;
			_this.volume = options.volume;
			_this.muted = options.muted;
			_this.startTime = options.startTime || 0;
			_this.endTime = options.endTime || 0;
			_this.duration = 0;
			return _this;
		}

		_createClass(Song, [{
			key: 'setVolume',
			value: function setVolume(volume) {
				this.volume = volume;
			}
		}, {
			key: 'setMute',
			value: function setMute(muted) {
				this.muted = muted;
			}
		}, {
			key: 'setDuration',
			value: function setDuration(duration) {
				this.duration = duration;
			}
		}]);

		return Song;
	}(_eventsTrigger2.default);

	var Engine = function () {
		function Engine() {
			_classCallCheck(this, Engine);

			this.core = new _core2.default();
			this.list = [];
			this.cur = '';

			this.init();
		}

		_createClass(Engine, [{
			key: 'init',
			value: function init() {
				var _this2 = this;

				this.core.on('progress', function (bufferedPercent) {
					var song = _this2.findSong(_this2.cur);
					if (song) {
						song.trigger('progress', bufferedPercent);
					}
				}).on('error', function (_ref) {
					var code = _ref.code;

					var song = _this2.findSong(_this2.cur),
					    message = void 0;

					if (song) {
						message = '\u64AD\u653E\u8D44\u6E90\uFF1A' + song.url + '\u53D1\u751F\u9519\u8BEF\uFF0C\n\t\t\t\t\t\t\u9519\u8BEF\u7801\uFF1A' + code + '\uFF0C\u8BF7\u5230\u8FD9\u91CC\uFF1Ahttp://www.w3school.com.cn/tags/av_prop_error.asp\u67E5\u627E\u76F8\u5E94\u7684\u4FE1\u606F\u3002';

						song.trigger('error', new Error(message));
					}
				}).on('positionchange', function (currentTime, playedPercent) {
					var song = _this2.findSong(_this2.cur);

					if (song) {
						if (song.endTime && currentTime >= song.endTime) {
							return _this2.core.stop();
						}

						song.trigger('positionchange', currentTime, playedPercent || 0);
					}
				}).on('statechange', function (state) {
					var song = _this2.findSong(_this2.cur);
					if (song) {
						song.trigger('statechange', state);
					}
				});
			}
		}, {
			key: 'reset',
			value: function reset() {
				var len = this.list.length;

				while (len--) {
					this.list[len].off();
				}
				this.list = [];
				this.cur = '';

				return this;
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				this.reset();
				this.core.destroy();
			}
		}, {
			key: 'add',
			value: function add(song) {
				song = new Song(song);
				this.list.push(song);
				return song;
			}
		}, {
			key: 'remove',
			value: function remove(song) {
				var len = this.list.length;

				while (len--) {
					if (song.id === this.list[len].id) {
						if (song.id === this.cur) {
							this.core.stop();
						}
						song.off();
						this.list.splice(len, 1);
						break;
					}
				}

				return this;
			}
		}, {
			key: 'play',
			value: function play(song) {
				var _this3 = this;

				var curSong = void 0,
				    adjustCore = function adjustCore(song) {
					song.setDuration(_this3.core.getTotalTime());
					_this3.core.setCurrentPosition(song.startTime).setVolume(song.volume).setMute(song.muted);
				};

				return new Promise(function (resolve) {
					if (song.id === _this3.cur) {
						_this3.core.play();
						return resolve(song);
					}

					if (_this3.cur) {

						_this3.core.stop();
						curSong = _this3.list.find(function (n) {
							return n.id === _this3.cur;
						});

						if (curSong && curSong.url === song.url) {
							_this3.cur = song.id;
							adjustCore(song);
							_this3.core.play();
							return resolve(song);
						}
					}

					_this3.cur = song.id;
					_this3.core.setUrl(song.url).then(function () {
						adjustCore(song);
						_this3.core.play();
						resolve(song);
					});
				});
			}
		}, {
			key: 'pause',
			value: function pause() {
				this.core.pause();
				return this;
			}
		}, {
			key: 'setVolume',
			value: function setVolume(song, volume) {
				if (song.id === this.cur) {
					this.core.setVolume(volume);
				}

				song.setVolume(volume);
				return this;
			}
		}, {
			key: 'setMute',
			value: function setMute(song, muted) {
				if (song.id === this.cur) {
					this.core.setMute(muted);
				}

				song.setMute(muted);
				return this;
			}
		}, {
			key: 'setPosition',
			value: function setPosition(song, time) {
				if (song.id === this.cur) {
					this.core.setCurrentPosition(time);
				}
				return this;
			}

			// to: '00:00'

		}, {
			key: 'formatTime',
			value: function formatTime(time) {
				return time2str(time);
			}
		}, {
			key: 'findSong',
			value: function findSong(songId) {
				return this.list.find(function (n) {
					return n.id === songId;
				});
			}
		}]);

		return Engine;
	}();

	exports.default = Engine;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var STATES = {
		PREBUFFER: 'waiting',
		BUFFERING: 'loadeddata',
		PLAYING: 'playing',
		PAUSE: 'pause',
		STOP: 'suspend',
		END: 'ended'
	};

	exports.default = STATES;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _eventsTrigger = __webpack_require__(2);

	var _eventsTrigger2 = _interopRequireDefault(_eventsTrigger);

	var _states = __webpack_require__(1);

	var _states2 = _interopRequireDefault(_states);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Core = function (_Events) {
		_inherits(Core, _Events);

		function Core() {
			_classCallCheck(this, Core);

			var _this = _possibleConstructorReturn(this, (Core.__proto__ || Object.getPrototypeOf(Core)).call(this));

			var audio = new Audio();

			audio.preload = false;
			audio.autoplay = false;
			audio.loop = false;

			_this.audio = audio;
			_this._canPlayThrough = false;
			_this._url = '';

			_this.init();
			return _this;
		}

		_createClass(Core, [{
			key: 'init',
			value: function init() {
				var that = this,
				    _progress = function _progress() {
					var per = that.getLoadedPercent();
					that.trigger('progress', per);

					if (per === 1) {
						that._canPlayThrough = true;
					}

					return per;
				};

				this.eventHandlers = {
					loadstart: function loadstart() {
						var p = function p() {
							that.progressTimer = setTimeout(function () {
								if (_progress() < 1) {
									p();
								}
							}, 50);
						};

						that._canPlayThrough = false;
						clearTimeout(that.progressTimer);
						p();
					},
					progress: function progress() {
						clearTimeout(that.progressTimer);
						if (!that._canPlayThrough) {
							_progress();
						}
					},
					playing: function playing() {
						clearTimeout(that.errorTimer);
						that.setState(_states2.default.PLAYING);
					},
					error: function error(e) {
						clearTimeout(that.errorTimer);
						return that.errorTimer = setTimeout(function () {
							return that.trigger('error', e);
						}, 2000);
					},
					ended: function ended() {
						that.setState(_states2.default.END);
					},
					waiting: function waiting() {
						that.setState(_states2.default.PREBUFFER);
					},
					loadeddata: function loadeddata() {
						that.setState(_states2.default.BUFFERING);
					},
					timeupdate: function timeupdate() {
						var currentTime = that.getCurrentPosition();
						that.trigger('positionchange', currentTime, (currentTime / that.getTotalTime()).toFixed(2) * 1 || 0);
					}
				};

				for (var type in this.eventHandlers) {
					this.audio.addEventListener(type, this.eventHandlers[type], false);
				}
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				this.reset().off();
				for (var type in this.eventHandlers) {
					this.audio.removeEventListener(type, this.eventHandlers[type], false);
				}
			}
		}, {
			key: 'reset',
			value: function reset() {
				this.stop();
				this._url = '';
				this._canPlayThrough = false;
				this.trigger('progress', 0);
				this.trigger('positionchange', 0);
				return this;
			}
		}, {
			key: 'getLoadedPercent',
			value: function getLoadedPercent() {
				var be = void 0,
				    bl = void 0,
				    currentTime = void 0,
				    audio = this.audio,
				    buffered = audio.buffered,
				    duration = audio.duration;

				be = audio.currentTime;

				// 缓冲时间是个区块列表，用户点击进度条的位置是不确定的，那么每个缓冲就会从那个点开始
				// 默认就一个区块，不点击时可以是连续的
				if (buffered) {
					bl = buffered.length;
					currentTime = audio.currentTime;
					while (bl--) {
						if (buffered.start(bl) <= currentTime && currentTime <= buffered.end(bl)) {
							be = buffered.end(bl);
							break;
						}
					}
				}

				return (be / duration).toFixed(2) * 1 || 0;
			}
		}, {
			key: 'getCurrentPosition',
			value: function getCurrentPosition() {
				return this.audio.currentTime;
			}
		}, {
			key: 'setCurrentPosition',
			value: function setCurrentPosition(time) {
				try {
					this.audio.currentTime = time;
				} catch (err) {}
				return this;
			}
		}, {
			key: 'getTotalTime',
			value: function getTotalTime() {
				return this.audio.duration || 0;
			}
		}, {
			key: 'setState',
			value: function setState(st) {
				if (!this._url) {
					st = _states2.default.STOP;
				}

				if (st === this._state) {
					return;
				}

				if (this._canPlayThrough && (st === _states2.default.PREBUFFER || st === _states2.default.BUFFERING)) {
					return;
				}

				this._state = st;

				return this.trigger('statechange', st);
			}
		}, {
			key: 'getState',
			value: function getState() {
				return this._state;
			}
		}, {
			key: 'setUrl',
			value: function setUrl(url) {
				var _this2 = this;

				var that = this,
				    checkStart = function checkStart(resolve) {

					// readyState：2表示可以有足够的资源可以播放了
					if (that.audio.readyState > 2) {

						clearTimeout(that.checkStartTimer);
						resolve();
					} else {
						that.checkStartTimer = setTimeout(function () {
							checkStart(resolve);
						}, 50);
					}
				};

				return new Promise(function (resolve, reject) {
					if (url) {
						_this2._url = url;
						_this2.audio.src = url;
						_this2.audio.load();
						checkStart(resolve);
					} else {
						reject();
					}
				});
			}
		}, {
			key: 'play',
			value: function play() {
				this.audio.play();
				return this;
			}
		}, {
			key: 'pause',
			value: function pause() {
				this.audio.pause();
				this.setState(_states2.default.PAUSE);
				return this;
			}
		}, {
			key: 'stop',
			value: function stop() {
				this.audio.pause();

				try {
					this.audio.currentTime = 0;
				} catch (err) {}

				this.trigger('positionchange', 0);
				return this.setState(_states2.default.STOP);
			}
		}, {
			key: 'setVolume',
			value: function setVolume(volume) {
				if (typeof volume === 'number' && volume >= 0 && volume <= 100) {
					this.audio.volume = volume / 100;
				}

				return this;
			}
		}, {
			key: 'getVolume',
			value: function getVolume() {
				return parseInt(this.audio.volume * 100);
			}
		}, {
			key: 'setMute',
			value: function setMute(mute) {
				this.audio.muted = !!mute;
				return this;
			}
		}, {
			key: 'getMute',
			value: function getMute() {
				return this.audio.muted;
			}
		}]);

		return Core;
	}(_eventsTrigger2.default);

	exports.default = Core;

/***/ })
/******/ ])
});
;
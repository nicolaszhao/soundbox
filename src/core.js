import Events from 'events-trigger';
import STATES from './states';

class Core extends Events {
	constructor() {
		super();

		let audio = new Audio();

		audio.preload = false;
		audio.autoplay = false;
		audio.loop = false;

		this.audio = audio;
		this._canPlayThrough = false;
		this._url = '';

		this.init();
	}

	init() {
		let that = this,
			progress = function() {
				let per = that.getLoadedPercent();
				that.trigger('progress', per);

				if (per === 1) {
					that._canPlayThrough = true;
				}

				return per;
			};

		this.eventHandlers = {
			loadstart() {
				let p = function() {
					that.progressTimer = setTimeout(function() {
						if (progress() < 1) {
							p();
						}
					}, 50);
				};

				that._canPlayThrough = false;
				clearTimeout(that.progressTimer);
				p();
			},
			progress() {
				clearTimeout(that.progressTimer);
				if (!that._canPlayThrough) {
					progress();
				}
			},
			playing() {
				clearTimeout(that.errorTimer);
				that.setState(STATES.PLAYING);
			},
			error(e) {
				clearTimeout(that.errorTimer);
				return that.errorTimer = setTimeout(function() {
					return that.trigger('error', e);
				}, 2000);
			},
			ended() {
				that.setState(STATES.END);
			},
			waiting() {
				that.setState(STATES.PREBUFFER);
			},
			loadeddata() {
				that.setState(STATES.BUFFERING);
			},
			timeupdate() {
				let currentTime = that.getCurrentPosition();
				that.trigger('positionchange', currentTime, (currentTime / that.getTotalTime()).toFixed(2) * 1 || 0);
			}
		};

		for (let type in this.eventHandlers) {
			this.audio.addEventListener(type, this.eventHandlers[type], false);
		}
	}

	destroy() {
		this.reset().off();
		for (let type in this.eventHandlers) {
			this.audio.removeEventListener(type, this.eventHandlers[type], false);
		}
	}

	reset() {
		this.stop();
		this._url = '';
		this._canPlayThrough = false;
		this.trigger('progress', 0);
		this.trigger('positionchange', 0);
		return this;
	}

	getLoadedPercent() {
		let be, bl, currentTime,
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
				if ((buffered.start(bl) <= currentTime && currentTime <= buffered.end(bl))) {
					be = buffered.end(bl);
					break;
				}
			}
		}

		return (be / duration).toFixed(2) * 1 || 0;
	}

	getCurrentPosition() {
		return this.audio.currentTime;
	}

	setCurrentPosition(time) {
		try {
			this.audio.currentTime = time;
		} catch (err) {
		}
		return this;
	}

	getTotalTime() {
		return this.audio.duration || 0;
	}

	setState(st) {
		if (!this._url) {
			st = STATES.STOP;
		}

		if (st === this._state) {
			return;
		}

		if (this._canPlayThrough && (st === STATES.PREBUFFER || st === STATES.BUFFERING)) {
			return;
		}

		this._state = st;

		return this.trigger('statechange', st);
	}

	getState() {
		return this._state;
	}

	setUrl(url) {
		let that = this,
			checkStart = function(resolve) {

				// readyState：2表示可以有足够的资源可以播放了
				if (that.audio.readyState > 2) {

					clearTimeout(that.checkStartTimer);
					resolve();
				} else {
					that.checkStartTimer = setTimeout(function() {
						checkStart(resolve);
					}, 50);
				}
			};

		return new Promise((resolve, reject) => {
			if (url) {
				this._url = url;
				this.audio.src = url;
				this.audio.load();
				checkStart(resolve);
			} else {
				reject();
			}
		});
	}

	play() {
		this.audio.play();
		return this;
	}

	pause() {
		this.audio.pause();
		this.setState(STATES.PAUSE);
		return this;
	}

	stop() {
		this.audio.pause();

		try {
			this.audio.currentTime = 0;
		} catch (err) {
		}

		this.trigger('positionchange', 0);
		return this.setState(STATES.STOP);
	}

	setVolume(volume) {
		if (typeof volume === 'number' && volume >= 0 && volume <= 100) {
			this.audio.volume = volume / 100;
		}

		return this;
	}

	getVolume() {
		return parseInt(this.audio.volume * 100);
	}

	setMute(mute) {
		this.audio.muted = !!mute;
		return this;
	}

	getMute() {
		return this.audio.muted;
	}

}

export default Core;
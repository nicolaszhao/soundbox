import _ from 'lodash';
import Events from 'events-trigger';
import Core from './core';

let id = 0;

const uniqueId = function(prefix) {
	id++;
	return prefix ? `${prefix}-${id}` : id;
};

const time2str = function(time) {
	let floor = Math.floor,
		r = [],
		hour, minute, pad, second;

	time = Math.round(time);
	hour = floor(time / 3600);
	minute = floor((time - 3600 * hour) / 60);
	second = time % 60;

	pad = function(source, length) {
		let nagative, pre, str;

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

class Song extends Events {
	constructor(options) {
		super();

		options = Object.assign({
			volume: 100,
			muted: false
		}, options);

		this.id = uniqueId('song');
		this.url = options.url;
		this.volume = options.volume;
		this.muted = options.muted;
		this.startTime = options.startTime || 0;
		this.endTime = options.endTime || 0;
		this.duration = 0;
	}

	setVolume(volume) {
		this.volume = volume;
	}

	setMute(muted) {
		this.muted = muted;
	}

	setDuration(duration) {
		this.duration = duration;
	}
}

class Engine extends Events {
	constructor() {
		super();

		this.core = new Core();
		this.list = [];
		this.cur = '';

		this.init();
	}

	init() {
		this.core
			.on('progress', (bufferedPercent) => {
				this.trigger(`progress.${this.cur}`, bufferedPercent);
			})
			.on('error', ({code}) => {
				let song = _.find(this.list, {id: this.cur}),
					message = `播放资源：${song.url}发生错误，
						错误码：${code}，请到这里：http://www.w3school.com.cn/tags/av_prop_error.asp查找相应的信息。`;

				this.trigger(`error.${this.cur}`, new Error(message));
			})
			.on('positionchange', (currentTime, playedPercent) => {
				let song = _.find(this.list, {id: this.cur});

				if (song.endTime && currentTime >= song.endTime) {
					return this.core.stop();
				}

				this.trigger(`positionchange.${this.cur}`, currentTime, playedPercent || 0);
			})
			.on('statechange', (state) => {
				this.trigger(`statechange.${this.cur}`, state);
			});
	}

	reset() {
		this.cur = '';
		this.list = [];
		return this;
	}

	destroy() {
		this.reset().off();
		this.core.destroy();
	}

	add(song) {
		song = new Song(song);

		this
			.on(`progress.${song.id}`, (bufferedPercent) => {
				song.trigger('progress', bufferedPercent);
			})
			.on(`error.${song.id}`, (err) => {
				song.trigger('error', err.message);
			})
			.on(`positionchange.${song.id}`, (currentTime, playedPercent) => {
				song.trigger('positionchange', currentTime, playedPercent);
			})
			.on(`statechange.${song.id}`, (state) => {
				song.trigger('statechange', state);
			});

		this.list.push(song);

		return song;
	}

	remove(song) {
		let len = this.list.length;

		while (len--) {
			if (song.id === this.list[len].id) {
				song.off();
				this.list.splice(len, 1);
				this.off('.' + song.id);
				break;
			}
		}
	}

	play(song) {
		let curSong,
			adjustCore = (song) => {
				this.core.setCurrentPosition(song.startTime)
					.setVolume(song.volume)
					.setMute(song.muted);
			};

		return new Promise((resolve) => {
			if (song.id === this.cur) {
				this.core.play();
				return resolve(song);
			}

			if (this.cur) {
				this.core.stop();
				curSong = _.find(this.list, {id: this.cur});
				if (song.url === curSong.url) {
					this.cur = song.id;
					song.setDuration(this.core.getTotalTime());
					adjustCore(song);

					this.core.play();
					return resolve(song);
				}
			}

			this.cur = song.id;
			this.core.setUrl(song.url)
				.then(() => {
					song.setDuration(this.core.getTotalTime());
					adjustCore(song);
					this.core.play();
					resolve(song);
				});
		});
	}

	pause() {
		this.core.pause();
	}

	setVolume(song, volume) {
		if (song.id === this.cur) {
			this.core.setVolume(volume);
		}

		song.setVolume(volume);
	}

	setMute(song, muted) {
		if (song.id === this.cur) {
			this.core.setMute(muted);
		}

		song.setMute(muted);
	}

	setPosition(song, time) {
		if (song.id === this.cur) {
			this.core.setCurrentPosition(time);
		}
	}

	// to: '00:00'
	formatTime(time) {
		return time2str(time);
	}
}

export {default as STATES} from './states';
export default Engine;
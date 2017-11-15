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

class Engine {
	constructor() {
		this.core = new Core();
		this.list = [];
		this.cur = '';

		this.init();
	}

	init() {
		this.core
			.on('progress', (bufferedPercent) => {
				let song = this.findSong(this.cur);
				if (song) {
					song.trigger('progress', bufferedPercent);
				}
			})
			.on('error', ({code}) => {
				let song = this.findSong(this.cur),
					message;

				if (song) {
					message = `播放资源：${song.url}发生错误，
						错误码：${code}，请到这里：http://www.w3school.com.cn/tags/av_prop_error.asp查找相应的信息。`;

					song.trigger('error', new Error(message));
				}
			})
			.on('positionchange', (currentTime, playedPercent) => {
				let song = this.findSong(this.cur);

				if (song) {
					if (song.endTime && currentTime >= song.endTime) {
						return this.core.stop();
					}

					song.trigger('positionchange', currentTime, playedPercent || 0);
				}
			})
			.on('statechange', (state) => {
				let song = this.findSong(this.cur);
				if (song) {
					song.trigger('statechange', state);
				}
			});
	}
  
  reset() {
	  let len = this.list.length;
	  
	  while (len--) {
	    this.list[len].off();
    }
    this.list = [];
    this.cur = '';
    
    return this;
  }

	destroy() {
		this.reset();
		this.core.destroy();
	}

	add(song) {
		song = new Song(song);
		this.list.push(song);
		return song;
	}
  
  remove(song) {
    let len = this.list.length;
    
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

	play(song) {
		let curSong,
			adjustCore = (song) => {
				song.setDuration(this.core.getTotalTime());
				this.core.setCurrentPosition(song.startTime)
					.setVolume(song.volume)
					.setMute(song.muted);
			};

		return new Promise((resolve) => {

      // 要播放的 song 是之前暂停的那个 song，直接 play 即可
			if (song.id === this.cur) {
				this.core.play();
				return resolve(song);
			}

      // 当引擎中已经有一个 song 时，需要先停止掉，但发现，接下来要播放的 song 的 url 跟当前的 song 是一样的，那么需要根据新的 song
      // 的属性调整下，然后再直接播放
			if (this.cur) {

				this.core.stop();
				curSong = this.list.find(n => n.id === this.cur);

				if (curSong && curSong.url === song.url) {
					this.cur = song.id;
					adjustCore(song);
					this.core.play();
					return resolve(song);
				}
			}

			this.cur = song.id;
			this.core.setUrl(song.url)
				.then(() => {
					adjustCore(song);
					this.core.play();
					resolve(song);
				});
		});
	}

	pause() {
		this.core.pause();
		return this;
	}

	setVolume(song, volume) {
		if (song.id === this.cur) {
			this.core.setVolume(volume);
		}

		song.setVolume(volume);
		return this;
	}

	setMute(song, muted) {
		if (song.id === this.cur) {
			this.core.setMute(muted);
		}

		song.setMute(muted);
		return this;
	}

	setPosition(song, time) {
		if (song.id === this.cur) {
			this.core.setCurrentPosition(time);
		}
		return this;
	}

	// to: '00:00'
	formatTime(time) {
		return time2str(time);
	}

	findSong(songId) {
		return this.list.find(n => n.id === songId);
	}
}

export {default as STATES} from './states';
export default Engine;
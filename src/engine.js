/* eslint-disable import/no-extraneous-dependencies */
import Events from '@totebox/events';
import { type } from '@totebox/util';
import STATES from './states';

class Engine extends Events {
  constructor() {
    super();
    const audio = new Audio();
    audio.preload = false;
    audio.autoplay = false;
    audio.loop = false;

    this.audio = audio;
    // 表示 audio 是否可播放，并且不会中断（表示已完全下载）
    this.canPlayThrough = false;
    this.init();
  }

  init() {
    const bufferedPercent = () => {
      const percent = this.getBufferedPercent();

      if (percent === 1) {
        this.canPlayThrough = true;
      }
      this.trigger('progress', percent);

      return percent;
    };

    this.eventHandlers = {
      // 当音频加载过程开始时
      loadstart: () => {
        const autoProgress = () => {
          this.progressTimer = setTimeout(() => {
            if (bufferedPercent() < 1) {
              autoProgress();
            }
          }, 50);
        };

        this.progressTimer && clearTimeout(this.progressTimer);
        this.canPlayThrough = false;
        autoProgress();
      },
      // 当当前帧的数据已加载，但没有足够的数据来播放音频，应该只处理音频的状态
      loadeddata: () => {
        this.setState(STATES.BUFFERING);
      },
      // 当正在下载音频时，清理 `loadstart` 中，轮询获取的缓冲进度
      progress: () => {
        this.progressTimer && clearTimeout(this.progressTimer);
        if (!this.canPlayThrough) {
          bufferedPercent();
        }
      },
      canplay: () => {
        this.trigger('canplay', { duration: this.getDuration() });
        // 播放已经加载成功，且是同一个音源时，audio 的 `progress` 不执行，需要手动触发 engine 的 `progress`
        if (this.canPlayThrough) {
          this.trigger('progress', 1);
        }
      },
      playing: () => {
        this.errorTimer && clearTimeout(this.errorTimer);
        this.setState(STATES.PLAYING);
      },
      error: () => {
        this.errorTimer && clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(() => this.trigger('error', this.audio.error), 1000);
      },
      ended: () => {
        this.setState(STATES.END);
      },
      waiting: () => {
        this.setState(STATES.PREBUFFER);
      },
      timeupdate: () => {
        const currentTime = this.getCurrentTime();
        this.trigger('timeupdate', currentTime, this.calcTimePercent(currentTime));
      },
    };

    Object.keys(this.eventHandlers).forEach((eventType) => {
      this.audio.addEventListener(eventType, this.eventHandlers[eventType], false);
    });
  }

  reset() {
    this.stop();
    this.setMute(false);
    this.setVolume(100);
    this.canPlayThrough = false;
    this.trigger('progress', 0);
    return this;
  }

  destroy() {
    this.reset();
    this.off();
    Object.keys(this.eventHandlers).forEach((eventType) => {
      this.audio.removeEventListener(eventType, this.eventHandlers[eventType], false);
    });
  }

  getBufferedPercent() {
    const { buffered } = this.audio;
    let { currentTime: bufferedTime } = this.audio;

    // buffered: 表示已下载的缓冲的时间范围的对象，可能包含多个缓冲块
    // 当用户操作进度条的位置时，接下来的缓冲就会从哪个点开始
    // 当用户不操作时，可以是个连续的缓冲块
    // 参考：https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/buffering_seeking_time_ranges
    if (buffered) {
      let bufferSize = buffered.length;
      while (bufferSize--) {
        // 当其中一个缓冲块包含了开始缓冲的起点位置，那么，该缓冲块的结束点认为是当前缓冲的时间
        if (buffered.start(bufferSize) <= bufferedTime
          && buffered.end(bufferSize) >= bufferedTime) {
          bufferedTime = buffered.end(bufferSize);
          break;
        }
      }
    }

    return this.calcTimePercent(bufferedTime);
  }

  calcTimePercent(time) {
    const duration = this.getDuration();
    return (time / duration).toFixed(2) * 1 || 0;
  }

  setState(state) {
    if (state === this.state) {
      return;
    }
    // 在音频已经在完全下载的情况下，仍然触发了 `loadeddata` 或 `waiting` 等事件时，忽略状态更新
    if (this.canPlayThrough && (state === STATES.PREBUFFER || state === STATES.BUFFERING)) {
      return;
    }

    this.state = state;
    this.trigger('statechange', state);
  }

  getState() {
    return this.state;
  }

  play(src) {
    if (src) {
      this.audio.src = src;
      this.audio.load();
    }
    this.audio.play().catch(() => {
      // ignore
    });
    return this;
  }

  pause() {
    this.audio.pause();
    this.setState(STATES.PAUSE);
    return this;
  }

  stop() {
    this.audio.pause();
    this.setCurrentTime(0);
    this.trigger('timeupdate', 0);
    this.setState(STATES.STOP);
    return this;
  }

  getDuration() {
    return this.audio.duration || 0;
  }

  getCurrentTime() {
    return this.audio.currentTime;
  }

  setCurrentTime(time) {
    try {
      this.audio.currentTime = time;
    } catch (err) {
      // ignore
    }
    return this;
  }

  getVolume() {
    return parseInt(this.audio.volume * 100, 10);
  }

  setVolume(volume) {
    if (type(volume) === 'number' && volume >= 0 && volume <= 100) {
      this.audio.volume = volume / 100;
    }
    return this;
  }

  getMute() {
    return this.audio.muted;
  }

  setMute(muted) {
    this.audio.muted = !!muted;
    return this;
  }
}

export default Engine;

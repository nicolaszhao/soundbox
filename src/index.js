import Engine from './engine';
import Sound from './sound';

class Soundbox {
  constructor() {
    this.sounds = [];
    this.currentSound = null;
    this.engine = this.createEngine();
  }

  createEngine() {
    const engine = new Engine();

    engine.on('progress', (bufferedPercent) => {
      if (this.currentSound) {
        this.currentSound.trigger('progress', bufferedPercent);
      }
    });

    engine.on('canplay', ({ duration }) => {
      if (this.currentSound) {
        this.engine.play();
        this.currentSound.set('duration', duration, { silent: true });
        this.currentSound.trigger('start', this.currentSound);
      }
    });

    engine.on('timeupdate', (currentTime, playedPercent) => {
      if (this.currentSound) {
        const { range: [, end] } = this.currentSound;
        if (end && currentTime >= end) {
          return engine.stop();
        }
        this.currentSound.setPosition(currentTime, { silent: true });
        this.currentSound.trigger('positionchange', currentTime, playedPercent);
      }
    });

    engine.on('statechange', (state) => {
      if (this.currentSound) {
        this.currentSound.trigger('statechange', state);
      }
    });

    engine.on('error', ({ code }) => {
      const sound = this.currentSound;
      if (sound && code) {
        // 参考：http://www.w3school.com.cn/tags/av_prop_error.asp
        const messages = {
          1: 'ABORTED',
          2: 'NETWORK ERROR',
          3: 'DECODE ERROR',
          4: 'SOURCE NOT SUPPORTED',
        };
        sound.trigger('error', new Error(messages[code] || `UNKNOWN ERROR, CODE: ${code}`));
      }
    });

    return engine;
  }

  createSound(soundData) {
    const sound = new Sound(soundData);

    sound.on('play', (target) => {
      // 把需要播放的 sound 的相关属性（volume, muted 等）更新到引擎
      this.setEngineAttrs(target);

      if (this.currentSound) {
        // 如果期望播放的和之前播放过的是同一个，说明引擎没有切换过音源（比如之前暂停了），可以直接播放
        if (target === this.currentSound) {
          this.engine.play();
          target.trigger('start', target);
          return;
        }

        // 如果要触发播放的 sound 不同，则始终应该停止引擎播放音源
        // 确保播放中的音源可以正常触发事件，比如: timeupdate, statechange 等
        this.engine.stop();

        // sound 不同，但音源相同，则直接更新当前播放的 sound 为 target，
        if (target.src === this.currentSound.src) {
          this.currentSound = target;
          this.engine.play();
          target.set('duration', this.engine.getDuration());
          target.trigger('start', target);
          return;
        }
      }

      // 新的音源，则需要重新加载引擎，当可播放时会触发引擎 `canplay` 事件
      this.currentSound = target;
      this.engine.load(target.src);
    });

    sound.on('pause', (target) => {
      if (target === this.currentSound) {
        this.engine.pause();
      }
    });

    sound.on('change:volume', (volume, target) => {
      if (target === this.currentSound) {
        this.engine.setVolume(volume);
      }
    });

    sound.on('change:muted', (muted, target) => {
      if (target === this.currentSound) {
        this.engine.setMute(muted);
      }
    });

    sound.on('change:currenttime', (currentTime, target) => {
      if (target === this.currentSound) {
        this.engine.setCurrentTime(currentTime);
      }
    });

    return sound;
  }

  reset() {
    this.sounds.forEach((sound) => sound.off());
    this.sounds = [];
    this.currentSound = null;
  }

  destroy() {
    this.reset();
    this.engine.destroy();
  }

  add(data) {
    const sound = this.createSound(data);
    this.sounds.push(sound);
    return sound;
  }

  remove(sound) {
    let delIndex = -1;
    this.sounds.forEach((n, i) => {
      if (sound.id === n.id) {
        if (sound.id === this.currentSound.id) {
          this.engine.stop();
        }
        sound.off();
        delIndex = i;
      }
    });
    if (delIndex !== -1) {
      this.sounds.splice(delIndex, 1);
    }
    return delIndex;
  }

  setEngineAttrs(sound) {
    const {
      range: [start], currentTime, volume, muted,
    } = sound;
    this.engine.setCurrentTime(start || currentTime)
      .setVolume(volume)
      .setMute(muted);
  }
}

export default Soundbox;

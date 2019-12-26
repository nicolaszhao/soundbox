/* eslint-disable import/no-extraneous-dependencies */
import Events from '@totebox/events';
import { type } from '@totebox/util';

let id = 0;

function uniqueId(prefix) {
  id++;
  return prefix ? `${prefix}-${id}` : id;
}

export default class Sound extends Events {
  constructor({
    src = '', volume = 100, muted = false, range = [0, 0],
  }) {
    super();
    this.id = uniqueId('sound');
    this.src = src;
    this.volume = volume;
    this.muted = muted;
    this.range = range;
    this.duration = 0;
    this.currentTime = 0;
    this.initEvents();
  }

  initEvents() {
    'play pause'.split(' ').forEach((eventType) => {
      this[eventType] = () => {
        this.trigger(eventType, this);
      };
    });
  }

  // options: { silent[Boolean] }
  set(attr, value, options) {
    const modifiableAttrs = 'volume muted duration currentTime'.split(' ');
    const setAttr = (name, val) => {
      if (modifiableAttrs.includes(name) && type(val) !== 'undefined' && this[name] !== val) {
        this[name] = val;
        !options.silent && this.trigger(`change:${name.toLowerCase()}`, val, this);
      }
    };

    if (type(value) === 'object') {
      options = value;
      value = undefined;
    }
    if (!options) {
      options = {};
    }

    if (type(attr) === 'string') {
      setAttr(attr, value);
    } else if (type(attr) === 'object') {
      Object.keys(attr).forEach((name) => setAttr(name, attr[name]));
    }
  }

  // options 一般在 Soundbox 引擎的 `timeupdate` 事件中设置（为了避免循环事件触发）。外部通常不传递
  setPosition(time, options) {
    this.duration && this.set('currentTime', time, options);
  }

  setMute(muted) {
    this.set('muted', !!muted);
  }

  setVolume(volume) {
    this.set('volume', +volume || 0);
  }
}

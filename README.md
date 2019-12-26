# @nicolaz/soundbox

HTML5 Audio 的高级封装，并拥有可添加和控制多个音频的能力。

## 快速上手

### 安装

```
npm i @nicolaz/soundbox
```

### 使用

```js
import Soundbox from '@nicolaz/soundbox';

const soundbox = new Soundbox();
const sound = soundbox.add({ src: /*AUDIO_URL*/ });
sound.play();
```

## API

### Soundbox

#### add( soundData )

**soundData:** [Object]

音频数据，比如：

```
{
  src: "...",
  volume: 50,
}
```

执行 `add` 方法后，返回一个 `sound` 对象。

#### remove( sound )

**sound:** [Sound]

通过 `add` 方法生成的对象。删除成功，返回 `soundbox` 中音频对象列表的索引，否则返回 `-1`。

#### reset()

重置 `soundbox`，这会清理所有 `add` 的 `sound`。

#### destroy()

`soundbox` 不再使用，调用后 `soundbox` 不再工作。如你要重新使用，需要重新 `new` 一个实例。

### Sound

通过 `soundbox.add` 返回的对象，执行 `soundbox.add` 时，可传入如下属性：

* **src:** 音频地址
* **volume:** 音频音量
* **muted:** 音频是否静音
* **range[Array]:** 包含 2 个时间值的数组 `[start, end]`，表示一个音频在时间轴上可播放的范围

#### play()

非同一个 `sound` 执行 `play`，会触发 `start` 事件

#### pause()

非播放中的 `sound` 执行无效

#### setPosition( time )

**time:** [Number]|秒

设置播放进度，如果为当前播放音频，会触发 `positionchange` 事件。没 `play` 过的 `sound` 执行无效，你也不应该为非播放中的 `sound` 设置播放进度，可在外部通过 `state` 来判断处理。

#### setMute( muted )

**muted:** [Boolean]

设置是否静音

#### setVolume( volume )

**volume:** [Number]|0-100

### Sound Events

通过 `sound` 对象的 `on(type, handler)` 方法绑定

#### progress

缓冲进度变化时触发

**handler( bufferedProgress )** 

**bufferedProgress:** [Number]|0-1

#### start

新音频/音频切换，并开始播放时触发

**handler( data )**

**data:** [Object]|{ duration }

#### statechange

音频状态更新时触发

**handler( state )**

**state:** [String]

见下方的 `STATES`

#### positionchange

音频时间进度更改时触发

**handler( currentTime, playedProgress )**

**currentTime:** [Number]

当前播放的时间

**playedProgress:** [Number]|0-1

#### error

音频播放错误时触发

**handler( Error )**

### STATES

直接从安装包导入:

```js
import { STATES } from '@nicolaz/soundbox'
```

`STATES` 包含以下属性：

* `PREBUFFER`: 'waiting'

* `BUFFERING`: 'loadeddata'

* `PLAYING`: 'playing'

* `PAUSE`: 'pause'

* `STOP`: 'suspend'

* `END`: 'ended'

## Demo

这里有一个 React 组件的示例：[Demo](./demo.js)

## LICENSE

[MIT](https://github.com/nicolaszhao/soundbox/blob/master/LICENSE) © [nicolaszhao](https://github.com/nicolaszhao)


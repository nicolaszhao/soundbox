# @nicolaz/soundbox

HTML5 Audio的高级封装API对象。提供了可在React，Angular等组件化的框架中灵活调用的API。源码使用最流行的ES6语法编写，如果你要修改代码，
请clone到本地后，自行`npm install`，然后运行`npm run build:dev`打包即可。

## 快速上手
1. 使用[npm](https://docs.npmjs.com)安装到你的项目中：`npm install --save audio-engine`

2. 使用commonjs或者es6模块方式导入：
    ````
    var AudioEngine = require('audio-engine');
    //
    // 或者
    import AudioEngine from 'audio-engine';
    ````

3. 实例化对象，并创建一首歌曲对象来播放：
    ````
    // 在组件构造函数外实例化对象
    let audioEngine = new AudioEngine();
    //
    // 在组件componentDidMount方法中创建song对象
    let song = audioEngine.add({url: 'your-music-url'});
    //
    // 在组件的handler事件中播放song对象
    audioEngine.play(song);
    ````

## Engine的方法

* add(song)

    提供一个song对象需要的基本信息，创建一个song对象的实例。一般在组件生命周期创建时使用，比如React的componentDidMount方法。

    **song: (Object)**

    song实例对象需要的基本信息

    * url: (Sting), 必选， 播放资源的url
    * volume: (Number)，可选，默认值`100`
    * muted: (Boolean)，可选，默认值`false`
    * startTime: (Number), 可选，默认值`0`
    * endTime: (Number), 可选，默认值`0`

* remove(song)

    删除队列中的song实例，删除后该song不能被用来播放和使用了。一般在组件的生命周期销毁前使用，比如React的componentWillUnmount方法

    **song: (Object)**

    通过`add(song)`方法创建的song实例

* play(song)

    播放歌曲

    **song: (Object)**

    通过`add(song)`方法创建的song实例

* pause()

    暂停当前播放的歌曲

* setVolume(song, volume)

    设置提供的song实例的音量，数据会独立保存

    **song: (Object)**

    通过`add(song)`方法创建的song实例

    **volume: (Number)**

    歌曲音量值，数值范围在0 - 100间

* setMute(song, muted)

    设置提供的song实例的静音状态，数据会独立保存

    **song: (Object)**

    通过`add(song)`方法创建的song实例

    **muted: (Boolean)**

    是否设置为静音的值

* setPosition(song, time)

    设置提供的song实例的播放进度，一般用于用户手动改变进度条时调用该方法。

    **song: (Object)**

    通过`add(song)`方法创建的song实例

    **time: (Number)**

    歌曲进度的时间，时间单位为秒


* formatTime(time)

    格式化时间为"00:00"格式的字符串

    **time: (Number)**

    歌曲时间，时间单位为秒

* reset()

    重置engine对象到最初状态，删除song队列的所有实例

* destroy()

    彻底销毁engine对象的使用，删除属性core的事件绑定，调用该方法后，engine对象不能再使用，除非重新实例化

## Song的事件类型

* progress: handler(bufferedPercent)

    资源缓冲进度时触发。

    **bufferedPercent: (Number)**

    缓冲进度百分比值，数值范围为0 - 1

* error: handler(Error)

    资源播放发生错误时触发

    **Error: (Error Object)**

    发生错误时会返回详细的错误信息，包括错误码

* positionchange: handler(currentTime, playedPercent)

    资源播放进度发生变化时触发

    **currentTime: (Number)**

    当前播放的时间，时间单位为秒

    **playedPercent: (Number)**

    播放进度百分比值，数值范围为0 - 1

* statechange: handler(state)

    资源播放状态发生变化时触发，比如playing, pause, buffering等

    **state: (String)**

    资源播放状态，可选值：Engine.PREBUFFER, Engine.BUFFERING, Engine.PLAYING, Engine.PAUSE, Engine.STOP, Engine.END

## React组件使用示例

1. 实例化Engine：`let audioEngine = new AudioEngine()`

2. 组件构造器中定义state：
    ````
    constructor(props) {
        super(props);

        this.state = {
            paused: true,
            buffering: false,
            progress: 0,
            buffered: 0,
            currentTime: 0,
            duration: 0,
        };

        this.song = null;
    }
    ````

3. 创建song实例：
    ````
    componentDidMount() {
        let { src } = this.props;

        this.song = audioEngine.add({
            url: src
        });

        this.song
            .on('progress', (bufferedPercent) => {
                this.setState({
                    buffered: bufferedPercent * 100
                });
            })
            .on('error', (err) => {
                this.setState({
                    errorMessage: err.message
                });
            })
            .on('positionchange', (currentTime, playedPercent) => {
                this.setState({
                    progress: playedPercent * 100,
                    currentTime: currentTime
                });
            })
            .on('statechange', (state) => {
                let buffering = false,
                    paused = true;

                if (state === STATES.BUFFERING || state === STATES.PREBUFFER) {
                    buffering = true;
                } else if (state === STATES.PLAYING) {
                    paused = false;
                }

                this.setState({
                    buffering,
                    paused
                });
            });
    }
    ````

4. 播放暂停状态切换：
    ````
    handlePlay() {
        if (this.state.paused) {
            audioEngine.play(this.song)
                .then((song) => {
                    this.setState({
                        duration: song.duration
                    });
                });
        } else {
            audioEngine.pause();
        }
    }
    ````

5. render方法中渲染：
    ````
    render() {
        let { buffered, progress, paused, currentTime, duration, buffering } = this.state,

            iconType = paused ? 'play-circle-o' : 'pause-circle-o';

        let wrapperClassName = ['audio-player'];

        if (buffering) {
            wrapperClassName.push('audio-player-state-buffering');
        }

        currentTime = audioEngine.formatTime(currentTime);
        duration = audioEngine.formatTime(duration);

        return (
            <div className={wrapperClassName.join(' ')}>
                <div className="audio-player-wrapper">
                    <button className="audio-player-button audio-player-button-play" onClick={() => {this.handlePlay()}}>
                        <Icon type={iconType} />
                        <Icon type="loading" />
                    </button>
                    <div className="audio-player-progressbar">
                        <div className="audio-player-progressbar-playing-value" style={{width: `${progress}%`}}></div>
                        <div className="audio-player-progressbar-buffering-value" style={{width: `${buffered}%`}}></div>
                    </div>
                    <div className="audio-player-duration">
                        <span className="audio-player-duration-current">{currentTime}</span>
                        <span className="audio-player-duration-total">{duration}</span>
                    </div>
                </div>
            </div>
        );
    }
    ````

6. 销毁song实例：
    ````
    componentWillUnmount() {
        audioEngine.remove(this.song);
    }
    ````

import React, { useState, useEffect, useRef } from 'react';
import Soundbox, { STATES } from '@nicolaz/soundbox';
import { formatTime } from '@totebox/util';

// 如果是一个音频列表组件，可将 Soundbox 实例化放在上层，并通过 props 传入
const soundbox = new Soundbox();

export default function Audio({ src, onPlaying, onError }) {
  const progressRef = useRef();
  const [paused, setPaused] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [played, setPlayed] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sound, setSound] = useState(null);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const sound = soundbox.add({ src });
    sound
      .on('progress', (bufferedProgress) => {
        setBuffered(bufferedProgress * 100);
      })
      .on('start', ({ duration }) => {
        setDuration(duration);
      })
      .on('positionchange', (currentTime, playedProgress) => {
        setCurrentTime(currentTime);
        setPlayed(playedProgress * 100);
      })
      .on('statechange', (state) => {
        setBuffering(state === STATES.BUFFERING || state === STATES.PREBUFFER);
        setPaused(state !== STATES.PLAYING);
        if (state === STATES.PLAYING) {
          onPlaying();
        }
      })
      .on('error', (err) => {
        onError(err);
      });

    setSound(sound);
    return () => soundbox.remove(sound);
  }, [src]);

  function handleProgressClick(e) {
    if (sound && !paused) {
      const value = (e.nativeEvent.offsetX / progressRef.current.offsetWidth).toFixed(2) * 1;
      sound.setPosition(Math.floor(value * duration));
    }
  }

  function handleVolumeChange({ target }) {
    if (sound) {
      setVolume(target.value)
      sound.setVolume(target.value);
    }
  }

  function handleMutedChange() {
    if (sound) {
      setMuted(!muted);
      sound.setMute(!muted);
    }
  }

  return (
    <div className="audio">
      <button className="audio-button" onClick={() => paused ? sound.play() : sound.pause()}>
        {buffering ? '...' : (paused ? '|>' : '||')}
      </button>
      <div className="audio-duration">
        {formatTime((duration - currentTime) * 1000)}
      </div>
      <div className="audio-progressbar" ref={progressRef} onClick={handleProgressClick}>
        <span style={{ width: `${buffered}%` }}></span>
        <span style={{ width: `${played}%` }}></span>
      </div>
      <input type="range" value={volume} onChange={handleVolumeChange} />
      <span onClick={handleMutedChange}>静音</span>
    </div>
  );
}

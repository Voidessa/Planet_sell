import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import backgroundMusic from '../assets/instupendo - comfort chain (slowed) (1).mp3';

const AmbientAudio = () => {
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true);
  const audioCtxRef = useRef(null);
  const audioRef = useRef(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;

    // Create AudioContext for SFX
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Define global SFX function on window object
    window.playCosmosSFX = (type) => {
      if (ctx.state === 'suspended' || mutedRef.current) return;
      
      try {
        const sfxGain = ctx.createGain();
        sfxGain.connect(ctx.destination);

        if (type === 'click') {
          // Soft sci-fi coordinate ping
          sfxGain.gain.setValueAtTime(0, ctx.currentTime);
          sfxGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.005);
          sfxGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(960, ctx.currentTime); // high pitch
          osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.3); // sweep down
          osc.connect(sfxGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } else if (type === 'purchase') {
          // Melodic golden stardust chime cascade
          const frequencies = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6 (Cmaj7 arpeggio)
          frequencies.forEach((freq, index) => {
            const timeOffset = index * 0.1;
            const singleGain = ctx.createGain();
            singleGain.connect(ctx.destination);
            singleGain.gain.setValueAtTime(0, ctx.currentTime + timeOffset);
            singleGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + timeOffset + 0.015);
            singleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + 1.0);

            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
            
            // Subtle vibrato
            const vibrato = ctx.createOscillator();
            vibrato.frequency.setValueAtTime(7, ctx.currentTime);
            const vibGain = ctx.createGain();
            vibGain.gain.setValueAtTime(6, ctx.currentTime);
            vibrato.connect(vibGain);
            vibGain.connect(osc.frequency);
            
            osc.connect(singleGain);
            vibrato.start(ctx.currentTime + timeOffset);
            osc.start(ctx.currentTime + timeOffset);
            osc.stop(ctx.currentTime + timeOffset + 1.0);
            vibrato.stop(ctx.currentTime + timeOffset + 1.0);
          });
        } else if (type === 'envelope') {
          // Opening seal: bandpass white noise sweep representing airlock decompression
          const bufferSize = ctx.sampleRate * 1.2; 
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noiseNode = ctx.createBufferSource();
          noiseNode.buffer = buffer;

          const bpFilter = ctx.createBiquadFilter();
          bpFilter.type = 'bandpass';
          bpFilter.frequency.setValueAtTime(250, ctx.currentTime);
          bpFilter.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.8);
          bpFilter.Q.setValueAtTime(2.5, ctx.currentTime);

          sfxGain.gain.setValueAtTime(0, ctx.currentTime);
          sfxGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.08);
          sfxGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

          noiseNode.connect(bpFilter);
          bpFilter.connect(sfxGain);
          
          noiseNode.start();
          noiseNode.stop(ctx.currentTime + 1.2);
        }
      } catch (err) {
        console.error("SFX playing failed", err);
      }
    };
  };

  const toggleMute = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(backgroundMusic);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // pleasant background volume
    }

    if (muted) {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
      setMuted(false);
      mutedRef.current = false;
      
      setTimeout(() => {
        if (window.playCosmosSFX) window.playCosmosSFX('click');
      }, 50);
    } else {
      audioRef.current.pause();
      setMuted(true);
      mutedRef.current = true;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch(e) {}
      }
    };
  }, []);

  return (
    <button 
      className={`nav-link-btn audio-toggle-btn ${!muted ? 'audio-active' : ''}`}
      onClick={toggleMute}
      title={muted ? "Включить космический эмбиент" : "Выключить звук"}
      style={{
        marginLeft: '8px',
        border: !muted ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
        background: !muted ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        boxShadow: 'none',
      }}
    >
      {!muted ? <Volume2 size={14} className="text-gold" /> : <VolumeX size={14} />}
      <span>{!muted ? "ЗВУК ВКЛ" : "ЗВУК ВЫКЛ"}</span>
    </button>
  );
};

export default AmbientAudio;

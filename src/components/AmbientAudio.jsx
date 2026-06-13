import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AmbientAudio = () => {
  const [muted, setMuted] = useState(true);
  const audioCtxRef = useRef(null);
  
  // Oscillators and nodes for background hum
  const humOscsRef = useRef([]);
  const humGainRef = useRef(null);
  const filterRef = useRef(null);
  const lfoRef = useRef(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;

    // Create AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Create nodes
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    humGainRef.current = masterGain;

    // Create a lowpass filter for the hum to keep it sub-bass
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(130, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);
    filter.connect(masterGain);
    filterRef.current = filter;

    // Oscillators for cosmic hum: detuned sawtooths and triangle at lower octaves (A1=55Hz, E2=82.4Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // Deep hum
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82.41, ctx.currentTime); // Harmonic fifth

    const osc3 = ctx.createOscillator();
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(55.25, ctx.currentTime); // Chorus beat

    // Connect oscillators to a pre-hum gain
    const humOscGain = ctx.createGain();
    humOscGain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc1.connect(humOscGain);
    osc2.connect(humOscGain);
    osc3.connect(humOscGain);
    humOscGain.connect(filter);

    // Create an LFO to modulate filter frequency (creates space wind sweeps)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12-second cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(35, ctx.currentTime); // swing filter frequency by +-35Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Start oscillators
    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    // Keep references to clean up
    humOscsRef.current = [osc1, osc2, osc3, lfo];
    lfoRef.current = lfo;

    // Define global SFX function on window object
    window.playCosmosSFX = (type) => {
      if (ctx.state === 'suspended' || masterGain.gain.value === 0) return;
      
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
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (muted) {
      // Fade in background hum
      humGainRef.current.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.0);
      setMuted(false);
      
      // Brief timeout to let the fade-in begin before playing the click
      setTimeout(() => {
        if (window.playCosmosSFX) window.playCosmosSFX('click');
      }, 50);
    } else {
      // Fade out background hum
      humGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setMuted(true);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up oscillators on unmount
      if (humOscsRef.current.length > 0) {
        humOscsRef.current.forEach(osc => {
          try {
            osc.stop();
          } catch(e) {}
        });
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

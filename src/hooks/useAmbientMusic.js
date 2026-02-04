import { useRef, useCallback, useEffect } from 'react';
import { getAudioContext } from './useSoundEffects';

export default function useAmbientMusic() {
    const ctxRef = useRef(null);
    const masterGainRef = useRef(null);
    const isPlayingRef = useRef(false);
    const volumeRef = useRef(0.15);
    const intervalRef = useRef(null);
    const activeNodesRef = useRef([]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            activeNodesRef.current.forEach(n => {
                try { n.osc.stop(); } catch (e) { }
            });
        };
    }, []);

    const playNote = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx || !isPlayingRef.current) return;

        // Use the custom noteBus if available, otherwise direct to master (fallback)
        const destination = ctx.noteBus || masterGainRef.current;
        if (!destination) return;

        // C Major Pentatonic: Calm, neutral, uplifting but spacious
        const frequencies = [
            130.81, 146.83, 164.81, 196.00, 220.00, // 3rd
            261.63, 293.66, 329.63, 392.00, 440.00, // 4th
            196.00 * 0.5 // Add low G for depth
        ];

        const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0;

        const panner = ctx.createStereoPanner();
        panner.pan.value = (Math.random() * 1.6) - 0.8; // Avoid hard L/R

        osc.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(destination);

        const now = ctx.currentTime;
        // Logic: Very slow attack (fade in) and release (fade out)
        // This avoids the "beeping" annoyance.
        const attack = 1.5 + Math.random() * 2.0;
        const sustain = 2.0 + Math.random() * 3.0;
        const release = 4.0 + Math.random() * 4.0;
        const peakVol = 0.2 + Math.random() * 0.1; // Variance in velocity

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(peakVol, now + attack);
        gainNode.gain.linearRampToValueAtTime(peakVol * 0.8, now + attack + sustain); // Slight decay during sustain
        gainNode.gain.linearRampToValueAtTime(0, now + attack + sustain + release);

        osc.start(now);
        osc.stop(now + attack + sustain + release + 1);

        activeNodesRef.current.push({ osc, gain: gainNode });

        // Self-cleanup
        setTimeout(() => {
            activeNodesRef.current = activeNodesRef.current.filter(n => n.osc !== osc);
        }, (attack + sustain + release + 2) * 1000);
    }, []);

    const customBufferRef = useRef(null);
    const customSourceRef = useRef(null);

    const stopCustomPlayback = () => {
        if (customSourceRef.current) {
            try { customSourceRef.current.stop(); } catch (e) { }
            customSourceRef.current.disconnect();
            customSourceRef.current = null;
        }
    };

    const playCustomLoop = () => {
        const ctx = ctxRef.current;
        if (!ctx || !customBufferRef.current || !isPlayingRef.current) return;

        stopCustomPlayback();

        const source = ctx.createBufferSource();
        source.buffer = customBufferRef.current;
        source.loop = true;

        // Connect to master gain (volume control)
        // Note: We bypass the "noteBus" delay effects for custom tracks usually, 
        // but if we want ducking/master volume, we connect to musicMaster.
        if (masterGainRef.current) {
            source.connect(masterGainRef.current);
        } else {
            source.connect(ctx.destination);
        }

        source.start();
        customSourceRef.current = source;
    };

    const setCustomBuffer = (buffer) => {
        // Stop whatever is playing
        stopCustomPlayback();
        if (intervalRef.current) clearInterval(intervalRef.current);

        customBufferRef.current = buffer;

        if (buffer) {
            // New track loaded
            if (isPlayingRef.current) {
                playCustomLoop();
            }
        } else {
            // Track removed, revert to generative if playing
            if (isPlayingRef.current) {
                startGenerativeLoop();
            }
        }
    };

    const startGenerativeLoop = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        // If we have a custom buffer, play that instead of generating notes
        if (customBufferRef.current) {
            playCustomLoop();
            return;
        }

        playNote(); // Start one immediately

        intervalRef.current = setInterval(() => {
            if (!isPlayingRef.current) return;
            // Density control: Don't let it get too messy
            if (activeNodesRef.current.length < 4) {
                // Random chance to play creates "spaces"
                if (Math.random() > 0.2) playNote();
            }
        }, 2000); // Check tick every 2s
    }, [playNote]);

    const initAudio = useCallback(() => {
        const ctx = getAudioContext();
        if (!ctx) return;
        ctxRef.current = ctx;

        // Prevent double wiring if already initialized
        if (ctx.noteBus) {
            // Already setup. 
        }

        // 1. Final Master Gain
        let musicMaster = ctx.musicMaster;
        if (!musicMaster) {
            musicMaster = ctx.createGain();
            musicMaster.gain.value = volumeRef.current;
            musicMaster.connect(ctx.destination);
            ctx.musicMaster = musicMaster;
        }
        masterGainRef.current = musicMaster;

        // 2. Note Bus
        let noteBus = ctx.noteBus;
        if (!noteBus) {
            noteBus = ctx.createGain();
            ctx.noteBus = noteBus;

            // 3. Filter Chain (Soften the tone)
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 800;
            lowpass.Q.value = 0.5;

            noteBus.connect(lowpass);

            // 4. Delay/Reverb Chain
            const delay = ctx.createDelay();
            delay.delayTime.value = 3.0;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.3;
            const wetGain = ctx.createGain();
            wetGain.gain.value = 0.4;

            // Routing
            lowpass.connect(delay);
            delay.connect(feedback);
            feedback.connect(delay);
            delay.connect(wetGain);
            wetGain.connect(musicMaster);

            lowpass.connect(musicMaster);
        }

        isPlayingRef.current = true;

        // If we have custom buffer, play that
        if (customBufferRef.current) {
            playCustomLoop();
        } else {
            startGenerativeLoop();
        }
    }, [startGenerativeLoop]);

    const setVolume = (level) => {
        volumeRef.current = level;
        if (masterGainRef.current && ctxRef.current) {
            masterGainRef.current.gain.setTargetAtTime(level, ctxRef.current.currentTime, 0.2);
        }
    };



    const toggle = () => {
        if (!ctxRef.current) {
            initAudio();
            if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
            return true;
        }

        if (ctxRef.current.state === 'running') {
            ctxRef.current.suspend();
            isPlayingRef.current = false;
            stopCustomPlayback(); // Ensure custom playback stops
            return false;
        } else {
            ctxRef.current.resume();
            isPlayingRef.current = true;
            // Restart loop if it was stuck
            startGenerativeLoop();
            return true;
        }
    };

    return { initAudio, toggle, setVolume, isPlaying: isPlayingRef, volumeRef, ctxRef, setCustomBuffer };
}

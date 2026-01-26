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

    const startGenerativeLoop = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
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
            // Already setup, just reconnect references
            // We can assume masterGainRef needs to be re-acquired or stored if we want to change volume
            // But for now, we just proceed. Ideally we store these on the ctx too or checks.
            // Actually, if it's already there, we might not have reference to the specific gain node to control specific ambient volume.
            // So we should probably check if WE created it.
            // For simplicity/robustness: if ctx.noteBus exists, we assume it's running.
        }

        // 1. Final Master Gain (Local to this hook? No, we share context)
        // PROBLEM: If we share context, we need our own volume control for music vs SFX.
        // Solution: Create a specific 'musicMaster' gain node.

        let musicMaster = ctx.musicMaster;
        if (!musicMaster) {
            musicMaster = ctx.createGain();
            musicMaster.gain.value = volumeRef.current;
            musicMaster.connect(ctx.destination);
            ctx.musicMaster = musicMaster; // Attach to context to survive re-renders
        }
        masterGainRef.current = musicMaster;

        // 2. Note Bus (Where notes go)
        let noteBus = ctx.noteBus;
        if (!noteBus) {
            noteBus = ctx.createGain();
            ctx.noteBus = noteBus;

            // 3. Delay/Reverb Chain (Space)
            const delay = ctx.createDelay();
            delay.delayTime.value = 3.0; // Very long, spacey delay
            const feedback = ctx.createGain();
            feedback.gain.value = 0.3; // Low feedback to avoid mud
            const wetGain = ctx.createGain();
            wetGain.gain.value = 0.3; // Mix level

            // Routing: Bus -> Delay -> Feedback -> Delay -> WetGain -> Master
            noteBus.connect(delay);
            delay.connect(feedback);
            feedback.connect(delay);
            delay.connect(wetGain);
            wetGain.connect(musicMaster);

            // Also route Dry signal: Bus -> Master
            noteBus.connect(musicMaster);
        }

        isPlayingRef.current = true;
        startGenerativeLoop();
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
            return false;
        } else {
            ctxRef.current.resume();
            isPlayingRef.current = true;
            // Restart loop if it was stuck
            startGenerativeLoop();
            return true;
        }
    };

    return { initAudio, toggle, setVolume, isPlaying: isPlayingRef, volumeRef };
}

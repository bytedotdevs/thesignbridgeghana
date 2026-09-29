/**
 * TextToSignAvatar — Text/Speech → 3D Avatar GSL Signing
 *
 * User types or speaks a sentence. The app looks up each word in the
 * GSL dictionary, builds a sign sequence, and plays it on a 3D skeletal
 * avatar rendered with Three.js.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Mic,
  MicOff,
  Type,
  Sparkles,
  RefreshCw,
  Volume2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { LiquidChromeButton } from '../common/LiquidChromeButton';
import { Badge } from '../common/Badge';
import { useDictionary } from '../../context/DictionaryContext';
import {
  buildAvatarRig,
  applyPoseToRig,
  buildSignSequence,
  interpolatePose,
  speakWord,
  NEUTRAL_POSE,
} from '../../services/avatarSigningService';
import type { AvatarRig, SignSequence } from '../../services/avatarSigningService';

const getNeutralPose = () => NEUTRAL_POSE;


const SAMPLE_SENTENCES = [

  'Hello welcome friend',
  'School family teacher',
  'Good morning Ghana',
  'Father mother children home',
  'Help doctor hospital',
  'Thank you brother sister',
];

export const TextToSignAvatar: React.FC = () => {
  const { searchIndex } = useDictionary();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rigRef = useRef<AvatarRig | null>(null);
  const rafRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const [inputText, setInputText] = useState('Hello welcome friend');
  const [signSequences, setSignSequences] = useState<SignSequence[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  const [frameLabel, setFrameLabel] = useState('');

  // Animation state
  const playStateRef = useRef({
    isPlaying: false,
    sequenceIdx: 0,
    frameIdx: 0,
    frameProgress: 0,
    lastTime: 0,
  });

  // ── Three.js Setup ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rig = buildAvatarRig(canvas);
    rigRef.current = rig;
    setCanvasReady(true);

    // Apply neutral pose
    applyPoseToRig(rig, getNeutralPose());

    // Idle breathing animation
    let t = 0;
    const idle = () => {
      if (!playStateRef.current.isPlaying) {
        t += 0.01;
        rig.skeleton.spine.position.y = Math.sin(t * 0.8) * 0.006;
        rig.skeleton.hips.rotation.y = Math.sin(t * 0.3) * 0.02;
      }
      rig.renderer.render(rig.scene, rig.camera);
      rafRef.current = requestAnimationFrame(idle);
    };
    idle();

    // Resize handler
    const onResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = Math.round(w * 0.56);
      rig.renderer.setSize(w, h, false);
      rig.camera.aspect = w / h;
      rig.camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rig.renderer.dispose();
    };
  }, []);

  // ── Check Speech Recognition Support ───────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // ── Compose Sign Sequence from Text ────────────────────────────────────
  const composeSequence = useCallback(
    (text: string) => {
      if (!searchIndex.length) return;
      const words = text
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
        .filter((w) => w.length > 0);

      const sequences: SignSequence[] = words.map((word) => {
        const norm = word.toLowerCase();
        const matched = searchIndex.find(
          (s) =>
            s.normalizedWord === norm ||
            s.primaryWord.toLowerCase() === norm ||
            s.synonyms.some((syn) => syn.toLowerCase() === norm)
        );
        return buildSignSequence(word, matched || null);
      });

      setSignSequences(sequences);
      setCurrentWordIdx(0);
      setIsPlaying(false);
      playStateRef.current = {
        isPlaying: false,
        sequenceIdx: 0,
        frameIdx: 0,
        frameProgress: 0,
        lastTime: 0,
      };

      // Reset pose
      if (rigRef.current) {
        applyPoseToRig(rigRef.current, getNeutralPose());
      }
    },
    [searchIndex]
  );

  // Auto-compose on mount when dictionary is ready
  useEffect(() => {
    if (searchIndex.length > 0) {
      composeSequence(inputText);
    }
  }, [searchIndex]);

  // ── Play Animation Loop ─────────────────────────────────────────────────
  const playAnimation = useCallback(() => {
    const ps = playStateRef.current;
    ps.isPlaying = true;
    ps.lastTime = performance.now();

    const animate = (now: number) => {
      if (!ps.isPlaying) return;
      const rig = rigRef.current;
      if (!rig) return;

      const dt = now - ps.lastTime;
      ps.lastTime = now;

      const seqs = signSequences;
      if (!seqs.length || ps.sequenceIdx >= seqs.length) {
        ps.isPlaying = false;
        setIsPlaying(false);
        setCurrentWordIdx(0);
        applyPoseToRig(rig, getNeutralPose());
        return;
      }

      const seq = seqs[ps.sequenceIdx];
      const frames = seq.frames;
      if (ps.frameIdx >= frames.length) {
        // Move to next word
        ps.sequenceIdx++;
        ps.frameIdx = 0;
        ps.frameProgress = 0;
        setCurrentWordIdx(ps.sequenceIdx);

        const nextSeq = seqs[ps.sequenceIdx];
        if (nextSeq && ttsEnabled) {
          speakWord(nextSeq.word);
        }
        requestAnimationFrame(animate);
        return;
      }

      const frame = frames[ps.frameIdx];
      ps.frameProgress += dt;
      setFrameLabel(frame.label);

      if (ps.frameProgress >= frame.duration) {
        ps.frameIdx++;
        ps.frameProgress = 0;
        requestAnimationFrame(animate);
        return;
      }

      // Interpolate between current and next frame
      const nextFrame = frames[Math.min(ps.frameIdx + 1, frames.length - 1)];
      const t = Math.min(ps.frameProgress / frame.duration, 1);
      const easedT = easeInOutCubic(t);
      const interpolated = interpolatePose(frame.pose, nextFrame.pose, easedT);
      applyPoseToRig(rig, interpolated);

      requestAnimationFrame(animate);
    };

    // Speak first word
    if (signSequences.length > 0 && ttsEnabled) {
      speakWord(signSequences[0].word);
    }

    requestAnimationFrame(animate);
  }, [signSequences, ttsEnabled]);

  const handlePlay = () => {
    if (isPlaying) {
      playStateRef.current.isPlaying = false;
      setIsPlaying(false);
      window.speechSynthesis?.cancel();
    } else {
      setIsPlaying(true);
      playAnimation();
    }
  };

  const handleRestart = () => {
    playStateRef.current = { isPlaying: false, sequenceIdx: 0, frameIdx: 0, frameProgress: 0, lastTime: 0 };
    setIsPlaying(false);
    setCurrentWordIdx(0);
    window.speechSynthesis?.cancel();
    if (rigRef.current) applyPoseToRig(rigRef.current, getNeutralPose());
  };

  const handlePrev = () => {
    const newIdx = Math.max(0, currentWordIdx - 1);
    setCurrentWordIdx(newIdx);
    playStateRef.current.sequenceIdx = newIdx;
    playStateRef.current.frameIdx = 0;
    playStateRef.current.frameProgress = 0;
  };

  const handleNext = () => {
    const newIdx = Math.min(signSequences.length - 1, currentWordIdx + 1);
    setCurrentWordIdx(newIdx);
    playStateRef.current.sequenceIdx = newIdx;
    playStateRef.current.frameIdx = 0;
    playStateRef.current.frameProgress = 0;
  };

  // ── Speech Recognition ──────────────────────────────────────────────────
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      composeSequence(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  const currentSequence = signSequences[currentWordIdx];
  const progress = signSequences.length > 0 ? ((currentWordIdx) / signSequences.length) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Input Area */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(220,230,245,0.8)',
          boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Type size={20} color="var(--brand-blue)" />
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Type or Speak → 3D Avatar Signs
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && composeSequence(inputText)}
            placeholder="Type words or a phrase to sign…"
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '12px 18px',
              borderRadius: '9999px',
              border: '1.5px solid rgba(200,215,235,0.9)',
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--ink-primary)',
              backgroundColor: '#f8fafc',
              outline: 'none',
            }}
          />
          {speechSupported && (
            <button
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Speak to sign'}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '48px', height: '48px', borderRadius: '9999px',
                backgroundColor: isListening ? '#ef4444' : 'rgba(37,99,235,0.1)',
                border: `1.5px solid ${isListening ? '#ef4444' : 'rgba(37,99,235,0.3)'}`,
                color: isListening ? '#ffffff' : 'var(--brand-blue)',
                cursor: 'pointer',
                animation: isListening ? 'pulse 1s infinite' : 'none',
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <LiquidChromeButton
            variant="primary"
            size="md"
            icon={<Sparkles size={16} />}
            onClick={() => composeSequence(inputText)}
          >
            Compose Signs
          </LiquidChromeButton>
        </div>

        {/* Sample phrases */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Samples:</span>
          {SAMPLE_SENTENCES.map((phrase, i) => (
            <button
              key={i}
              onClick={() => { setInputText(phrase); composeSequence(phrase); }}
              style={{
                fontSize: '12px', padding: '4px 10px', borderRadius: '9999px',
                backgroundColor: 'rgba(241,245,249,0.9)', border: '1px solid #cbd5e1',
                color: '#475569', cursor: 'pointer',
              }}
            >
              "{phrase.slice(0, 20)}{phrase.length > 20 ? '…' : ''}"
            </button>
          ))}
        </div>
      </div>

      {/* 3D Avatar Canvas */}
      <div
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(59,130,246,0.25)',
          boxShadow: '0 0 40px rgba(59,130,246,0.08)',
        }}
      >
        {/* Avatar Header */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 700 }}>
              GSL 3D Signing Avatar
            </span>
            <Badge variant="blue" size="sm">Three.js</Badge>
          </div>
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '9999px',
              backgroundColor: ttsEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${ttsEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.15)'}`,
              color: ttsEnabled ? '#86efac' : '#94a3b8',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Volume2 size={13} />
            {ttsEnabled ? 'Voice On' : 'Voice Off'}
          </button>
        </div>

        {/* Canvas */}
        <div style={{ position: 'relative', width: '100%' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', display: 'block', aspectRatio: '16/9', maxHeight: '480px' }}
          />

          {/* Current Word Overlay */}
          {currentSequence && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(59,130,246,0.4)',
                borderRadius: '14px',
                padding: '10px 20px',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }}>
                SIGNING
              </span>
              <span style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {currentSequence.word.toUpperCase()}
              </span>
              {currentSequence.sign && (
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                  {currentSequence.sign.category.split(',')[0]}
                </span>
              )}
              {!currentSequence.sign && (
                <span style={{ color: '#f59e0b', fontSize: '10px' }}>Fingerspelling</span>
              )}
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Progress Bar */}
          {signSequences.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div
                style={{
                  height: '4px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: '#3b82f6',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#475569' }}>
                <span>{currentWordIdx + 1} / {signSequences.length} words</span>
                <span>{frameLabel}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button onClick={handleRestart} title="Restart" style={controlBtnStyle}>
              <RefreshCw size={16} color="#94a3b8" />
            </button>
            <button onClick={handlePrev} disabled={currentWordIdx === 0} title="Previous word" style={controlBtnStyle}>
              <SkipBack size={18} color="#94a3b8" />
            </button>
            <button
              onClick={handlePlay}
              style={{
                ...controlBtnStyle,
                width: '52px',
                height: '52px',
                backgroundColor: '#3b82f6',
                border: '1px solid #2563eb',
              }}
            >
              {isPlaying ? <Pause size={22} color="#ffffff" /> : <Play size={22} color="#ffffff" />}
            </button>
            <button
              onClick={handleNext}
              disabled={currentWordIdx >= signSequences.length - 1}
              title="Next word"
              style={controlBtnStyle}
            >
              <SkipForward size={18} color="#94a3b8" />
            </button>
          </div>
        </div>
      </div>

      {/* Sign Sequence Playlist */}
      {signSequences.length > 0 && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(220,230,245,0.8)',
            boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={18} color="var(--brand-blue)" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              GSL Sign Playlist
            </span>
            <Badge variant="blue" size="sm">{signSequences.length} words</Badge>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
            }}
          >
            {signSequences.map((seq, i) => {
              const isActive = i === currentWordIdx;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentWordIdx(i);
                    playStateRef.current.sequenceIdx = i;
                    playStateRef.current.frameIdx = 0;
                    playStateRef.current.frameProgress = 0;
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '14px',
                    border: isActive ? '2px solid var(--brand-blue)' : '1.5px solid rgba(220,230,245,0.9)',
                    backgroundColor: isActive ? 'rgba(37,99,235,0.06)' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'var(--brand-blue)' : '#e2e8f0',
                      color: isActive ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>

                  {seq.sign?.image ? (
                    <img
                      src={seq.sign.image}
                      alt={seq.word}
                      style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        backgroundColor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        lineHeight: '1.3',
                      }}
                    >
                      A–Z<br />Finger
                    </div>
                  )}

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: isActive ? 'var(--brand-blue)' : 'var(--ink-primary)' }}>
                      {seq.word.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      {seq.sign ? seq.sign.category.split(',')[0].slice(0, 14) : 'Fingerspell'}
                    </div>
                  </div>

                  {isActive && (
                    <ChevronRight size={14} color="var(--brand-blue)" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

const controlBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '42px',
  height: '42px',
  borderRadius: '9999px',
  backgroundColor: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  cursor: 'pointer',
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}



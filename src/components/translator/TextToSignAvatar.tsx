/**
 * TextToSignAvatar — Text/Speech → 2D Skeletal Avatar GSL Signing
 *
 * User types or speaks a sentence. The app looks up each word in the
 * GSL dictionary, builds a sign sequence, and plays it on a 2D skeletal
 * canvas avatar that shows:
 *  - Full finger poses (all 5 fingers with MCP/PIP/DIP joints)
 *  - Realistic facial expressions (eyebrows, eyes, mouth)
 *  - Movement direction arrows (indicating hand motion direction)
 *  - Category-based animations mapped directly from the GSL dictionary
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
  Info,
  Hash,
  Check,
  CornerDownRight,
  Sliders,
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
  NUMBER_POSES,
} from '../../services/avatarSigningService';
import type { AvatarRig, SignSequence, SignPose2D } from '../../services/avatarSigningService';
import {
  resolveSentenceVocabularies,
  matchCloseVocabulary,
  parseNumberInput,
  type VocabularySuggestion,
} from '../../services/vocabularySuggestionService';

const getNeutralPose = () => NEUTRAL_POSE;

const GSL_NUMERAL_CHIPS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '30', '40', '50', '60', '70', '80', '90', '100', '1000',
];

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
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPoseRef = useRef<SignPose2D>(getNeutralPose());

  const [inputText, setInputText] = useState('Hello welcome friend');
  const [signSequences, setSignSequences] = useState<SignSequence[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [frameLabel, setFrameLabel] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const speedRef = useRef<number>(1.0);
  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  const [typoAlerts, setTypoAlerts] = useState<{ original: string; resolved: string; confidence: number }[]>([]);
  const [closeSuggestions, setCloseSuggestions] = useState<VocabularySuggestion[]>([]);

  // Animation state (ref to avoid stale closures)
  const playStateRef = useRef({
    isPlaying: false,
    sequenceIdx: 0,
    frameIdx: 0,
    frameProgress: 0,
    lastTime: 0,
  });
  const signSequencesRef = useRef<SignSequence[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    signSequencesRef.current = signSequences;
  }, [signSequences]);

  // ── 2D Canvas Setup ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = Math.max(parent.clientWidth, 300);
      // Clean responsive height bounded for comfortable full-avatar desktop viewing
      const h = Math.min(Math.round(w * 0.56), 460);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width  = w;
      canvas.height = h;

      // Rebuild rig with new dimensions
      const rig = buildAvatarRig(canvas);
      rigRef.current = rig;
      applyPoseToRig(rig, currentPoseRef.current || getNeutralPose());
    };

    updateSize();

    // Idle breathing & blinking animation that respects the current held sign pose
    let t = 0;
    const idle = () => {
      if (!playStateRef.current.isPlaying && rigRef.current) {
        t += 0.016;
        const basePose = currentPoseRef.current || getNeutralPose();
        const breathPose: SignPose2D = {
          ...basePose,
          torsoBend: (basePose.torsoBend || 0) + Math.sin(t * 0.8) * 0.008,
        };
        applyPoseToRig(rigRef.current, breathPose);
      }
      rafRef.current = requestAnimationFrame(idle);
    };
    idle();

    const ro = new ResizeObserver(updateSize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Speech Recognition Support ──────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // ── Compose Sign Sequence from Text (Typo & Context Aware) ──────────────
  const composeSequence = useCallback(
    (text: string) => {
      if (!searchIndex.length) return;
      const { words: resolvedWords, allSuggestions } = resolveSentenceVocabularies(text, searchIndex);

      const detectedTypos = resolvedWords
        .filter((w) => w.isTypo && w.resolved)
        .map((w) => ({
          original: w.original,
          resolved: w.resolved!.primaryWord,
          confidence: Math.round(0.85 * 100),
        }));

      setTypoAlerts(detectedTypos);
      setCloseSuggestions(allSuggestions);

      const sequences: SignSequence[] = resolvedWords.map((rw) => {
        return buildSignSequence(rw.original, rw.resolved, searchIndex);
      });

      setSignSequences(sequences);
      signSequencesRef.current = sequences;
      setCurrentWordIdx(0);
      setIsPlaying(false);
      playStateRef.current = {
        isPlaying: false,
        sequenceIdx: 0,
        frameIdx: 0,
        frameProgress: 0,
        lastTime: 0,
      };

      // Set initial preview pose to frame 1 of first word (the sign itself)
      const previewPose = sequences[0]?.frames[1]?.pose || sequences[0]?.frames[0]?.pose || getNeutralPose();
      currentPoseRef.current = previewPose;
      if (rigRef.current) {
        applyPoseToRig(rigRef.current, previewPose);
      }
    },
    [searchIndex]
  );

  // Auto-compose on mount when dictionary is ready
  useEffect(() => {
    if (searchIndex.length > 0) {
      composeSequence(inputText);
    }
  }, [searchIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Play Animation Loop ──────────────────────────────────────────────────
  const playAnimation = useCallback(() => {
    const ps = playStateRef.current;
    ps.isPlaying = true;
    ps.lastTime = performance.now();

    const animate = (now: number) => {
      if (!ps.isPlaying) return;
      const rig = rigRef.current;
      if (!rig) return;

      const dt = (now - ps.lastTime) * (speedRef.current || 1.0);
      ps.lastTime = now;

      const seqs = signSequencesRef.current;
      if (!seqs.length || ps.sequenceIdx >= seqs.length) {
        ps.isPlaying = false;
        setIsPlaying(false);
        setCurrentWordIdx(0);
        // Return to neutral pose when finished
        currentPoseRef.current = getNeutralPose();
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
      currentPoseRef.current = interpolated;
      applyPoseToRig(rig, interpolated);

      requestAnimationFrame(animate);
    };

    // Speak first word
    if (signSequencesRef.current.length > 0 && ttsEnabled) {
      speakWord(signSequencesRef.current[0].word);
    }

    requestAnimationFrame(animate);
  }, [ttsEnabled]);

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
    currentPoseRef.current = getNeutralPose();
    if (rigRef.current) applyPoseToRig(rigRef.current, getNeutralPose());
  };

  const handlePrev = () => {
    const newIdx = Math.max(0, currentWordIdx - 1);
    setCurrentWordIdx(newIdx);
    playStateRef.current.sequenceIdx = newIdx;
    playStateRef.current.frameIdx = 0;
    playStateRef.current.frameProgress = 0;
    // Preview the first frame of the target sign
    if (rigRef.current && signSequences[newIdx]?.frames[1]) {
      currentPoseRef.current = signSequences[newIdx].frames[1].pose;
      applyPoseToRig(rigRef.current, signSequences[newIdx].frames[1].pose);
    }
  };

  const handleNext = () => {
    const newIdx = Math.min(signSequences.length - 1, currentWordIdx + 1);
    setCurrentWordIdx(newIdx);
    playStateRef.current.sequenceIdx = newIdx;
    playStateRef.current.frameIdx = 0;
    playStateRef.current.frameProgress = 0;
    if (rigRef.current && signSequences[newIdx]?.frames[1]) {
      currentPoseRef.current = signSequences[newIdx].frames[1].pose;
      applyPoseToRig(rigRef.current, signSequences[newIdx].frames[1].pose);
    }
  };

  // ── Speech Recognition ───────────────────────────────────────────────────
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

  const handleSelectAndPlay = (text: string) => {
    setInputText(text);
    composeSequence(text);
    setIsPlaying(true);
    requestAnimationFrame(() => {
      playAnimation();
    });
  };

  const currentSequence = signSequences[currentWordIdx];
  const progress =
    signSequences.length > 0 ? ((currentWordIdx) / signSequences.length) * 100 : 0;

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
            Type or Speak → 2D Avatar Signs
          </h3>
          <Badge variant="blue" size="sm">GSL Dictionary</Badge>
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
              onClick={() => handleSelectAndPlay(phrase)}
              style={{
                fontSize: '12px', padding: '4px 10px', borderRadius: '9999px',
                backgroundColor: 'rgba(241,245,249,0.9)', border: '1px solid #cbd5e1',
                color: '#475569', cursor: 'pointer',
              }}
            >
              "{phrase.slice(0, 22)}{phrase.length > 22 ? '…' : ''}"
            </button>
          ))}
        </div>

        {/* Typo & Context-Aware Auto Resolution Banner */}
        {typoAlerts.length > 0 && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="#d97706" />
              <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 700 }}>
                Typo Detected & Auto-Resolved:
              </span>
            </div>
            {typoAlerts.map((ta, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  backgroundColor: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #fcd34d',
                  color: '#b45309',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>"{ta.original}"</span>
                <CornerDownRight size={12} color="#d97706" />
                <strong>{ta.resolved.toUpperCase()}</strong>
                <span style={{ fontSize: '10px', color: '#059669', backgroundColor: '#ecfdf5', padding: '1px 4px', borderRadius: '4px' }}>
                  {ta.confidence}% match
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Close & Related Vocabulary Suggestions */}
        {closeSuggestions.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Related Signs:
            </span>
            {closeSuggestions.slice(0, 8).map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSelectAndPlay(sug.item.primaryWord)}
                title={`Confidence: ${Math.round(sug.similarity * 100)}% (${sug.item.category})`}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{sug.item.primaryWord}</span>
                <span style={{ fontSize: '9px', opacity: 0.75, color: '#3b82f6' }}>
                  {Math.round(sug.similarity * 100)}%
                </span>
              </button>
            ))}
          </div>
        )}

        {/* GSL Numbers Quick Strip (0–100, 1000) */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={14} color="#2563eb" />
              <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 700 }}>
                GSL Number Signs (Plates 13–14):
              </span>
              <Badge variant="blue" size="sm">0–1,000</Badge>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Click any number to sign instantly with authentic finger curls
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'thin',
            }}
          >
            {GSL_NUMERAL_CHIPS.map((numStr) => {
              const isSelected = inputText.trim() === numStr;
              return (
                <button
                  key={numStr}
                  onClick={() => handleSelectAndPlay(numStr)}
                  style={{
                    flexShrink: 0,
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#2563eb' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? '1.5px solid #1d4ed8' : '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {numStr}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2D Avatar Canvas */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: '#f0f4ff',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1.5px solid rgba(99,130,220,0.22)',
          boxShadow: '0 4px 32px rgba(30,60,180,0.10), 0 0 0 1px rgba(99,130,220,0.10)',
        }}
      >
        {/* Avatar Header */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(80,100,200,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: 700 }}>
              GSL Signing Avatar
            </span>
            <Badge variant="blue" size="sm">2D Skeletal</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
              <span>R.Arm</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', marginLeft: '4px' }} />
              <span>L.Arm</span>
            </div>
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '9999px',
                backgroundColor: ttsEnabled ? 'rgba(37,99,235,0.12)' : 'rgba(100,116,139,0.1)',
                border: `1px solid ${ttsEnabled ? 'rgba(37,99,235,0.3)' : 'rgba(100,116,139,0.2)'}`,
                color: ttsEnabled ? '#2563eb' : '#94a3b8',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Volume2 size={13} />
              {ttsEnabled ? 'Voice On' : 'Voice Off'}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ position: 'relative', width: '100%' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', display: 'block' }}
          />

          {/* Current Word Overlay */}
          {currentSequence && (
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255,255,255,0.92)',
                border: '1.5px solid rgba(37,99,235,0.25)',
                borderRadius: '14px',
                padding: '8px 18px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(30,60,180,0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                minWidth: '140px',
              }}
            >
              <span style={{ color: '#2563eb', fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em' }}>
                SIGNING
              </span>
              <span style={{ color: '#0f172a', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {currentSequence.word.toUpperCase()}
              </span>
              {parseNumberInput(currentSequence.word) !== null ? (
                <span style={{ color: '#2563eb', fontSize: '10px', fontWeight: 700 }}>
                  GSL Number · Plates 13–14
                </span>
              ) : currentSequence.sign ? (
                <span style={{ color: '#64748b', fontSize: '10px' }}>
                  {currentSequence.sign.category.split(',')[0]}
                </span>
              ) : (
                <span style={{ color: '#f59e0b', fontSize: '10px' }}>Fingerspelling</span>
              )}
            </div>
          )}

          {/* Dictionary image preview */}
          {currentSequence?.sign?.image && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(255,255,255,0.92)',
                borderRadius: '12px',
                border: '1.5px solid rgba(37,99,235,0.2)',
                padding: '6px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 12px rgba(30,60,180,0.08)',
              }}
            >
              <div style={{ fontSize: '9px', color: '#2563eb', fontWeight: 700, textAlign: 'center', marginBottom: '4px', letterSpacing: '0.08em' }}>
                REFERENCE
              </div>
              <img
                src={currentSequence.sign.image}
                alt={currentSequence.word}
                style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '6px' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(80,100,200,0.12)',
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Progress Bar */}
          {signSequences.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div
                style={{
                  height: '4px',
                  backgroundColor: 'rgba(37,99,235,0.12)',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                <span>{currentWordIdx + 1} / {signSequences.length} words</span>
                <span style={{ color: '#3b82f6' }}>{frameLabel}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            {/* Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(241,245,249,0.9)', padding: '4px 8px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Sliders size={13} color="#64748b" style={{ marginRight: '2px' }} />
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Speed:</span>
              {[0.75, 1.0, 1.25].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: playbackSpeed === spd ? '#2563eb' : 'transparent',
                    color: playbackSpeed === spd ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Playback Transport Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <button onClick={handleRestart} title="Restart" style={controlBtnStyle}>
                <RefreshCw size={16} color="#475569" />
              </button>
              <button onClick={handlePrev} disabled={currentWordIdx === 0} title="Previous word" style={controlBtnStyle}>
                <SkipBack size={18} color="#475569" />
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
                <SkipForward size={18} color="#475569" />
              </button>
            </div>

            {/* Word indicator */}
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
              {signSequences.length > 0 ? (
                <span>Word <strong>{currentWordIdx + 1}</strong> of {signSequences.length}</span>
              ) : (
                <span>Ready</span>
              )}
            </div>
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
                    // Preview pose
                    if (rigRef.current && seq.frames[1]) {
                      currentPoseRef.current = seq.frames[1].pose;
                      applyPoseToRig(rigRef.current, seq.frames[1].pose);
                    }
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
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                      }}
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

          {/* Info note */}
          <div style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: '#f0f9ff', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Info size={14} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '12px', color: '#0369a1', lineHeight: '1.5', margin: 0 }}>
              The 2D skeletal avatar renders finger poses, facial expressions and movement arrows derived from the GSL 3rd Edition dictionary. Colored arrows show hand motion direction as documented in the dictionary.
            </p>
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
  backgroundColor: 'rgba(37,99,235,0.08)',
  border: '1px solid rgba(37,99,235,0.16)',
  cursor: 'pointer',
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

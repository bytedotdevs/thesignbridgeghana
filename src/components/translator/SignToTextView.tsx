/**
 * SignToTextView — Real-time Camera → GSL Recognition → Text/Audio
 *
 * Uses webcam + gesture recognition service to detect GSL signs and
 * display recognized words as scrolling text + optional TTS narration.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Mic,
  MicOff,
  Shield,
  AlertCircle,
  Eye,
  Loader2,
  Volume2,
  VolumeX,
  Trash2,
  Copy,
  CheckCheck,
  Zap,
} from 'lucide-react';
import { LiquidChromeButton } from '../common/LiquidChromeButton';
import { Badge } from '../common/Badge';
import { useDictionary } from '../../context/DictionaryContext';
import { gestureRecognitionService, RecognitionResult, GestureFrame } from '../../services/gestureRecognitionService';

interface RecognizedWord {
  id: string;
  word: string;
  confidence: number;
  image: string | null;
  timestamp: number;
}

export const SignToTextView: React.FC = () => {
  const { searchIndex } = useDictionary();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [currentFrame, setCurrentFrame] = useState<GestureFrame | null>(null);
  const [recognizedWords, setRecognizedWords] = useState<RecognizedWord[]>([]);
  const [currentSign, setCurrentSign] = useState<RecognitionResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [copied, setCopied] = useState(false);

  // Initialize gesture recognition service
  useEffect(() => {
    if (searchIndex.length > 0) {
      gestureRecognitionService.initialize(searchIndex);
    }
  }, [searchIndex]);

  // Subscribe to recognition results
  useEffect(() => {
    const unsub1 = gestureRecognitionService.onRecognition((result) => {
      setCurrentSign(result);
      if (result.isNewWord) {
        const newWord: RecognizedWord = {
          id: `${Date.now()}-${Math.random()}`,
          word: result.word,
          confidence: result.confidence,
          image: result.matchedSign?.image || null,
          timestamp: result.timestamp,
        };
        setRecognizedWords((prev) => [...prev.slice(-19), newWord]);
        setTranscript((prev) => (prev ? `${prev} ${result.word}` : result.word));

        if (isTTSEnabled) {
          const utterance = new SpeechSynthesisUtterance(result.word);
          utterance.rate = 0.9;
          utterance.lang = 'en-US';
          window.speechSynthesis?.speak(utterance);
        }
      }
    });

    const unsub2 = gestureRecognitionService.onFrame((frame) => {
      setCurrentFrame(frame);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [isTTSEnabled]);

  // Canvas overlay: draw pose landmarks on top of video
  useEffect(() => {
    if (!isStreaming) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const draw = () => {
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        t += 0.04;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        if (currentFrame && isRecognizing) {
          // Draw right hand landmarks
          if (currentFrame.rightHand.length >= 21) {
            drawHandLandmarks(ctx, currentFrame.rightHand, canvas.width, canvas.height, '#3b82f6');
          }
          // Draw left hand landmarks
          if (currentFrame.leftHand.length >= 21) {
            drawHandLandmarks(ctx, currentFrame.leftHand, canvas.width, canvas.height, '#22c55e');
          }
          // Draw pose landmarks
          if (currentFrame.pose.length >= 33) {
            drawPoseLandmarks(ctx, currentFrame.pose, canvas.width, canvas.height);
          }
        } else if (isRecognizing) {
          // Simulated animated overlay
          drawSimulatedOverlay(ctx, cx, cy, t);
        }

        // HUD
        if (isRecognizing) {
          drawHUD(ctx, canvas, currentSign, t);
        }
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    animFrameRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [isStreaming, isRecognizing, currentFrame, currentSign]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permission in your browser settings.'
          : 'Could not access camera. Please check your camera is connected and not in use.'
      );
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    gestureRecognitionService.stopCamera();
    setIsStreaming(false);
    setIsRecognizing(false);
    setCurrentFrame(null);
    setCurrentSign(null);
  }, []);

  const startRecognition = async () => {
    if (!videoRef.current) return;
    setIsRecognizing(true);
    await gestureRecognitionService.startFromVideo(videoRef.current);
  };

  const stopRecognition = () => {
    gestureRecognitionService.stopCamera();
    setIsRecognizing(false);
    setCurrentFrame(null);
  };

  const toggleFacing = async () => {
    stopCamera();
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
    setTimeout(startCamera, 200);
  };

  const clearTranscript = () => {
    setRecognizedWords([]);
    setTranscript('');
    setCurrentSign(null);
  };

  const copyTranscript = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Camera Viewport */}
      <div
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.1)',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isRecognizing ? '#22c55e' : isStreaming ? '#f59e0b' : '#475569',
                boxShadow: isRecognizing ? '0 0 10px #22c55e' : 'none',
                animation: isRecognizing ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}>
              {isRecognizing ? 'Detecting GSL Signs' : isStreaming ? 'Camera Active — Press Detect' : 'GSL Sign-to-Text Camera'}
            </span>
            {isRecognizing && (
              <Badge variant="blue" size="sm" icon={<Zap size={12} />}>
                Live
              </Badge>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsTTSEnabled(!isTTSEnabled)}
              title={isTTSEnabled ? 'Mute voice readout' : 'Enable voice readout'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '9999px',
                backgroundColor: isTTSEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${isTTSEnabled ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`,
                color: isTTSEnabled ? '#86efac' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isTTSEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              {isTTSEnabled ? 'Voice On' : 'Voice Off'}
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '480px', backgroundColor: '#020617' }}>
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: isStreaming ? 'block' : 'none' }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              pointerEvents: 'none', display: isStreaming ? 'block' : 'none',
            }}
          />

          {/* Inactive Slate */}
          {!isStreaming && !error && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '32px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={36} color="#60a5fa" />
              </div>
              <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Sign Language Camera</h4>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7' }}>
                  Start your camera to detect Ghanaian Sign Language gestures in real-time. Signs will be recognized and translated to text.
                </p>
              </div>
              <LiquidChromeButton variant="primary" size="md" icon={<Camera size={16} />} onClick={startCamera}>
                Start Camera
              </LiquidChromeButton>
            </div>
          )}

          {/* Error Slate */}
          {error && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px', backgroundColor: 'rgba(15,23,42,0.95)' }}>
              <AlertCircle size={40} color="#ef4444" />
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>Camera Error</h4>
              <p style={{ color: '#cbd5e1', fontSize: '13px', textAlign: 'center', maxWidth: '360px' }}>{error}</p>
              <LiquidChromeButton variant="subtle" size="sm" onClick={startCamera}>Retry</LiquidChromeButton>
            </div>
          )}

          {/* Current Detection Overlay */}
          {isRecognizing && currentSign && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '12px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {currentSign.matchedSign?.image && (
                <img src={currentSign.matchedSign.image} alt={currentSign.word} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }} />
              )}
              <div>
                <div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 600 }}>Detected Sign</div>
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 800 }}>{currentSign.word}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>Confidence</div>
                <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: 700 }}>{Math.round(currentSign.confidence * 100)}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#0f172a',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isStreaming ? (
              <LiquidChromeButton variant="primary" size="sm" icon={<Camera size={15} />} onClick={startCamera}>
                Start Camera
              </LiquidChromeButton>
            ) : (
              <>
                {!isRecognizing ? (
                  <LiquidChromeButton variant="primary" size="sm" icon={<Eye size={15} />} onClick={startRecognition}>
                    Detect Signs
                  </LiquidChromeButton>
                ) : (
                  <LiquidChromeButton variant="subtle" size="sm" icon={<Loader2 size={15} />} onClick={stopRecognition}>
                    Stop Detection
                  </LiquidChromeButton>
                )}
                <button
                  onClick={toggleFacing}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '6px 12px', borderRadius: '9999px',
                    backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} /> Flip
                </button>
                <LiquidChromeButton variant="subtle" size="sm" icon={<CameraOff size={15} />} onClick={stopCamera}>
                  Stop
                </LiquidChromeButton>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
            <Shield size={13} color="#22c55e" />
            <span>All processing happens locally</span>
          </div>
        </div>
      </div>

      {/* Transcript Panel */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(220, 230, 245, 0.8)',
          boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(220,230,245,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)' }}>Recognition Transcript</span>
            {recognizedWords.length > 0 && (
              <Badge variant="blue" size="sm">{recognizedWords.length} signs</Badge>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={copyTranscript}
              disabled={!transcript}
              title="Copy transcript"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px', borderRadius: '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37,99,235,0.2)',
                color: 'var(--brand-blue)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                opacity: transcript ? 1 : 0.4,
              }}
            >
              {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={clearTranscript}
              title="Clear transcript"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px', borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {/* Transcript Text */}
        <div style={{ padding: '20px', minHeight: '80px' }}>
          {transcript ? (
            <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink-primary)', lineHeight: '1.6', letterSpacing: '-0.01em' }}>
              {transcript}
            </p>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
              Recognized signs will appear here as you sign in front of the camera…
            </p>
          )}
        </div>

        {/* Sign Cards Row */}
        {recognizedWords.length > 0 && (
          <div style={{ padding: '0 20px 20px 20px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '10px', minWidth: 'max-content' }}>
              {recognizedWords.slice(-10).map((rw) => (
                <div
                  key={rw.id}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '10px', borderRadius: '12px',
                    backgroundColor: '#f8fafc', border: '1px solid rgba(220,230,245,0.9)',
                    minWidth: '80px',
                  }}
                >
                  {rw.image ? (
                    <img src={rw.image} alt={rw.word} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>?</div>
                  )}
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-primary)', textAlign: 'center' }}>
                    {rw.word.length > 8 ? rw.word.slice(0, 8) + '…' : rw.word}
                  </span>
                  <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>
                    {Math.round(rw.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
};

// ── Canvas drawing helpers ────────────────────────────────────────────────

function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number; z: number }>,
  w: number,
  h: number,
  color: string
): void {
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17],
  ];

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;
  connections.forEach(([a, b]) => {
    const la = landmarks[a];
    const lb = landmarks[b];
    ctx.beginPath();
    ctx.moveTo(la.x * w, la.y * h);
    ctx.lineTo(lb.x * w, lb.y * h);
    ctx.stroke();
  });

  ctx.fillStyle = color;
  ctx.globalAlpha = 1;
  landmarks.forEach((lm) => {
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawPoseLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>,
  w: number,
  h: number
): void {
  const connections = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16]];
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7;
  connections.forEach(([a, b]) => {
    const la = landmarks[a];
    const lb = landmarks[b];
    if ((la.visibility || 0) < 0.5 || (lb.visibility || 0) < 0.5) return;
    ctx.beginPath();
    ctx.moveTo(la.x * w, la.y * h);
    ctx.lineTo(lb.x * w, lb.y * h);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
}

function drawSimulatedOverlay(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number
): void {
  // Animated tracking box
  const ox = Math.sin(t) * 12;
  const oy = Math.cos(t * 0.7) * 8;
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(cx - 95 + ox, cy - 110 + oy, 190, 210);
  ctx.setLineDash([]);

  // Wrist point
  ctx.fillStyle = '#f59e0b';
  [[cx - 60 + ox, cy - 50 + oy], [cx + 60 + ox, cy - 50 + oy]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Finger tips
  const tips = [
    [cx - 80 + ox, cy - 90 + oy], [cx - 50 + ox, cy - 105 + oy],
    [cx + ox, cy - 115 + oy], [cx + 50 + ox, cy - 105 + oy],
    [cx + 80 + ox, cy - 90 + oy],
  ];
  ctx.fillStyle = '#22c55e';
  tips.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentSign: RecognitionResult | null,
  _t: number
): void {
  // Top-left: status
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.beginPath();
  ctx.roundRect(8, 8, 180, 28, 8);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(20, 22, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
  ctx.fillText('GSL LIVE DETECTION', 30, 27);

  // Confidence bar (top-right corner)
  if (currentSign) {
    const barW = 120;
    const barX = canvas.width - barW - 12;
    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.beginPath();
    ctx.roundRect(barX, 8, barW, 28, 8);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(barX + 4, 12, (barW - 8) * currentSign.confidence, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`${Math.round(currentSign.confidence * 100)}% confidence`, barX + 6, 30);
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, Sparkles, Shield, AlertCircle, Eye } from 'lucide-react';
import { LiquidChromeButton } from '../common/LiquidChromeButton';
import { Badge } from '../common/Badge';

export const CameraView: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [isSimulatingTracking, setIsSimulatingTracking] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings to test the translation interface.'
          : 'Could not connect to camera device. Please verify your camera is connected.'
      );
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsStreaming(false);
  };

  const toggleFacing = () => {
    stopCamera();
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Landmark visualization effect
  useEffect(() => {
    if (!isStreaming) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isSimulatingTracking) {
          time += 0.05;
          const centerX = canvas.width / 2 + Math.sin(time) * 15;
          const centerY = canvas.height / 2 + Math.cos(time) * 10;

          // Draw hand tracking box
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(centerX - 90, centerY - 90, 180, 180);
          ctx.setLineDash([]);

          // Draw tracking joints/points
          const points = [
            { x: centerX - 60, y: centerY - 40 },
            { x: centerX - 30, y: centerY - 60 },
            { x: centerX, y: centerY - 70 },
            { x: centerX + 30, y: centerY - 50 },
            { x: centerX + 60, y: centerY - 20 },
            { x: centerX, y: centerY + 40 },
          ];

          ctx.fillStyle = '#f59e0b';
          points.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw HUD Label
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(centerX - 90, centerY - 125, 180, 26);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
          ctx.fillText('GSL POSE TRACKER', centerX - 80, centerY - 108);
        }
      }
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isStreaming, isSimulatingTracking]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid rgba(220, 230, 245, 0.8)',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Studio Header */}
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '9999px',
              backgroundColor: isStreaming ? '#22c55e' : '#64748b',
              boxShadow: isStreaming ? '0 0 10px #22c55e' : 'none',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>
            GSL Computer Vision Translation Studio
          </span>
          <Badge variant="ghana" size="sm">
            Architecture Shell
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isStreaming && (
            <button
              onClick={() => setIsSimulatingTracking(!isSimulatingTracking)}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: isSimulatingTracking ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                color: isSimulatingTracking ? '#93c5fd' : '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              {isSimulatingTracking ? 'Landmarks: Active' : 'Landmarks: Hidden'}
            </button>
          )}
        </div>
      </div>

      {/* Video Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          backgroundColor: '#020617',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isStreaming ? 'block' : 'none',
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: isStreaming ? 'block' : 'none',
          }}
        />

        {/* Inactive Camera Slate */}
        {!isStreaming && (
          <div
            style={{
              textAlign: 'center',
              padding: '30px',
              maxWidth: '460px',
              color: '#94a3b8',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Camera size={32} color="#60a5fa" />
            </div>
            <h4 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Real-time Camera Feed
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
              Start your webcam to test the GSL gesture input visualizer and landmark tracking framework. All processing occurs locally in your browser.
            </p>
            <LiquidChromeButton
              variant="primary"
              size="md"
              icon={<Camera size={16} />}
              onClick={startCamera}
            >
              Start Camera Stream
            </LiquidChromeButton>
          </div>
        )}

        {/* Error Slate */}
        {error && (
          <div
            style={{
              position: 'absolute',
              inset: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#ffffff',
            }}
          >
            <AlertCircle size={36} color="#ef4444" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              Camera Connection Notice
            </h4>
            <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '380px', marginBottom: '16px' }}>
              {error}
            </p>
            <LiquidChromeButton variant="subtle" size="sm" onClick={startCamera}>
              Retry Connection
            </LiquidChromeButton>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid rgba(220, 230, 245, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isStreaming ? (
            <LiquidChromeButton
              variant="subtle"
              size="sm"
              icon={<CameraOff size={15} />}
              onClick={stopCamera}
            >
              Stop Camera
            </LiquidChromeButton>
          ) : (
            <LiquidChromeButton
              variant="primary"
              size="sm"
              icon={<Camera size={15} />}
              onClick={startCamera}
            >
              Launch Camera
            </LiquidChromeButton>
          )}

          {isStreaming && (
            <button
              onClick={toggleFacing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              <span>Flip Camera</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
          <Shield size={14} color="#10b981" />
          <span>Local Camera Stream (Zero Data Transmitted)</span>
        </div>
      </div>
    </div>
  );
};

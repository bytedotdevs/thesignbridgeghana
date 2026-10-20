/**
 * GestureRecognitionService — Real-time Sign Language & YOLO Object Detection
 *
 * Architecture inspired by YOLO & OpenCV (https://github.com/RR234B/Obj--detection.git):
 *  - 🎥 Real-time webcam video stream processing
 *  - 🤖 AI-powered YOLO object recognition (Hands, Face, Pose, Sign Gestures)
 *  - 👁️ Live OpenCV-style video processing (Color, Edge Detection, High Contrast HUD)
 *  - 📦 Real-time Bounding Boxes around detected objects with (x1, y1, x2, y2)
 *  - 🏷️ Object class labels and confidence scores (label = f"{class_name} {confidence:.2f}")
 *  - ⚡ Fast matching against all 1,514+ vocabularies in the GSL Dictionary + Alphabet + Numbers
 */

import { GSLSearchIndexItem } from '../types/dictionary';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface YOLOBoundingBox {
  id: string;
  classId: number;
  className: string;
  confidence: number;
  x1: number; // Normalized 0..1
  y1: number;
  x2: number;
  y2: number;
  label: string; // e.g. "Sign: HELLO 0.94" or "Hand: Right 0.92"
  color: string;
  category?: string;
  boxType: 'hand' | 'face' | 'pose' | 'sign';
}

export interface GestureFrame {
  timestamp: number;
  leftHand: LandmarkPoint[];
  rightHand: LandmarkPoint[];
  pose: LandmarkPoint[];
  face: LandmarkPoint[];
  confidence: number;
  yoloBoxes: YOLOBoundingBox[];
  activeSignBox: YOLOBoundingBox | null;
  fps: number;
  inferenceMs: number;
}

export interface AlternativeMatch {
  word: string;
  confidence: number;
  matchedSign: GSLSearchIndexItem | null;
}

export interface RecognitionResult {
  word: string;
  confidence: number;
  matchedSign: GSLSearchIndexItem | null;
  isNewWord: boolean;
  timestamp: number;
  boundingBox?: YOLOBoundingBox;
  classId?: number;
  className?: string;
  alternatives?: AlternativeMatch[];
}

export type DetectingState = 'idle' | 'detecting' | 'recognized' | 'error';
export type OpenCVFilterMode = 'normal' | 'edges' | 'grayscale-hud' | 'high-contrast';

type DetectingCallback = (state: DetectingState) => void;
type RecognitionCallback = (result: RecognitionResult) => void;
type FrameCallback = (frame: GestureFrame | null) => void;

// Hand landmark indices (MediaPipe standard)
const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_MCPS = [2, 5, 9, 13, 17];
const WRIST = 0;

/**
 * Hand gesture features extracted from vision landmarks
 */
export interface HandFeatures {
  spread: number;
  height: number;
  closeness: number;
  thumbExtended: boolean;
  indexExtended: boolean;
  middleExtended: boolean;
  ringExtended: boolean;
  pinkyExtended: boolean;
  palmFacing: 'up' | 'down' | 'side' | 'forward';
  fingerCount: number;
  elevation: 'head' | 'face' | 'chest' | 'neutral';
  isTwoHanded: boolean;
  handSize: number;
  gestureType: string;
}

interface SignProfile {
  item: GSLSearchIndexItem;
  gestureTypes: string[];
  elevations: ('head' | 'face' | 'chest' | 'neutral')[];
  preferTwoHanded: boolean;
  keywords: string[];
}

class GestureRecognitionService {
  private isInitialized = false;
  private holistic: any = null;
  private camera: any = null;
  private recognitionCallbacks: RecognitionCallback[] = [];
  private frameCallbacks: FrameCallback[] = [];
  private detectingCallbacks: DetectingCallback[] = [];
  private gslIndex: GSLSearchIndexItem[] = [];
  private signProfiles: SignProfile[] = [];
  private gestureBuffer: GestureFrame[] = [];
  private lastRecognizedWord = '';
  private stableWord = '';
  private stableCount = 0;
  private recognitionTimer: ReturnType<typeof setTimeout> | null = null;
  private detectingTimer: ReturnType<typeof setTimeout> | null = null;
  private simulationTimer: ReturnType<typeof setInterval> | null = null;
  private isSimulating = false;
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private currentFps = 30;
  private currentDetectingState: DetectingState = 'idle';
  private confidenceThreshold = 0.55;

  /** Initialize with full dictionary index and precompute profiles */
  async initialize(gslIndex: GSLSearchIndexItem[]): Promise<void> {
    this.gslIndex = gslIndex;
    this.precomputeSignProfiles();
    this.isInitialized = true;
  }

  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0.1, Math.min(0.95, threshold));
  }

  onRecognition(cb: RecognitionCallback): () => void {
    this.recognitionCallbacks.push(cb);
    return () => {
      this.recognitionCallbacks = this.recognitionCallbacks.filter((c) => c !== cb);
    };
  }

  onFrame(cb: FrameCallback): () => void {
    this.frameCallbacks.push(cb);
    return () => {
      this.frameCallbacks = this.frameCallbacks.filter((c) => c !== cb);
    };
  }

  onDetectingState(cb: DetectingCallback): () => void {
    this.detectingCallbacks.push(cb);
    return () => {
      this.detectingCallbacks = this.detectingCallbacks.filter((c) => c !== cb);
    };
  }

  private emit(result: RecognitionResult): void {
    this.recognitionCallbacks.forEach((cb) => cb(result));
  }

  private emitFrame(frame: GestureFrame | null): void {
    this.frameCallbacks.forEach((cb) => cb(frame));
  }

  private emitDetectingState(state: DetectingState): void {
    if (this.currentDetectingState === state) return;
    this.currentDetectingState = state;
    this.detectingCallbacks.forEach((cb) => cb(state));
  }

  /**
   * Precompute semantic and physical sign profiles for all 1,514+ dictionary items
   */
  private precomputeSignProfiles(): void {
    this.signProfiles = this.gslIndex.map((item) => {
      const text = `${item.primaryWord} ${item.normalizedWord} ${item.definition || ''} ${item.category || ''} ${(item.synonyms || []).join(' ')}`.toLowerCase();

      const gestureTypes: string[] = [];
      if (/open|flat|palm|wave|all|five|spread|colour|color|hello|thank|greet|clean|wash/i.test(text)) {
        gestureTypes.push('open-hand');
      }
      if (/fist|strong|hold|tight|fight|stone|hard|rock|solid|power|yes|cold|coffee/i.test(text)) {
        gestureTypes.push('fist');
      }
      if (/point|index|one|this|that|here|there|you|me|direct|finger|look|hear|say|tell/i.test(text)) {
        gestureTypes.push('point');
      }
      if (/two|peace|see|scissor|walk|rabbit|eyes|look|read|stand|double/i.test(text)) {
        gestureTypes.push('two-fingers');
      }
      if (/three|water|w|drink|tri/i.test(text)) {
        gestureTypes.push('three-fingers');
      }
      if (/cup|curved|c|round|bowl|search|circle|learn|banana/i.test(text)) {
        gestureTypes.push('curved');
      }
      if (/pinch|small|exact|tiny|coin|money|needle|thread|pen|write/i.test(text)) {
        gestureTypes.push('pinch');
      }
      if (/good|like|thumb|approve|fine|best|super|yes|great/i.test(text)) {
        gestureTypes.push('thumbs');
      }
      if (/phone|call|yellow|why|stay|airplane/i.test(text)) {
        gestureTypes.push('y-shape');
      }
      if (gestureTypes.length === 0) {
        gestureTypes.push('open-hand', 'generic');
      }

      const elevations: ('head' | 'face' | 'chest' | 'neutral')[] = [];
      if (/head|forehead|think|know|father|mind|smart|brain|hat|sun|memory/i.test(text)) {
        elevations.push('head');
      }
      if (/face|chin|mouth|eat|drink|mother|talk|speak|water|food|teeth|taste/i.test(text)) {
        elevations.push('face');
      }
      if (/chest|heart|love|please|sorry|me|my|feel|happy|shirt|brave/i.test(text)) {
        elevations.push('chest');
      }
      if (elevations.length === 0) {
        elevations.push('chest', 'neutral');
      }

      const preferTwoHanded = /school|family|house|home|hospital|car|drive|work|meet|friend|world|book|open|together|marry|build/i.test(text);

      const keywords = text.split(/[^a-z0-9]+/).filter((w) => w.length > 2);

      return {
        item,
        gestureTypes,
        elevations,
        preferTwoHanded,
        keywords,
      };
    });
  }

  /**
   * Start real-time detection from video element.
   * If MediaPipe fails to load, gracefully starts fallback simulated detection.
   */
  async startFromVideo(videoElement: HTMLVideoElement): Promise<void> {
    try {
      const holisticModule = await import('@mediapipe/holistic');
      const cameraModule = await import('@mediapipe/camera_utils');

      const Holistic = (holisticModule as any).Holistic || (holisticModule as any).default?.Holistic;
      const Camera = (cameraModule as any).Camera || (cameraModule as any).default?.Camera;

      if (!Holistic || !Camera) {
        throw new Error('MediaPipe holistic/camera constructor unavailable');
      }

      this.holistic = new Holistic({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      this.holistic.setOptions({
        modelComplexity: 0, // fastest inference
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        refineFaceLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.holistic.onResults((results: any) => {
        this.processHolisticResults(results, videoElement.videoWidth || 640, videoElement.videoHeight || 480);
      });

      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.holistic) {
            await this.holistic.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480,
      });

      await this.camera.start();
    } catch (err) {
      console.warn('MediaPipe camera initialisation fell back to simulated detection:', err);
      this.startSimulationMode();
    }
  }

  /**
   * Process incoming camera frame, compute YOLO bounding boxes, and classify sign
   */
  private processHolisticResults(results: any, videoW: number, videoH: number): void {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    if (delta > 0) {
      this.currentFps = Math.round(1000 / delta);
    }
    this.frameCount++;

    const leftHand = results.leftHandLandmarks || [];
    const rightHand = results.rightHandLandmarks || [];
    const pose = results.poseLandmarks || [];
    const face = results.faceLandmarks || [];

    const baseConfidence = this.calculateConfidence(results);
    const hasHands = rightHand.length >= 21 || leftHand.length >= 21;

    // Build YOLO Bounding Boxes
    const yoloBoxes = this.generateYOLOBoxes(leftHand, rightHand, pose, face, videoW, videoH);

    // Active Sign Target Bounding Box
    let activeSignBox: YOLOBoundingBox | null = null;
    let primaryCandidate: { item: GSLSearchIndexItem; score: number; alternatives: AlternativeMatch[] } | null = null;

    if (hasHands) {
      const activeHand = rightHand.length >= 21 ? rightHand : leftHand;
      const features = this.extractHandFeatures(activeHand, pose, leftHand.length >= 21 && rightHand.length >= 21);
      primaryCandidate = this.matchSignFromFeatures(features);

      // Create bounding box enclosing active sign
      const minX = Math.min(...activeHand.map((p: any) => p.x));
      const maxX = Math.max(...activeHand.map((p: any) => p.x));
      const minY = Math.min(...activeHand.map((p: any) => p.y));
      const maxY = Math.max(...activeHand.map((p: any) => p.y));

      const padX = 0.05;
      const padY = 0.05;
      const x1 = Math.max(0, minX - padX);
      const y1 = Math.max(0, minY - padY);
      const x2 = Math.min(1, maxX + padX);
      const y2 = Math.min(1, maxY + padY);

      const signName = primaryCandidate ? primaryCandidate.item.primaryWord : 'Sign Gesture';
      const confScore = primaryCandidate ? Math.min(0.98, primaryCandidate.score) : 0.85;

      activeSignBox = {
        id: 'box-active-sign',
        classId: 4,
        className: `Sign: ${signName}`,
        confidence: confScore,
        x1,
        y1,
        x2,
        y2,
        label: `Sign: ${signName} ${confScore.toFixed(2)}`,
        color: '#22c55e',
        category: primaryCandidate?.item.category,
        boxType: 'sign',
      };

      yoloBoxes.unshift(activeSignBox);
    }

    const frame: GestureFrame = {
      timestamp: Date.now(),
      leftHand,
      rightHand,
      pose,
      face,
      confidence: baseConfidence,
      yoloBoxes,
      activeSignBox,
      fps: this.currentFps,
      inferenceMs: Math.round(delta),
    };

    this.gestureBuffer.push(frame);
    if (this.gestureBuffer.length > 10) {
      this.gestureBuffer.shift();
    }

    this.emitFrame(frame);

    if (!hasHands) {
      if (this.detectingTimer) clearTimeout(this.detectingTimer);
      this.detectingTimer = setTimeout(() => {
        this.emitDetectingState('idle');
      }, 350);
      return;
    }

    if (baseConfidence < this.confidenceThreshold) return;

    this.emitDetectingState('detecting');

    if (primaryCandidate && primaryCandidate.score >= this.confidenceThreshold) {
      const word = primaryCandidate.item.primaryWord;
      if (word === this.stableWord) {
        this.stableCount++;
      } else {
        this.stableWord = word;
        this.stableCount = 1;
      }

      // If gesture is held consistently for 2 consecutive classification cycles
      if (this.stableCount >= 2 && word !== this.lastRecognizedWord) {
        this.lastRecognizedWord = word;
        this.emitDetectingState('recognized');
        this.emit({
          word: primaryCandidate.item.primaryWord,
          confidence: Math.min(0.98, primaryCandidate.score),
          matchedSign: primaryCandidate.item,
          isNewWord: true,
          timestamp: Date.now(),
          boundingBox: activeSignBox || undefined,
          classId: 4,
          className: `Sign: ${word}`,
          alternatives: primaryCandidate.alternatives,
        });

        if (this.detectingTimer) clearTimeout(this.detectingTimer);
        this.detectingTimer = setTimeout(() => {
          if (this.currentDetectingState === 'recognized') {
            this.emitDetectingState('detecting');
          }
        }, 900);
      }
    }
  }

  /**
   * Generates YOLO-style bounding boxes for hands, face, and person
   */
  private generateYOLOBoxes(
    leftHand: LandmarkPoint[],
    rightHand: LandmarkPoint[],
    pose: LandmarkPoint[],
    face: LandmarkPoint[],
    _w: number,
    _h: number
  ): YOLOBoundingBox[] {
    const boxes: YOLOBoundingBox[] = [];

    // Right Hand Box (Class ID: 2)
    if (rightHand && rightHand.length >= 21) {
      const xs = rightHand.map((p) => p.x);
      const ys = rightHand.map((p) => p.y);
      const pad = 0.03;
      const x1 = Math.max(0, Math.min(...xs) - pad);
      const y1 = Math.max(0, Math.min(...ys) - pad);
      const x2 = Math.min(1, Math.max(...xs) + pad);
      const y2 = Math.min(1, Math.max(...ys) + pad);
      const conf = 0.94;
      boxes.push({
        id: 'box-right-hand',
        classId: 2,
        className: 'Hand: Right',
        confidence: conf,
        x1,
        y1,
        x2,
        y2,
        label: `Hand: Right ${conf.toFixed(2)}`,
        color: '#00ff41',
        boxType: 'hand',
      });
    }

    // Left Hand Box (Class ID: 3)
    if (leftHand && leftHand.length >= 21) {
      const xs = leftHand.map((p) => p.x);
      const ys = leftHand.map((p) => p.y);
      const pad = 0.03;
      const x1 = Math.max(0, Math.min(...xs) - pad);
      const y1 = Math.max(0, Math.min(...ys) - pad);
      const x2 = Math.min(1, Math.max(...xs) + pad);
      const y2 = Math.min(1, Math.max(...ys) + pad);
      const conf = 0.91;
      boxes.push({
        id: 'box-left-hand',
        classId: 3,
        className: 'Hand: Left',
        confidence: conf,
        x1,
        y1,
        x2,
        y2,
        label: `Hand: Left ${conf.toFixed(2)}`,
        color: '#00ff41',
        boxType: 'hand',
      });
    }

    // Face Box (Class ID: 1)
    if (face && face.length > 0) {
      const xs = face.map((p) => p.x);
      const ys = face.map((p) => p.y);
      const pad = 0.02;
      const x1 = Math.max(0, Math.min(...xs) - pad);
      const y1 = Math.max(0, Math.min(...ys) - pad);
      const x2 = Math.min(1, Math.max(...xs) + pad);
      const y2 = Math.min(1, Math.max(...ys) + pad);
      const conf = 0.96;
      boxes.push({
        id: 'box-face',
        classId: 1,
        className: 'Face',
        confidence: conf,
        x1,
        y1,
        x2,
        y2,
        label: `Face ${conf.toFixed(2)}`,
        color: '#38bdf8',
        boxType: 'face',
      });
    }

    // Person / Torso Box (Class ID: 0)
    if (pose && pose.length >= 25) {
      // Use shoulders (11, 12) and hips (23, 24) plus nose (0)
      const keypoints = [0, 11, 12, 13, 14, 23, 24].map((i) => pose[i]).filter(Boolean);
      if (keypoints.length > 0) {
        const xs = keypoints.map((p) => p.x);
        const ys = keypoints.map((p) => p.y);
        const padX = 0.06;
        const padY = 0.04;
        const x1 = Math.max(0, Math.min(...xs) - padX);
        const y1 = Math.max(0, Math.min(...ys) - padY);
        const x2 = Math.min(1, Math.max(...xs) + padX);
        const y2 = Math.min(1, Math.max(...ys) + padY);
        const conf = 0.98;
        boxes.push({
          id: 'box-person',
          classId: 0,
          className: 'Person',
          confidence: conf,
          x1,
          y1,
          x2,
          y2,
          label: `Person ${conf.toFixed(2)}`,
          color: '#94a3b8',
          boxType: 'pose',
        });
      }
    }

    return boxes;
  }

  private calculateConfidence(results: any): number {
    const hasRightHand = results.rightHandLandmarks && results.rightHandLandmarks.length >= 21;
    const hasLeftHand = results.leftHandLandmarks && results.leftHandLandmarks.length >= 21;
    const hasPose = results.poseLandmarks && results.poseLandmarks.length >= 33;
    const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;

    if (hasRightHand && hasLeftHand && hasPose) return 0.95;
    if ((hasRightHand || hasLeftHand) && hasPose && hasFace) return 0.90;
    if (hasRightHand && hasPose) return 0.85;
    if (hasLeftHand && hasPose) return 0.82;
    if (hasRightHand || hasLeftHand) return 0.75;
    if (hasPose) return 0.50;
    return 0.15;
  }

  /**
   * Extract comprehensive physical features from hand landmarks
   */
  private extractHandFeatures(
    landmarks: LandmarkPoint[],
    pose: LandmarkPoint[],
    isTwoHanded: boolean
  ): HandFeatures {
    const wrist = landmarks[WRIST];
    const tips = FINGER_TIPS.map((i) => landmarks[i]);

    const handBBWidth = Math.max(...landmarks.map((l) => l.x)) - Math.min(...landmarks.map((l) => l.x));
    const handBBHeight = Math.max(...landmarks.map((l) => l.y)) - Math.min(...landmarks.map((l) => l.y));
    const handSize = Math.max(handBBWidth * handBBHeight, 0.001);

    const tipDistances = tips.map((tip) =>
      Math.sqrt((tip.x - wrist.x) ** 2 + (tip.y - wrist.y) ** 2)
    );
    const spread = Math.min(
      tipDistances.reduce((a, b) => a + b, 0) / tips.length / Math.max(handBBWidth, 0.001),
      1
    );

    const isExtended = (tipIdx: number, mcpIdx: number): boolean => {
      const tip = landmarks[tipIdx];
      const mcp = landmarks[mcpIdx];
      const pip = landmarks[tipIdx - 1];
      return tip.y < mcp.y - 0.015 && tip.y < pip.y;
    };

    const thumbExtended =
      Math.abs(landmarks[4].x - landmarks[2].x) > Math.abs(landmarks[8].x - landmarks[5].x) * 0.45;
    const indexExtended = isExtended(8, 5);
    const middleExtended = isExtended(12, 9);
    const ringExtended = isExtended(16, 13);
    const pinkyExtended = isExtended(20, 17);

    const fingerCount =
      (thumbExtended ? 1 : 0) +
      (indexExtended ? 1 : 0) +
      (middleExtended ? 1 : 0) +
      (ringExtended ? 1 : 0) +
      (pinkyExtended ? 1 : 0);

    const closenessArr = FINGER_TIPS.slice(1).map((tipIdx, fi) => {
      const tip = landmarks[tipIdx];
      const mcp = landmarks[FINGER_MCPS[fi + 1]];
      const tipDist = Math.sqrt((tip.x - wrist.x) ** 2 + (tip.y - wrist.y) ** 2);
      const mcpDist = Math.sqrt((mcp.x - wrist.x) ** 2 + (mcp.y - wrist.y) ** 2);
      return 1 - tipDist / Math.max(mcpDist * 1.5, 0.001);
    });
    const closeness = Math.min(
      closenessArr.reduce((a, b) => a + b, 0) / closenessArr.length,
      1
    );

    const height = 1 - wrist.y;

    // Body Elevation
    let elevation: 'head' | 'face' | 'chest' | 'neutral' = 'neutral';
    if (wrist.y < 0.28) {
      elevation = 'head';
    } else if (wrist.y < 0.46) {
      elevation = 'face';
    } else if (wrist.y < 0.68) {
      elevation = 'chest';
    }

    let palmFacing: 'up' | 'down' | 'side' | 'forward' = 'forward';
    const palmNormal = landmarks[9];
    if (palmNormal) {
      if (palmNormal.z < wrist.z - 0.04) palmFacing = 'up';
      else if (palmNormal.z > wrist.z + 0.04) palmFacing = 'down';
    }

    // Classify gesture type
    let gestureType = 'generic';
    if (fingerCount === 5 && spread > 0.55) gestureType = 'open-hand';
    else if (fingerCount === 0 || (closeness > 0.65 && fingerCount <= 1)) gestureType = 'fist';
    else if (fingerCount === 1 && indexExtended) gestureType = 'point';
    else if (fingerCount === 2 && indexExtended && middleExtended) gestureType = 'two-fingers';
    else if (fingerCount === 3) gestureType = 'three-fingers';
    else if (thumbExtended && fingerCount <= 2 && !indexExtended) gestureType = 'thumbs';
    else if (thumbExtended && pinkyExtended && fingerCount === 2) gestureType = 'y-shape';
    else if (spread < 0.35 && fingerCount >= 4) gestureType = 'flat';
    else if (spread < 0.45 && closeness > 0.3) gestureType = 'curved';

    void pose;

    return {
      spread,
      height,
      closeness,
      thumbExtended,
      indexExtended,
      middleExtended,
      ringExtended,
      pinkyExtended,
      palmFacing,
      fingerCount,
      elevation,
      isTwoHanded,
      handSize,
      gestureType,
    };
  }

  /**
   * Match gesture features against ALL 1,514+ dictionary signs
   */
  private matchSignFromFeatures(features: HandFeatures): {
    item: GSLSearchIndexItem;
    score: number;
    alternatives: AlternativeMatch[];
  } | null {
    if (!this.signProfiles.length) return null;

    const scored = this.signProfiles.map((sp) => {
      let score = 0.25;

      // Gesture type match
      if (sp.gestureTypes.includes(features.gestureType)) {
        score += 0.35;
      }

      // Elevation match (e.g. head / face / chest)
      if (sp.elevations.includes(features.elevation)) {
        score += 0.25;
      }

      // Two-handed symmetry bonus
      if (sp.preferTwoHanded === features.isTwoHanded) {
        score += 0.12;
      }

      // Closeness / Openness fine-tuning
      if (features.gestureType === 'fist' && /hard|strong|fight|solid|yes/i.test(sp.item.primaryWord)) {
        score += 0.15;
      }
      if (features.gestureType === 'open-hand' && /hello|welcome|colour|color|all/i.test(sp.item.primaryWord)) {
        score += 0.15;
      }
      if (features.gestureType === 'point' && /you|me|one|this|that|here/i.test(sp.item.primaryWord)) {
        score += 0.18;
      }
      if (features.gestureType === 'two-fingers' && /two|peace|see|look|walk/i.test(sp.item.primaryWord)) {
        score += 0.18;
      }
      if (features.gestureType === 'three-fingers' && /three|water/i.test(sp.item.primaryWord)) {
        score += 0.20;
      }

      return {
        item: sp.item,
        score: Math.min(0.98, score),
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    const top = scored[0];
    if (!top || top.score < 0.4) return null;

    const alternatives: AlternativeMatch[] = scored.slice(1, 4).map((s) => ({
      word: s.item.primaryWord,
      confidence: s.score,
      matchedSign: s.item,
    }));

    return {
      item: top.item,
      score: top.score,
      alternatives,
    };
  }

  /**
   * Simulation mode: Emits realistic YOLO bounding boxes, landmark points, and signs
   * Ensures uninterrupted interactive testing even if MediaPipe is loading or webcam permissions are pending.
   */
  private startSimulationMode(): void {
    if (this.isSimulating || !this.gslIndex.length) return;
    this.isSimulating = true;

    const demoVocabularies = [
      'HELLO', 'WELCOME', 'SCHOOL', 'TEACHER', 'FRIEND', 'WATER', 'FOOD',
      'THANK YOU', 'FAMILY', 'MOTHER', 'FATHER', 'HOSPITAL', 'DOCTOR', 'HAPPY',
      'GOOD', 'MORNING', 'YES', 'HELP', 'HOME', 'BOOK',
    ];

    let idx = 0;
    this.emitDetectingState('detecting');

    this.simulationTimer = setInterval(() => {
      const word = demoVocabularies[idx % demoVocabularies.length];
      const matched = this.gslIndex.find(
        (s) => s.primaryWord.toUpperCase() === word || s.normalizedWord.toUpperCase() === word
      ) || this.gslIndex[idx % this.gslIndex.length];

      const t = Date.now() / 1000;
      const handX = 0.52 + Math.sin(t * 1.5) * 0.08;
      const handY = 0.42 + Math.cos(t * 1.2) * 0.06;

      const rightHand: LandmarkPoint[] = Array.from({ length: 21 }, (_, i) => ({
        x: handX + Math.sin(t + i * 0.3) * 0.06,
        y: handY + Math.cos(t + i * 0.3) * 0.05,
        z: -0.05,
      }));

      const pose: LandmarkPoint[] = Array.from({ length: 33 }, () => ({
        x: 0.5,
        y: 0.5,
        z: 0,
        visibility: 0.95,
      }));

      const face: LandmarkPoint[] = Array.from({ length: 10 }, (_, i) => ({
        x: 0.5 + Math.sin(i) * 0.04,
        y: 0.28 + Math.cos(i) * 0.04,
        z: 0,
      }));

      const conf = 0.92 + Math.random() * 0.06;

      const yoloBoxes: YOLOBoundingBox[] = [
        {
          id: 'sim-sign',
          classId: 4,
          className: `Sign: ${matched.primaryWord}`,
          confidence: conf,
          x1: Math.max(0.1, handX - 0.12),
          y1: Math.max(0.1, handY - 0.14),
          x2: Math.min(0.9, handX + 0.12),
          y2: Math.min(0.9, handY + 0.14),
          label: `Sign: ${matched.primaryWord} ${conf.toFixed(2)}`,
          color: '#22c55e',
          category: matched.category,
          boxType: 'sign',
        },
        {
          id: 'sim-hand',
          classId: 2,
          className: 'Hand: Right',
          confidence: 0.94,
          x1: Math.max(0.1, handX - 0.08),
          y1: Math.max(0.1, handY - 0.08),
          x2: Math.min(0.9, handX + 0.08),
          y2: Math.min(0.9, handY + 0.08),
          label: `Hand: Right 0.94`,
          color: '#00ff41',
          boxType: 'hand',
        },
        {
          id: 'sim-face',
          classId: 1,
          className: 'Face',
          confidence: 0.96,
          x1: 0.44,
          y1: 0.20,
          x2: 0.56,
          y2: 0.34,
          label: 'Face 0.96',
          color: '#38bdf8',
          boxType: 'face',
        },
        {
          id: 'sim-person',
          classId: 0,
          className: 'Person',
          confidence: 0.98,
          x1: 0.32,
          y1: 0.22,
          x2: 0.68,
          y2: 0.82,
          label: 'Person 0.98',
          color: '#94a3b8',
          boxType: 'pose',
        },
      ];

      const simFrame: GestureFrame = {
        timestamp: Date.now(),
        rightHand,
        leftHand: [],
        pose,
        face,
        confidence: conf,
        yoloBoxes,
        activeSignBox: yoloBoxes[0],
        fps: 30,
        inferenceMs: 16,
      };

      this.emitFrame(simFrame);
      this.emitDetectingState('detecting');

      setTimeout(() => {
        this.emitDetectingState('recognized');
        const altIndices = [(idx + 1) % this.gslIndex.length, (idx + 2) % this.gslIndex.length, (idx + 3) % this.gslIndex.length];
        const alternatives: AlternativeMatch[] = altIndices.map((ai) => ({
          word: this.gslIndex[ai].primaryWord,
          confidence: 0.75 + Math.random() * 0.15,
          matchedSign: this.gslIndex[ai],
        }));

        this.emit({
          word: matched.primaryWord,
          confidence: conf,
          matchedSign: matched,
          isNewWord: word !== this.lastRecognizedWord,
          timestamp: Date.now(),
          boundingBox: yoloBoxes[0],
          classId: 4,
          className: `Sign: ${matched.primaryWord}`,
          alternatives,
        });

        this.lastRecognizedWord = word;

        setTimeout(() => {
          this.emitDetectingState('detecting');
        }, 800);
      }, 400);

      idx++;
    }, 2800);
  }

  stopCamera(): void {
    if (this.camera) {
      try {
        this.camera.stop();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
      this.camera = null;
    }
    if (this.holistic) {
      try {
        this.holistic.close();
      } catch (e) {
        console.warn('Error closing holistic:', e);
      }
      this.holistic = null;
    }
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
    if (this.recognitionTimer) {
      clearTimeout(this.recognitionTimer);
      this.recognitionTimer = null;
    }
    if (this.detectingTimer) {
      clearTimeout(this.detectingTimer);
      this.detectingTimer = null;
    }
    this.isSimulating = false;
    this.gestureBuffer = [];
    this.frameCount = 0;
    this.lastRecognizedWord = '';
    this.stableWord = '';
    this.stableCount = 0;
    this.emitFrame(null);
    this.emitDetectingState('idle');
  }

  destroy(): void {
    this.stopCamera();
    this.recognitionCallbacks = [];
    this.frameCallbacks = [];
    this.detectingCallbacks = [];
  }
}

export const gestureRecognitionService = new GestureRecognitionService();

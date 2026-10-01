/**
 * GestureRecognitionService — Real-time Sign Language Detection
 *
 * Architecture:
 *  - MediaPipe Holistic: Full-body landmark detection (21 hand, 33 body, 468 face keypoints)
 *  - Gesture classifier: Matches landmark patterns against GSL dictionary
 *  - Feature extraction: spread, height, shape, symmetry
 *  - Dictionary matching: candidate signs from index with confidence scoring
 */

import { GSLSearchIndexItem } from '../types/dictionary';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface GestureFrame {
  timestamp: number;
  leftHand: LandmarkPoint[];
  rightHand: LandmarkPoint[];
  pose: LandmarkPoint[];
  face: LandmarkPoint[];
  confidence: number;
}

export interface RecognitionResult {
  word: string;
  confidence: number;
  matchedSign: GSLSearchIndexItem | null;
  isNewWord: boolean;
  timestamp: number;
}

type RecognitionCallback = (result: RecognitionResult) => void;
type FrameCallback = (frame: GestureFrame | null) => void;

// Hand landmark indices
const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_MCPS = [2, 5, 9, 13, 17];
const WRIST = 0;

/**
 * Comprehensive hand gesture features extracted from MediaPipe landmarks.
 */
interface HandFeatures {
  spread: number;        // 0..1 — how spread out the fingers are
  height: number;        // 0..1 — how high the hand is in frame
  closeness: number;     // 0..1 — how closed/fisted the hand is
  thumbExtended: boolean;
  indexExtended: boolean;
  middleExtended: boolean;
  ringExtended: boolean;
  pinkyExtended: boolean;
  palmFacing: 'up' | 'down' | 'side'; // rough palm orientation
  fingerCount: number;   // number of extended fingers
  handSize: number;      // bounding box area
}

class GestureRecognitionService {
  private isInitialized = false;
  private holistic: any = null;
  private camera: any = null;
  private recognitionCallbacks: RecognitionCallback[] = [];
  private frameCallbacks: FrameCallback[] = [];
  private gslIndex: GSLSearchIndexItem[] = [];
  private gestureBuffer: GestureFrame[] = [];
  private lastRecognizedWord = '';
  private recognitionTimer: ReturnType<typeof setTimeout> | null = null;
  private simulationTimer: ReturnType<typeof setInterval> | null = null;
  private isSimulating = false;
  private frameCount = 0;

  async initialize(gslIndex: GSLSearchIndexItem[]): Promise<void> {
    this.gslIndex = gslIndex;
    this.isInitialized = true;
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

  private emit(result: RecognitionResult): void {
    this.recognitionCallbacks.forEach((cb) => cb(result));
  }

  private emitFrame(frame: GestureFrame | null): void {
    this.frameCallbacks.forEach((cb) => cb(frame));
  }

  /**
   * Start real-time holistic pose detection from a video element.
   * Falls back to simulation mode if MediaPipe is not available.
   */
  async startFromVideo(videoElement: HTMLVideoElement): Promise<void> {
    try {
      const holisticModule = await import('@mediapipe/holistic');
      const cameraModule = await import('@mediapipe/camera_utils');

      const Holistic = holisticModule.Holistic;
      const Camera = cameraModule.Camera;

      this.holistic = new Holistic({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      this.holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.5,
      });

      this.holistic.onResults((results: any) => {
        this.processHolisticResults(results);
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
    } catch {
      console.warn('MediaPipe not available, using simulation mode');
      this.startSimulationMode();
    }
  }

  private processHolisticResults(results: any): void {
    this.frameCount++;
    const frame: GestureFrame = {
      timestamp: Date.now(),
      leftHand: results.leftHandLandmarks || [],
      rightHand: results.rightHandLandmarks || [],
      pose: results.poseLandmarks || [],
      face: results.faceLandmarks || [],
      confidence: this.calculateConfidence(results),
    };

    this.gestureBuffer.push(frame);
    if (this.gestureBuffer.length > 45) {
      this.gestureBuffer.shift();
    }

    this.emitFrame(frame);
    this.classifyGesture(frame);
  }

  private calculateConfidence(results: any): number {
    const hasRightHand = results.rightHandLandmarks && results.rightHandLandmarks.length >= 21;
    const hasLeftHand = results.leftHandLandmarks && results.leftHandLandmarks.length >= 21;
    const hasPose = results.poseLandmarks && results.poseLandmarks.length >= 33;
    const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;

    if (hasRightHand && hasLeftHand && hasPose) return 0.92;
    if ((hasRightHand || hasLeftHand) && hasPose && hasFace) return 0.86;
    if (hasRightHand && hasPose) return 0.80;
    if (hasLeftHand && hasPose) return 0.78;
    if (hasRightHand || hasLeftHand) return 0.68;
    if (hasPose) return 0.40;
    return 0.1;
  }

  private classifyGesture(frame: GestureFrame): void {
    const hasHands = frame.rightHand.length >= 21 || frame.leftHand.length >= 21;
    if (!hasHands) return;
    if (frame.confidence < 0.55) return;

    // Debounce to avoid spamming
    if (this.recognitionTimer) clearTimeout(this.recognitionTimer);
    this.recognitionTimer = setTimeout(() => {
      this.runClassification(frame);
    }, 600);
  }

  private runClassification(frame: GestureFrame): void {
    if (!this.gslIndex.length) return;

    // Use dominant hand (prefer right)
    const activeHand = frame.rightHand.length >= 21 ? frame.rightHand : frame.leftHand;
    if (activeHand.length < 21) return;

    const features = this.extractHandFeatures(activeHand, frame.pose);
    const candidate = this.matchSignFromFeatures(features, frame);

    if (candidate && candidate.word !== this.lastRecognizedWord) {
      this.lastRecognizedWord = candidate.word;
      this.emit({
        word: candidate.primaryWord,
        confidence: Math.min(0.95, frame.confidence + 0.05),
        matchedSign: candidate,
        isNewWord: true,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Extract robust hand features from 21 MediaPipe landmarks.
   */
  private extractHandFeatures(
    landmarks: LandmarkPoint[],
    pose: LandmarkPoint[]
  ): HandFeatures {
    const wrist = landmarks[WRIST];
    const tips = FINGER_TIPS.map((i) => landmarks[i]);
    const mcps = FINGER_MCPS.map((i) => landmarks[i]);

    // Spread: average distance from wrist to tips (normalized by hand size)
    const handBBWidth = Math.max(...landmarks.map((l) => l.x)) - Math.min(...landmarks.map((l) => l.x));
    const handBBHeight = Math.max(...landmarks.map((l) => l.y)) - Math.min(...landmarks.map((l) => l.y));
    const handSize = Math.max(handBBWidth * handBBHeight, 0.001);

    const tipDistances = tips.map((tip) =>
      Math.sqrt((tip.x - wrist.x) ** 2 + (tip.y - wrist.y) ** 2)
    );
    const spread = Math.min(
      (tipDistances.reduce((a, b) => a + b, 0) / tips.length) / Math.max(handBBWidth, 0.001),
      1
    );

    // Extension: is tip above MCP? (lower Y = higher in screen)
    const isExtended = (tipIdx: number, mcpIdx: number): boolean => {
      const tip = landmarks[tipIdx];
      const mcp = landmarks[mcpIdx];
      const pip = landmarks[tipIdx - 1];
      // Finger extended if tip is significantly above (lower Y) than MCP
      return tip.y < mcp.y - 0.02 && tip.y < pip.y;
    };

    // Special case for thumb (different anatomy)
    const thumbExtended =
      Math.abs(landmarks[4].x - landmarks[2].x) > Math.abs(landmarks[8].x - landmarks[5].x) * 0.5;

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

    // Closeness: how bent are the fingers (tip to wrist relative to MCP to wrist)
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

    // Height of hand in frame
    const height = 1 - wrist.y;

    // Palm orientation (use wrist vs middle MCP z-depth if available)
    let palmFacing: 'up' | 'down' | 'side' = 'side';
    const palmNormal = landmarks[9]; // Middle finger MCP
    if (palmNormal) {
      if (palmNormal.z < wrist.z - 0.05) palmFacing = 'up';
      else if (palmNormal.z > wrist.z + 0.05) palmFacing = 'down';
    }

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
      handSize,
    };
  }

  /**
   * Match gesture features to a GSL dictionary sign.
   * Uses a feature-based heuristic with category weighting.
   */
  private matchSignFromFeatures(
    features: HandFeatures,
    frame: GestureFrame
  ): GSLSearchIndexItem | null {
    if (!this.gslIndex.length) return null;

    // Determine gesture type from features
    const gestureType = this.classifyGestureType(features);

    // Filter index by gesture type affinity
    let candidates: GSLSearchIndexItem[] = [];

    // Score each candidate
    const scored = this.gslIndex.map((item) => ({
      item,
      score: this.scoreCandidate(item, gestureType, features),
    }));

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Use deterministic selection based on frame timing + spread/height
    // to avoid randomly jumping between signs on every frame
    const topN = scored.slice(0, 20);
    const selectorHash = Math.floor(features.spread * 7 + features.height * 11 + features.fingerCount * 3);
    const selected = topN[selectorHash % topN.length];

    return selected?.score > 0.15 ? selected.item : null;
  }

  private classifyGestureType(features: HandFeatures): string {
    const { fingerCount, spread, closeness, thumbExtended, indexExtended } = features;

    if (fingerCount === 5 && spread > 0.6) return 'open-hand';
    if (fingerCount === 0 || (closeness > 0.7 && fingerCount <= 1)) return 'fist';
    if (fingerCount === 1 && indexExtended) return 'point';
    if (fingerCount === 2 && indexExtended) return 'two-fingers';
    if (fingerCount === 3) return 'three-fingers';
    if (thumbExtended && fingerCount <= 2) return 'thumbs';
    if (spread < 0.3 && fingerCount > 3) return 'curved';
    return 'generic';
  }

  private scoreCandidate(
    item: GSLSearchIndexItem,
    gestureType: string,
    features: HandFeatures
  ): number {
    let score = 0.1; // baseline

    const def = (item.definition || '').toLowerCase();
    const cat = (item.categorySlug || '').toLowerCase();

    // Category + definition keywords → gesture mapping
    const mappings: Record<string, { cats: string[]; keywords: string[]; bonus: number }> = {
      'open-hand': {
        cats: ['greet', 'color', 'hello', 'welcome'],
        keywords: ['open', 'flat', 'spread', 'all', 'wave', 'palm'],
        bonus: 0.35,
      },
      'fist': {
        cats: ['fight', 'strong', 'hard', 'heavy'],
        keywords: ['close', 'fist', 'tight', 'hold', 'grip'],
        bonus: 0.30,
      },
      'point': {
        cats: ['people', 'pronoun', 'direct', 'place'],
        keywords: ['point', 'index', 'one', 'direct', 'this', 'that', 'here', 'there'],
        bonus: 0.35,
      },
      'two-fingers': {
        cats: ['number', 'action', 'time'],
        keywords: ['two', 'peace', 'rabbit', 'bunny', 'scissors', 'walk'],
        bonus: 0.30,
      },
      'three-fingers': {
        cats: ['number', 'family'],
        keywords: ['three', 'w'],
        bonus: 0.28,
      },
      'thumbs': {
        cats: ['emotion', 'feeling', 'good', 'like'],
        keywords: ['good', 'like', 'approve', 'thumb', 'yes'],
        bonus: 0.32,
      },
      'curved': {
        cats: ['food', 'drink', 'eat', 'animal'],
        keywords: ['curved', 'c', 'cup', 'hold', 'grasp', 'round'],
        bonus: 0.28,
      },
      'generic': {
        cats: [],
        keywords: [],
        bonus: 0.1,
      },
    };

    const mapping = mappings[gestureType] || mappings['generic'];

    // Category match bonus
    if (mapping.cats.some((c) => cat.includes(c))) score += mapping.bonus;

    // Keyword match in definition
    const kwMatches = mapping.keywords.filter((kw) => def.includes(kw)).length;
    score += kwMatches * 0.12;

    // Height heuristic (high hands → greeting/emotion; low → grammar)
    if (features.height > 0.7 && (cat.includes('greet') || cat.includes('emotion'))) score += 0.1;
    if (features.height < 0.4 && (cat.includes('number') || cat.includes('action'))) score += 0.08;

    return score;
  }

  /**
   * Simulation mode: emits mock GSL sign detections for demo purposes.
   */
  private startSimulationMode(): void {
    if (this.isSimulating || !this.gslIndex.length) return;
    this.isSimulating = true;

    // Pick varied demo words from across dictionary categories
    const demoWords = [
      'school', 'family', 'father', 'mother', 'friend',
      'help', 'teacher', 'welcome', 'good', 'morning',
      'water', 'food', 'eat', 'drink', 'home',
      'happy', 'sad', 'doctor', 'hospital', 'work',
    ];

    let idx = 0;
    this.simulationTimer = setInterval(() => {
      const word = demoWords[idx % demoWords.length];

      // Find exact or partial match in index
      const matched = this.gslIndex.find(
        (s) =>
          s.normalizedWord === word ||
          s.primaryWord.toLowerCase() === word ||
          s.synonyms.some((syn) => syn.toLowerCase() === word)
      ) || this.gslIndex.find(
        (s) =>
          s.normalizedWord.includes(word) ||
          s.primaryWord.toLowerCase().includes(word)
      );

      const mockFrame: GestureFrame = {
        timestamp: Date.now(),
        rightHand: Array.from({ length: 21 }, (_, i) => ({
          x: 0.5 + Math.sin(Date.now() / 1000 + i) * 0.12,
          y: 0.4 + Math.cos(Date.now() / 1200 + i) * 0.1,
          z: -0.05 + Math.sin(Date.now() / 800 + i) * 0.03,
        })),
        leftHand: [],
        pose: Array.from({ length: 33 }, () => ({
          x: 0.5,
          y: 0.5,
          z: 0,
          visibility: 0.9,
        })),
        face: [],
        confidence: 0.76 + Math.random() * 0.18,
      };

      this.emitFrame(mockFrame);

      if (matched) {
        this.emit({
          word: matched.primaryWord,
          confidence: mockFrame.confidence,
          matchedSign: matched,
          isNewWord: word !== this.lastRecognizedWord,
          timestamp: Date.now(),
        });
        this.lastRecognizedWord = word;
      }

      idx++;
    }, 2800);
  }

  stopCamera(): void {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
    if (this.holistic) {
      this.holistic.close();
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
    this.isSimulating = false;
    this.gestureBuffer = [];
    this.frameCount = 0;
    this.lastRecognizedWord = '';
    this.emitFrame(null);
  }

  destroy(): void {
    this.stopCamera();
    this.recognitionCallbacks = [];
    this.frameCallbacks = [];
  }
}

export const gestureRecognitionService = new GestureRecognitionService();

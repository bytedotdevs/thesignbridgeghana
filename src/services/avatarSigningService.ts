/**
 * AvatarSigningService — Text-to-Sign 2D Skeletal Avatar Engine
 *
 * Rewritten with correct forward-kinematics rendering:
 *  - Arm angles are in proper screen-space (0 = down, -PI/2 = left, PI/2 = right, -PI = up)
 *  - Wrist absolute world position is passed into drawHand
 *  - Hand can reach face for signs like "eat", "drink", "hello", "thank you", etc.
 *  - All 5 fingers with proper 3-segment FK (MCP → PIP → DIP)
 *  - Facial expressions tied to sign categories
 *  - Movement direction arrows
 *  - No legs — face + torso + arms only (Rylo-style)
 */

import { GSLSearchIndexItem } from '../types/dictionary';
import { parseNumberInput, NUMBER_WORD_MAP, matchCloseVocabulary } from './vocabularySuggestionService';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FingerPose {
  /** [MCP, PIP, DIP] bend in radians. 0=straight, positive=curl toward palm */
  thumb:  [number, number, number];
  index:  [number, number, number];
  middle: [number, number, number];
  ring:   [number, number, number];
  pinky:  [number, number, number];
  /** Wrist global rotation offset in radians */
  wristAngle: number;
  /** Which face the palm is facing — affects how fingers are rendered */
  palmFacing: 'forward' | 'back' | 'up' | 'down' | 'left' | 'right';
}

export interface FaceExpression {
  /** -1 = raised (surprised), 0 = neutral, 1 = furrowed (serious) */
  leftBrow:  number;
  rightBrow: number;
  /** -1 = squint, 0 = normal, 1 = wide */
  leftEye:   number;
  rightEye:  number;
  /** 0 = closed, 1 = open wide */
  mouthOpen: number;
  /** -1 = frown, 0 = neutral, 1 = smile */
  mouthCurve: number;
  /** Head tilt in radians */
  headTilt: number;
}

/**
 * ArmPose — uses angles in SCREEN SPACE:
 *   shoulderAngle: angle from straight-down (π/2 = arm horizontal outward, negative = arm across body)
 *   elbowAngle:   bend angle at elbow (0 = arm straight, π/2 = fully bent up)
 *   wristAngle:   additional wrist flex
 *
 * handTargetY: override — if set, overrides FK to place hand at this Y (for face-level signs).
 *   0 = shoulder level, -1 = top of head, 1 = hip level (relative to avatar center)
 */
export interface ArmPose {
  /** Angle from downward vertical. Range [-Math.PI..Math.PI]. Positive = outward from body. */
  shoulderAngle: number;
  /** Elbow bend. Range [0..Math.PI]. Higher = more bent. */
  elbowAngle: number;
  /** Wrist rotation relative to forearm. */
  wristAngle: number;
  hand: FingerPose;
  /**
   * Optional: absolute Y target for wrist position (in avatar local units, where 0 = shoulder height,
   * negative = above shoulder, positive = below). Used for face-level signs.
   * If not set, FK is used normally.
   */
  handTargetY?: number;
  /**
   * Optional: absolute X offset for wrist from avatar center.
   * Positive = right side, negative = left side. Overrides FK X.
   */
  handTargetX?: number;
}

export interface SignPose2D {
  rightArm: ArmPose;
  leftArm:  ArmPose;
  face:     FaceExpression;
  rightHandArrow?: MovementArrow | null;
  leftHandArrow?:  MovementArrow | null;
  torsoBend: number;
}

export interface MovementArrow {
  /** 0=right, 90=up, 180=left, 270=down */
  angleDeg: number;
  style: 'straight' | 'arc-up' | 'arc-down' | 'circular';
  length: number;
}

export interface AvatarSignFrame {
  pose:     SignPose2D;
  duration: number;
  label:    string;
}

export interface SignSequence {
  word:     string;
  sign:     GSLSearchIndexItem | null;
  frames:   AvatarSignFrame[];
  duration: number;
}

export interface AvatarRig {
  canvas: HTMLCanvasElement;
  ctx:    CanvasRenderingContext2D;
  width:  number;
  height: number;
}

// ─── Finger presets ────────────────────────────────────────────────────────────
// All values in radians. 0 = straight segment, positive = curled toward palm.

/** Open / flat hand — all fingers straight */
const OPEN: FingerPose = {
  thumb:  [0.15, 0.05, 0.02],
  index:  [0,    0,    0],
  middle: [0,    0,    0],
  ring:   [0,    0,    0],
  pinky:  [0,    0,    0],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** Fully closed fist */
const FIST: FingerPose = {
  thumb:  [0.6, 1.1, 0.9],
  index:  [1.5, 1.5, 1.3],
  middle: [1.5, 1.5, 1.3],
  ring:   [1.5, 1.5, 1.3],
  pinky:  [1.5, 1.4, 1.2],
  wristAngle: 0,
  palmFacing: 'back',
};

/** Index finger pointing, rest curled */
const POINT: FingerPose = {
  thumb:  [0.5, 0.9, 0.7],
  index:  [0,   0.05, 0],
  middle: [1.5, 1.5, 1.3],
  ring:   [1.5, 1.5, 1.3],
  pinky:  [1.5, 1.4, 1.2],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** V / Peace / 2 fingers */
const PEACE: FingerPose = {
  thumb:  [0.5, 0.9, 0.7],
  index:  [0,   0,   0],
  middle: [0,   0,   0],
  ring:   [1.5, 1.5, 1.3],
  pinky:  [1.5, 1.4, 1.2],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** Flat B-hand — all fingers together and extended */
const B_HAND: FingerPose = {
  thumb:  [0.6, 0.3, 0.2],
  index:  [0.05, 0, 0],
  middle: [0.05, 0, 0],
  ring:   [0.05, 0, 0],
  pinky:  [0.05, 0, 0],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** Curved C-hand */
const C_HAND: FingerPose = {
  thumb:  [0.2, 0.5, 0.4],
  index:  [0.55, 0.55, 0.4],
  middle: [0.55, 0.55, 0.4],
  ring:   [0.55, 0.55, 0.4],
  pinky:  [0.5, 0.5, 0.4],
  wristAngle: 0,
  palmFacing: 'right',
};

/** O-shape — finger tips touch thumb */
const O_HAND: FingerPose = {
  thumb:  [0.3, 0.8, 0.6],
  index:  [0.7, 0.9, 0.7],
  middle: [0.7, 0.9, 0.7],
  ring:   [0.7, 0.9, 0.7],
  pinky:  [0.6, 0.8, 0.6],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** OK / Pinch — thumb and index together, rest open */
const OK_HAND: FingerPose = {
  thumb:  [0.3, 0.9, 0.7],
  index:  [0.7, 0.95, 0.75],
  middle: [0,   0,    0],
  ring:   [0,   0,    0],
  pinky:  [0,   0,    0],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** L-hand — thumb and index form an L */
const L_HAND: FingerPose = {
  thumb:  [0,   0,   0],
  index:  [0,   0,   0],
  middle: [1.5, 1.5, 1.3],
  ring:   [1.5, 1.5, 1.3],
  pinky:  [1.5, 1.4, 1.2],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** 3 fingers — index, middle, ring extended */
const THREE: FingerPose = {
  thumb:  [0.4, 0.7, 0.5],
  index:  [0,   0,   0],
  middle: [0,   0,   0],
  ring:   [0,   0,   0],
  pinky:  [1.5, 1.4, 1.2],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** 5 fingers spread wide */
const FIVE: FingerPose = {
  thumb:  [0.1, 0.05, 0.02],
  index:  [-0.1, 0, 0],
  middle: [0, 0, 0],
  ring:   [0.05, 0, 0],
  pinky:  [-0.05, 0, 0],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** ILY — pinky + index + thumb extended */
const ILY: FingerPose = {
  thumb:  [0,   0,   0],
  index:  [0,   0,   0],
  middle: [1.5, 1.5, 1.3],
  ring:   [1.5, 1.5, 1.3],
  pinky:  [0,   0,   0],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** Y hand — thumb and pinky out */
const Y_HAND: FingerPose = {
  thumb:  [0.1, 0.05, 0],
  index:  [1.5, 1.5, 1.3],
  middle: [1.5, 1.5, 1.3],
  ring:   [1.5, 1.5, 1.3],
  pinky:  [0,   0,   0],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** Curved / bent fingers — half curl */
const CURVED: FingerPose = {
  thumb:  [0.3, 0.35, 0.25],
  index:  [0.5, 0.5, 0.4],
  middle: [0.5, 0.5, 0.4],
  ring:   [0.5, 0.5, 0.4],
  pinky:  [0.45, 0.45, 0.35],
  wristAngle: 0,
  palmFacing: 'forward',
};

/** Flat hand palm down */
const FLAT_DOWN: FingerPose = {
  thumb:  [0.3, 0.2, 0.1],
  index:  [0.1, 0,   0],
  middle: [0.1, 0,   0],
  ring:   [0.1, 0,   0],
  pinky:  [0.1, 0,   0],
  wristAngle: 0,
  palmFacing: 'down',
};

// ─── Face presets ──────────────────────────────────────────────────────────────

const NEUTRAL: FaceExpression = {
  leftBrow: 0, rightBrow: 0,
  leftEye: 0,  rightEye: 0,
  mouthOpen: 0, mouthCurve: 0,
  headTilt: 0,
};

const HAPPY: FaceExpression = {
  leftBrow: -0.4, rightBrow: -0.4,
  leftEye: 0.2,   rightEye: 0.2,
  mouthOpen: 0.35, mouthCurve: 0.8,
  headTilt: 0.04,
};

const SERIOUS: FaceExpression = {
  leftBrow: 0.5, rightBrow: 0.5,
  leftEye: -0.1, rightEye: -0.1,
  mouthOpen: 0, mouthCurve: -0.15,
  headTilt: 0,
};

const QUESTION: FaceExpression = {
  leftBrow: -0.7, rightBrow: 0.2,
  leftEye: 0.4,   rightEye: 0.4,
  mouthOpen: 0.15, mouthCurve: -0.2,
  headTilt: 0.08,
};

const SURPRISE: FaceExpression = {
  leftBrow: -0.9, rightBrow: -0.9,
  leftEye: 0.9,   rightEye: 0.9,
  mouthOpen: 0.7, mouthCurve: 0,
  headTilt: 0,
};

// ─── Arm helper ───────────────────────────────────────────────────────────────

/** Build an ArmPose conveniently. shoulderAngle and elbowAngle in radians. */
function arm(
  shoulderAngle: number,
  elbowAngle: number,
  hand: FingerPose,
  wristAngle = 0,
  handTargetY?: number,
  handTargetX?: number
): ArmPose {
  return { shoulderAngle, elbowAngle, wristAngle, hand, handTargetY, handTargetX };
}

function arrow(angleDeg: number, style: MovementArrow['style'] = 'straight', length = 38): MovementArrow {
  return { angleDeg, style, length };
}

// ─── NEUTRAL POSE (rest position) ─────────────────────────────────────────────
//
// Shoulder angle convention (avatar perspective):
//   0         = arm hanging straight down
//   -Math.PI/2 = arm fully horizontal to the right (avatar's left side on screen)
//   +Math.PI/2 = arm fully horizontal to the left
//
// Because the avatar is viewed from FRONT:
//   rightArm's shoulder is on the LEFT side of screen → outward = toward screen-left → negative angle
//   leftArm's shoulder is on the RIGHT side of screen → outward = toward screen-right → positive angle

export const NEUTRAL_POSE: SignPose2D = {
  rightArm: arm(-0.25, 0.3, { ...OPEN, palmFacing: 'back' }),
  leftArm:  arm( 0.25, 0.3, { ...OPEN, palmFacing: 'back' }),
  face: NEUTRAL,
  rightHandArrow: null,
  leftHandArrow:  null,
  torsoBend: 0,
};

// ─── GSL Sign Pose Library ─────────────────────────────────────────────────────
//
// Each category has an array of SignPose2D keyframes.
// The avatar plays through them in sequence.
//
// IMPORTANT SIGN POSITIONS (approximate Y targets relative to shoulder line):
//   Face level:    handTargetY = -90  (forehead)
//   Chin level:    handTargetY = -40  (chin)
//   Neck level:    handTargetY = -20  (neck)
//   Chest level:   handTargetY =  20  (chest)
//   Neutral:       no handTargetY (use FK)
//
// IMPORTANT X targets (avatar center = 0, shoulder ~= ±75):
//   Center:        handTargetX = 0
//   Near mouth:    handTargetX = ±20
//   At forehead:   handTargetX = ±30

const POSES: Record<string, SignPose2D[]> = {

  // ── HELLO / Greeting ──────────────────────────────────────────────────────
  // Classic wave from forehead outward
  greeting: [
    {
      rightArm: arm(-0.9, 0.8, { ...B_HAND, palmFacing: 'forward' }, 0, -75, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: arrow(45, 'arc-up', 40),
      leftHandArrow: null,
      torsoBend: 0.03,
    },
    {
      rightArm: arm(-0.7, 0.7, { ...OPEN, palmFacing: 'forward' }, 0.2, -60, 60),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0.03,
    },
  ],

  // ── THANK YOU ─────────────────────────────────────────────────────────────
  // Flat hand from chin forward and down
  thankyou: [
    {
      rightArm: arm(-0.4, 1.1, { ...B_HAND, palmFacing: 'forward' }, 0, -35, 10),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: arrow(315, 'straight', 35),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.3, 0.7, { ...B_HAND, palmFacing: 'forward' }, 0, -10, 20),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── PLEASE / SORRY ────────────────────────────────────────────────────────
  // Flat hand circling chest
  please: [
    {
      rightArm: arm(-0.3, 1.2, { ...B_HAND, palmFacing: 'back' }, 0, 30, 0),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: SERIOUS,
      rightHandArrow: arrow(0, 'circular', 28),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── YES ───────────────────────────────────────────────────────────────────
  // Fist nod
  yes: [
    {
      rightArm: arm(-0.5, 0.9, { ...FIST, palmFacing: 'right' }, 0),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: arrow(270, 'arc-down', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.5, 1.0, { ...FIST, palmFacing: 'right' }, 0),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── NO ────────────────────────────────────────────────────────────────────
  // Index and middle fingers close like a snapping motion
  no: [
    {
      rightArm: arm(-0.7, 0.8, { ...POINT, palmFacing: 'forward' }, 0),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: SERIOUS,
      rightHandArrow: arrow(0, 'straight', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.7, 0.8, {
        thumb:  [0.5, 0.9, 0.7],
        index:  [0.7, 0.8, 0.6],
        middle: [0.7, 0.8, 0.6],
        ring:   [1.5, 1.5, 1.3],
        pinky:  [1.5, 1.4, 1.2],
        wristAngle: 0,
        palmFacing: 'forward',
      }, 0),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: SERIOUS,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── EAT / FOOD ────────────────────────────────────────────────────────────
  // Pinched hand moving to mouth
  food: [
    {
      rightArm: arm(-0.4, 1.3, { ...OK_HAND, palmFacing: 'back' }, 0, -40, 5),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: arrow(90, 'straight', 25),
      leftHandArrow: null,
      torsoBend: 0.03,
    },
    {
      rightArm: arm(-0.35, 1.4, { ...OK_HAND, palmFacing: 'back' }, 0, -45, 5),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0.03,
    },
  ],

  // ── DRINK / WATER ─────────────────────────────────────────────────────────
  // C-hand tipping like drinking from a cup
  drink: [
    {
      rightArm: arm(-0.3, 1.3, { ...C_HAND, palmFacing: 'left' }, 0, -30, 10),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(60, 'arc-up', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.2, 1.2, { ...C_HAND, palmFacing: 'left' }, -0.4, -45, 5),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── FAMILY ────────────────────────────────────────────────────────────────
  // Both hands form an F (or circle each other)
  family: [
    {
      rightArm: arm(-0.8, 1.0, { ...OK_HAND, palmFacing: 'forward' }),
      leftArm:  arm( 0.8, 1.0, { ...OK_HAND, palmFacing: 'forward' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'circular', 22),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-1.0, 1.0, { ...OK_HAND, palmFacing: 'forward' }),
      leftArm:  arm( 1.0, 1.0, { ...OK_HAND, palmFacing: 'forward' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── FATHER / DAD ──────────────────────────────────────────────────────────
  // Open-5 at forehead
  father: [
    {
      rightArm: arm(-0.5, 1.0, { ...FIVE, palmFacing: 'forward' }, 0, -75, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── MOTHER / MOM ──────────────────────────────────────────────────────────
  // Open-5 at chin
  mother: [
    {
      rightArm: arm(-0.4, 1.2, { ...FIVE, palmFacing: 'forward' }, 0, -40, 10),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── BROTHER ───────────────────────────────────────────────────────────────
  family_bro: [
    {
      rightArm: arm(-0.6, 1.1, { ...L_HAND, palmFacing: 'right' }, 0, -70, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.8, 1.0, { ...FIST, palmFacing: 'forward' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── SISTER ────────────────────────────────────────────────────────────────
  family_sis: [
    {
      rightArm: arm(-0.5, 1.2, { ...L_HAND, palmFacing: 'right' }, 0, -35, 10),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.8, 1.0, { ...OPEN, palmFacing: 'forward' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── SCHOOL / EDUCATION ────────────────────────────────────────────────────
  education: [
    {
      rightArm: arm(-1.0, 1.2, { ...FLAT_DOWN, palmFacing: 'down' }),
      leftArm:  arm( 0.5, 0.8, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: SERIOUS,
      rightHandArrow: arrow(180, 'straight', 32),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.7, 1.0, { ...POINT, palmFacing: 'forward' }),
      leftArm:  arm( 0.5, 0.8, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: SERIOUS,
      rightHandArrow: arrow(90, 'straight', 28),
      leftHandArrow: null,
      torsoBend: 0.04,
    },
  ],

  // ── TEACHER ───────────────────────────────────────────────────────────────
  teacher: [
    {
      rightArm: arm(-0.7, 1.1, { ...OK_HAND, palmFacing: 'forward' }, 0, -65, 30),
      leftArm:  arm( 0.7, 1.1, { ...OK_HAND, palmFacing: 'forward' }, 0, -65, -30),
      face: NEUTRAL,
      rightHandArrow: arrow(270, 'straight', 30),
      leftHandArrow:  arrow(270, 'straight', 30),
      torsoBend: 0,
    },
  ],

  // ── FRIEND ────────────────────────────────────────────────────────────────
  friend: [
    {
      rightArm: arm(-0.8, 1.0, { ...POINT, palmFacing: 'down' }),
      leftArm:  arm( 0.8, 1.0, { ...POINT, palmFacing: 'down' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 0.9, { ...POINT, palmFacing: 'up' }),
      leftArm:  arm( 0.6, 0.9, { ...POINT, palmFacing: 'up' }),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── HELP ──────────────────────────────────────────────────────────────────
  help: [
    {
      rightArm: arm(-0.7, 1.0, { ...FIST, palmFacing: 'up' }),
      leftArm:  arm( 0.6, 0.8, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 35),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── HOME ──────────────────────────────────────────────────────────────────
  home: [
    {
      rightArm: arm(-0.4, 1.3, { ...OK_HAND, palmFacing: 'forward' }, 0, -35, 15),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(45, 'straight', 22),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.5, 1.2, { ...FLAT_DOWN, palmFacing: 'down' }, 0, -60, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── WORK ──────────────────────────────────────────────────────────────────
  work: [
    {
      rightArm: arm(-0.6, 1.1, { ...FIST, palmFacing: 'down' }),
      leftArm:  arm( 0.6, 1.1, { ...FIST, palmFacing: 'up' }),
      face: SERIOUS,
      rightHandArrow: arrow(315, 'arc-down', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── HAPPY / EMOTION ───────────────────────────────────────────────────────
  emotion: [
    {
      rightArm: arm(-0.4, 1.3, { ...B_HAND, palmFacing: 'back' }, 0, 20, 0),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: arrow(90, 'circular', 22),
      leftHandArrow: null,
      torsoBend: 0.05,
    },
  ],

  // ── SAD ───────────────────────────────────────────────────────────────────
  sad: [
    {
      rightArm: arm(-0.6, 1.0, { ...OPEN, palmFacing: 'back' }, 0, -55, 15),
      leftArm:  arm( 0.6, 1.0, { ...OPEN, palmFacing: 'back' }, 0, -55, -15),
      face: { ...NEUTRAL, mouthCurve: -0.8, leftBrow: 0.6, rightBrow: 0.6 },
      rightHandArrow: arrow(270, 'straight', 28),
      leftHandArrow:  arrow(270, 'straight', 28),
      torsoBend: 0,
    },
  ],

  // ── GOOD ──────────────────────────────────────────────────────────────────
  good: [
    {
      rightArm: arm(-0.4, 1.2, { ...B_HAND, palmFacing: 'forward' }, 0, -35, 10),
      leftArm:  arm( 0.6, 0.9, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: HAPPY,
      rightHandArrow: arrow(315, 'straight', 30),
      leftHandArrow: null,
      torsoBend: 0.03,
    },
  ],

  // ── BAD ───────────────────────────────────────────────────────────────────
  bad: [
    {
      rightArm: arm(-0.4, 1.2, { ...B_HAND, palmFacing: 'back' }, 0, -35, 10),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: SERIOUS,
      rightHandArrow: arrow(270, 'straight', 28),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── BEAUTIFUL ─────────────────────────────────────────────────────────────
  beautiful: [
    {
      rightArm: arm(-0.3, 1.3, { ...FIVE, palmFacing: 'back' }, 0, -60, 0),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: HAPPY,
      rightHandArrow: arrow(0, 'circular', 35),
      leftHandArrow: null,
      torsoBend: 0.04,
    },
  ],

  // ── DOCTOR / HOSPITAL / HEALTH ─────────────────────────────────────────────
  health: [
    {
      rightArm: arm(-0.8, 1.1, { ...POINT, palmFacing: 'left' }),
      leftArm:  arm( 0.6, 0.8, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: SERIOUS,
      rightHandArrow: arrow(270, 'straight', 28),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── NATURE / ANIMALS ─────────────────────────────────────────────────────
  nature: [
    {
      rightArm: arm(-0.9, 1.0, { ...CURVED, palmFacing: 'down' }),
      leftArm:  arm( 0.9, 1.0, { ...CURVED, palmFacing: 'down' }),
      face: HAPPY,
      rightHandArrow: arrow(315, 'arc-down', 28),
      leftHandArrow:  arrow(225, 'arc-down', 28),
      torsoBend: 0,
    },
  ],

  // ── COLOR ─────────────────────────────────────────────────────────────────
  color: [
    {
      rightArm: arm(-0.5, 1.2, { ...FIVE, palmFacing: 'forward' }, 0, -35, 15),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: QUESTION,
      rightHandArrow: arrow(270, 'arc-down', 30),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── NUMBER / COUNT ────────────────────────────────────────────────────────
  number: [
    {
      rightArm: arm(-0.7, 1.0, { ...POINT, palmFacing: 'forward' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── TIME / DAY / WEEK / MONTH ─────────────────────────────────────────────
  time: [
    {
      rightArm: arm(-0.6, 1.1, { ...POINT, palmFacing: 'up' }),
      leftArm:  arm( 0.6, 0.8, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'circular', 28),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── RELIGION / CHURCH ────────────────────────────────────────────────────
  religion: [
    {
      rightArm: arm(-0.9, 1.1, { ...B_HAND, palmFacing: 'forward' }),
      leftArm:  arm( 0.9, 1.1, { ...B_HAND, palmFacing: 'forward' }),
      face: SERIOUS,
      rightHandArrow: arrow(90, 'straight', 30),
      leftHandArrow:  arrow(90, 'straight', 30),
      torsoBend: -0.08,
    },
  ],

  // ── PLACE / LOCATION / COUNTRY ────────────────────────────────────────────
  place: [
    {
      rightArm: arm(-0.7, 1.1, { ...C_HAND, palmFacing: 'right' }),
      leftArm:  arm( 0.7, 1.1, { ...C_HAND, palmFacing: 'left' }),
      face: NEUTRAL,
      rightHandArrow: arrow(270, 'straight', 28),
      leftHandArrow:  arrow(270, 'straight', 28),
      torsoBend: 0,
    },
  ],

  // ── WATER / RIVER / LAKE ──────────────────────────────────────────────────
  water: [
    {
      rightArm: arm(-0.4, 1.3, { ...THREE, palmFacing: 'forward' }, 0, -40, 10),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── BOOK / READ ───────────────────────────────────────────────────────────
  book: [
    {
      rightArm: arm(-0.7, 1.1, { ...FLAT_DOWN, palmFacing: 'up' }),
      leftArm:  arm( 0.7, 1.1, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 30),
      leftHandArrow:  arrow(180, 'straight', 30),
      torsoBend: 0,
    },
  ],

  // ── MORNING / MORNING ─────────────────────────────────────────────────────
  morning: [
    {
      rightArm: arm(-1.1, 0.6, { ...B_HAND, palmFacing: 'up' }),
      leftArm:  arm( 0.5, 0.9, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: HAPPY,
      rightHandArrow: arrow(90, 'straight', 35),
      leftHandArrow: null,
      torsoBend: -0.05,
    },
  ],

  // ── NIGHT / SLEEP ─────────────────────────────────────────────────────────
  night: [
    {
      rightArm: arm(-0.8, 1.0, { ...CURVED, palmFacing: 'down' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: { ...NEUTRAL, leftEye: -0.5, rightEye: -0.5 },
      rightHandArrow: arrow(270, 'arc-down', 28),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── LOVE ──────────────────────────────────────────────────────────────────
  love: [
    {
      rightArm: arm(-0.4, 1.4, { ...FIST, palmFacing: 'back' }, 0, 30, -5),
      leftArm:  arm( 0.4, 1.4, { ...FIST, palmFacing: 'back' }, 0, 30,  5),
      face: HAPPY,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── COME ──────────────────────────────────────────────────────────────────
  come: [
    {
      rightArm: arm(-1.1, 0.5, { ...POINT, palmFacing: 'forward' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(180, 'straight', 35),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── GO ────────────────────────────────────────────────────────────────────
  go: [
    {
      rightArm: arm(-0.9, 0.6, { ...POINT, palmFacing: 'forward' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 38),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── STOP ──────────────────────────────────────────────────────────────────
  stop: [
    {
      rightArm: arm(-0.9, 1.0, { ...B_HAND, palmFacing: 'up' }),
      leftArm:  arm( 0.6, 0.9, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: SERIOUS,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── I / ME (pronoun) ─────────────────────────────────────────────────────
  me: [
    {
      rightArm: arm(-0.3, 1.3, { ...POINT, palmFacing: 'back' }, 0, 25, -10),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── YOU (pronoun) ─────────────────────────────────────────────────────────
  you: [
    {
      rightArm: arm(-1.0, 0.4, { ...POINT, palmFacing: 'forward' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 28),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── WE / US ───────────────────────────────────────────────────────────────
  we: [
    {
      rightArm: arm(-0.5, 1.0, { ...POINT, palmFacing: 'forward' }, 0, -30, -30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(180, 'arc-down', 30),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],

  // ── DEFAULT fallback ──────────────────────────────────────────────────────
  default: [
    {
      rightArm: arm(-0.7, 1.0, { ...B_HAND, palmFacing: 'forward' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.9, 1.0, { ...OPEN, palmFacing: 'forward' }),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
};

// ─── GSL Number Poses (0–20, 30, 40, 50, 60, 70, 80, 90, 100, 1000) ───────────

export const NUMBER_POSES: Record<string, SignPose2D[]> = {
  '0': [
    {
      rightArm: arm(-0.6, 1.0, { ...O_HAND, palmFacing: 'forward' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '1': [
    {
      rightArm: arm(-0.6, 1.0, { ...POINT, palmFacing: 'forward' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '2': [
    {
      rightArm: arm(-0.6, 1.0, { ...PEACE, palmFacing: 'forward' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '3': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0, 0, 0],
        index: [0, 0, 0],
        middle: [0, 0, 0],
        ring: [1.5, 1.5, 1.3],
        pinky: [1.5, 1.4, 1.2],
        wristAngle: 0,
        palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '4': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [1.2, 1.2, 1.0],
        index: [0, 0, 0],
        middle: [0, 0, 0],
        ring: [0, 0, 0],
        pinky: [0, 0, 0],
        wristAngle: 0,
        palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '5': [
    {
      rightArm: arm(-0.6, 1.0, { ...OPEN, palmFacing: 'forward' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '6': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.6, 0.8, 0.6],
        index: [0, 0, 0],
        middle: [0, 0, 0],
        ring: [0, 0, 0],
        pinky: [1.1, 1.3, 1.0],
        wristAngle: 0,
        palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '7': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5],
        index: [0, 0, 0],
        middle: [0, 0, 0],
        ring: [1.1, 1.3, 1.0],
        pinky: [0, 0, 0],
        wristAngle: 0,
        palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '8': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5],
        index: [0, 0, 0],
        middle: [1.1, 1.3, 1.0],
        ring: [0, 0, 0],
        pinky: [0, 0, 0],
        wristAngle: 0,
        palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '9': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5],
        index: [1.1, 1.3, 1.0],
        middle: [0, 0, 0],
        ring: [0, 0, 0],
        pinky: [0, 0, 0],
        wristAngle: 0,
        palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '10': [
    {
      rightArm: arm(-0.6, 0.9, { ...FIST, thumb: [0, 0, 0], palmFacing: 'right' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(45, 'arc-up', 22),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 0.9, { ...FIST, thumb: [0, 0, 0], palmFacing: 'right' }, 0.35, -48, 28),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '11': [
    {
      rightArm: arm(-0.6, 1.0, { ...FIST, palmFacing: 'back' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...POINT, palmFacing: 'back' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '12': [
    {
      rightArm: arm(-0.6, 1.0, { ...FIST, palmFacing: 'back' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(90, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...PEACE, palmFacing: 'back' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '13': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0, 0, 0], index: [0, 0, 0], middle: [0, 0, 0],
        ring: [1.5, 1.5, 1.3], pinky: [1.5, 1.4, 1.2],
        wristAngle: 0, palmFacing: 'back',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(270, 'arc-down', 18),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0, 0, 0], index: [0.8, 0.8, 0.6], middle: [0.8, 0.8, 0.6],
        ring: [1.5, 1.5, 1.3], pinky: [1.5, 1.4, 1.2],
        wristAngle: 0, palmFacing: 'back',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '14': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [1.2, 1.2, 1.0], index: [0, 0, 0], middle: [0, 0, 0],
        ring: [0, 0, 0], pinky: [0, 0, 0],
        wristAngle: 0, palmFacing: 'back',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(270, 'arc-down', 18),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [1.2, 1.2, 1.0], index: [0.8, 0.8, 0.6], middle: [0.8, 0.8, 0.6],
        ring: [0.8, 0.8, 0.6], pinky: [0.8, 0.8, 0.6],
        wristAngle: 0, palmFacing: 'back',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '15': [
    {
      rightArm: arm(-0.6, 1.0, { ...OPEN, palmFacing: 'back' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(270, 'arc-down', 18),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0, 0, 0], index: [0.8, 0.8, 0.6], middle: [0.8, 0.8, 0.6],
        ring: [0.8, 0.8, 0.6], pinky: [0.8, 0.8, 0.6],
        wristAngle: 0, palmFacing: 'back',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '16': [
    {
      rightArm: arm(-0.6, 0.9, { ...FIST, thumb: [0, 0, 0], palmFacing: 'right' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(45, 'arc-up', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.6, 0.8, 0.6], index: [0, 0, 0], middle: [0, 0, 0],
        ring: [0, 0, 0], pinky: [1.1, 1.3, 1.0],
        wristAngle: 0.3, palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '17': [
    {
      rightArm: arm(-0.6, 0.9, { ...FIST, thumb: [0, 0, 0], palmFacing: 'right' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(45, 'arc-up', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5], index: [0, 0, 0], middle: [0, 0, 0],
        ring: [1.1, 1.3, 1.0], pinky: [0, 0, 0],
        wristAngle: 0.3, palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '18': [
    {
      rightArm: arm(-0.6, 0.9, { ...FIST, thumb: [0, 0, 0], palmFacing: 'right' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(45, 'arc-up', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5], index: [0, 0, 0], middle: [1.1, 1.3, 1.0],
        ring: [0, 0, 0], pinky: [0, 0, 0],
        wristAngle: 0.3, palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '19': [
    {
      rightArm: arm(-0.6, 0.9, { ...FIST, thumb: [0, 0, 0], palmFacing: 'right' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(45, 'arc-up', 25),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5], index: [1.1, 1.3, 1.0], middle: [0, 0, 0],
        ring: [0, 0, 0], pinky: [0, 0, 0],
        wristAngle: 0.3, palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '20': [
    {
      rightArm: arm(-0.6, 1.0, { ...L_HAND, palmFacing: 'forward' }, 0, -48, 25),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 18),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.4, 0.7, 0.5], index: [0.7, 0.9, 0.7], middle: [1.5, 1.5, 1.3],
        ring: [1.5, 1.5, 1.3], pinky: [1.5, 1.4, 1.2],
        wristAngle: 0, palmFacing: 'forward',
      }, 0, -48, 25),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '30': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0, 0, 0], index: [0, 0, 0], middle: [0, 0, 0],
        ring: [1.5, 1.5, 1.3], pinky: [1.5, 1.4, 1.2],
        wristAngle: 0, palmFacing: 'forward',
      }, 0, -48, 20),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 15),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...O_HAND, palmFacing: 'forward' }, 0, -48, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '40': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [1.2, 1.2, 1.0], index: [0, 0, 0], middle: [0, 0, 0],
        ring: [0, 0, 0], pinky: [0, 0, 0],
        wristAngle: 0, palmFacing: 'forward',
      }, 0, -48, 20),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 15),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...O_HAND, palmFacing: 'forward' }, 0, -48, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '50': [
    {
      rightArm: arm(-0.6, 1.0, { ...OPEN, palmFacing: 'forward' }, 0, -48, 20),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 15),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...O_HAND, palmFacing: 'forward' }, 0, -48, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '60': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.6, 0.8, 0.6], index: [0, 0, 0], middle: [0, 0, 0],
        ring: [0, 0, 0], pinky: [1.1, 1.3, 1.0],
        wristAngle: 0, palmFacing: 'forward',
      }, 0, -48, 20),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 15),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...O_HAND, palmFacing: 'forward' }, 0, -48, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '70': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5], index: [0, 0, 0], middle: [0, 0, 0],
        ring: [1.1, 1.3, 1.0], pinky: [0, 0, 0],
        wristAngle: 0, palmFacing: 'forward',
      }, 0, -48, 20),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 15),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...O_HAND, palmFacing: 'forward' }, 0, -48, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '80': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5], index: [0, 0, 0], middle: [1.1, 1.3, 1.0],
        ring: [0, 0, 0], pinky: [0, 0, 0],
        wristAngle: 0, palmFacing: 'forward',
      }, 0, -48, 20),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 15),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...O_HAND, palmFacing: 'forward' }, 0, -48, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '90': [
    {
      rightArm: arm(-0.6, 1.0, {
        thumb: [0.5, 0.7, 0.5], index: [1.1, 1.3, 1.0], middle: [0, 0, 0],
        ring: [0, 0, 0], pinky: [0, 0, 0],
        wristAngle: 0, palmFacing: 'forward',
      }, 0, -48, 20),
      leftArm: arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 15),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...O_HAND, palmFacing: 'forward' }, 0, -48, 30),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '100': [
    {
      rightArm: arm(-0.6, 1.0, { ...POINT, palmFacing: 'forward' }, 0, -48, 20),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.6, 1.0, { ...C_HAND, palmFacing: 'forward' }, 0, -48, 32),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: null,
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
  '1000': [
    {
      rightArm: arm(-0.6, 1.0, { ...POINT, palmFacing: 'forward' }, 0, -48, 20),
      leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
      face: NEUTRAL,
      rightHandArrow: arrow(0, 'straight', 20),
      leftHandArrow: null,
      torsoBend: 0,
    },
    {
      rightArm: arm(-0.5, 1.1, { ...FIST, palmFacing: 'down' }, 0, 25, 0),
      leftArm:  arm( 0.5, 0.9, { ...FLAT_DOWN, palmFacing: 'up' }),
      face: NEUTRAL,
      rightHandArrow: arrow(270, 'straight', 18),
      leftHandArrow: null,
      torsoBend: 0,
    },
  ],
};

// ─── Fingerspelling A–Z ────────────────────────────────────────────────────────

export const FINGERSPELL: Record<string, FingerPose> = {
  A: { ...FIST, thumb: [0, 0, 0], palmFacing: 'forward' },
  B: B_HAND,
  C: C_HAND,
  D: { thumb: [0.5, 1.0, 0.8], index: [0, 0.1, 0], middle: [0.9, 0.9, 0.7], ring: [0.9, 0.9, 0.7], pinky: [0.8, 0.8, 0.6], wristAngle: 0, palmFacing: 'forward' },
  E: { thumb: [0.6, 0.5, 0.4], index: [0.6, 1.1, 0.9], middle: [0.6, 1.1, 0.9], ring: [0.6, 1.1, 0.9], pinky: [0.5, 1.0, 0.8], wristAngle: 0, palmFacing: 'forward' },
  F: { thumb: [0.3, 0.8, 0.6], index: [0.6, 1.0, 0.8], middle: [0, 0, 0], ring: [0, 0, 0], pinky: [0, 0, 0], wristAngle: 0, palmFacing: 'forward' },
  G: { thumb: [0, 0, 0], index: [0, 0, 0], middle: [1.5, 1.5, 1.3], ring: [1.5, 1.5, 1.3], pinky: [1.5, 1.4, 1.2], wristAngle: 0, palmFacing: 'right' },
  H: { thumb: [0.5, 0.8, 0.6], index: [0, 0, 0], middle: [0, 0, 0], ring: [1.5, 1.5, 1.3], pinky: [1.5, 1.4, 1.2], wristAngle: 0, palmFacing: 'right' },
  I: { thumb: [0.6, 0.9, 0.7], index: [1.5, 1.5, 1.3], middle: [1.5, 1.5, 1.3], ring: [1.5, 1.5, 1.3], pinky: [0, 0, 0], wristAngle: 0, palmFacing: 'forward' },
  J: { thumb: [0.6, 0.9, 0.7], index: [1.5, 1.5, 1.3], middle: [1.5, 1.5, 1.3], ring: [1.5, 1.5, 1.3], pinky: [0, 0, 0], wristAngle: -0.4, palmFacing: 'forward' },
  K: L_HAND,
  L: L_HAND,
  M: { thumb: [0.4, 0.3, 0.2], index: [1.2, 1.3, 1.1], middle: [1.2, 1.3, 1.1], ring: [1.2, 1.3, 1.1], pinky: [1.4, 1.4, 1.2], wristAngle: 0, palmFacing: 'forward' },
  N: { thumb: [0.4, 0.3, 0.2], index: [1.2, 1.3, 1.1], middle: [1.2, 1.3, 1.1], ring: [1.4, 1.4, 1.2], pinky: [1.4, 1.4, 1.2], wristAngle: 0, palmFacing: 'forward' },
  O: O_HAND,
  P: POINT,
  Q: { thumb: [0, 0, 0], index: [0, 0, 0], middle: [1.5, 1.5, 1.3], ring: [1.5, 1.5, 1.3], pinky: [1.5, 1.4, 1.2], wristAngle: 0, palmFacing: 'down' },
  R: { thumb: [0.6, 0.8, 0.6], index: [0, 0.15, 0], middle: [0.2, 0, 0], ring: [1.5, 1.5, 1.3], pinky: [1.5, 1.4, 1.2], wristAngle: 0.25, palmFacing: 'forward' },
  S: { thumb: [0.3, 0.2, 0.1], index: [1.4, 1.4, 1.2], middle: [1.4, 1.4, 1.2], ring: [1.4, 1.4, 1.2], pinky: [1.4, 1.3, 1.1], wristAngle: 0, palmFacing: 'forward' },
  T: { thumb: [0.15, 0.1, 0.05], index: [1.1, 1.3, 1.1], middle: [1.4, 1.4, 1.2], ring: [1.4, 1.4, 1.2], pinky: [1.4, 1.3, 1.1], wristAngle: 0, palmFacing: 'forward' },
  U: PEACE,
  V: PEACE,
  W: THREE,
  X: { thumb: [0.5, 0.8, 0.6], index: [0.7, 1.1, 0.9], middle: [1.4, 1.4, 1.2], ring: [1.4, 1.4, 1.2], pinky: [1.4, 1.3, 1.1], wristAngle: 0, palmFacing: 'forward' },
  Y: Y_HAND,
  Z: POINT,
};

// ─── Pose selection ────────────────────────────────────────────────────────────

function getPoses(sign: GSLSearchIndexItem | null): SignPose2D[] {
  if (!sign) return POSES.default;

  const w   = (sign.normalizedWord   || '').toLowerCase();
  const cat = (sign.categorySlug     || '').toLowerCase();
  const def = (sign.definition       || '').toLowerCase();

  // Exact word matches first
  if (w === 'hello' || w === 'hi' || w === 'welcome') return POSES.greeting;
  if (w === 'thank' || w === 'thanks' || w.startsWith('thank')) return POSES.thankyou;
  if (w === 'please' || w === 'sorry' || w === 'excuse') return POSES.please;
  if (w === 'yes' || w === 'okay' || w === 'ok') return POSES.yes;
  if (w === 'no' || w === 'not' || w === 'never') return POSES.no;
  if (w === 'eat' || w === 'food' || w === 'meal') return POSES.food;
  if (w === 'drink' || w === 'water' || w === 'cup') return POSES.drink;
  if (w === 'water' || w === 'river' || w === 'lake' || w === 'sea') return POSES.water;
  if (w === 'father' || w === 'dad' || w === 'papa') return POSES.father;
  if (w === 'mother' || w === 'mom' || w === 'mama') return POSES.mother;
  if (w === 'brother') return POSES.family_bro;
  if (w === 'sister') return POSES.family_sis;
  if (w === 'family') return POSES.family;
  if (w === 'friend') return POSES.friend;
  if (w === 'teacher') return POSES.teacher;
  if (w === 'school' || w === 'class' || w === 'study' || w === 'learn') return POSES.education;
  if (w === 'book' || w === 'read' || w === 'write') return POSES.book;
  if (w === 'help' || w === 'assist') return POSES.help;
  if (w === 'home' || w === 'house') return POSES.home;
  if (w === 'work' || w === 'job') return POSES.work;
  if (w === 'good' || w === 'great' || w === 'fine') return POSES.good;
  if (w === 'bad' || w === 'wrong' || w === 'evil') return POSES.bad;
  if (w === 'happy' || w === 'joy') return POSES.emotion;
  if (w === 'sad' || w === 'cry' || w === 'unhappy') return POSES.sad;
  if (w === 'love' || w === 'like') return POSES.love;
  if (w === 'beautiful' || w === 'pretty') return POSES.beautiful;
  if (w === 'morning') return POSES.morning;
  if (w === 'night' || w === 'sleep' || w === 'evening') return POSES.night;
  if (w === 'come' || w === 'here') return POSES.come;
  if (w === 'go' || w === 'leave' || w === 'walk') return POSES.go;
  if (w === 'stop' || w === 'wait') return POSES.stop;
  if (w === 'i' || w === 'me' || w === 'my' || w === 'mine') return POSES.me;
  if (w === 'you' || w === 'your') return POSES.you;
  if (w === 'we' || w === 'us' || w === 'our') return POSES.we;

  // Category fallbacks
  if (cat.includes('greet') || cat.includes('communic')) return POSES.greeting;
  if (cat.includes('family') || cat.includes('people')) return POSES.family;
  if (cat.includes('school') || cat.includes('educat')) return POSES.education;
  if (cat.includes('health') || cat.includes('medical') || cat.includes('doctor')) return POSES.health;
  if (cat.includes('food') || cat.includes('eat') || cat.includes('drink')) return POSES.food;
  if (cat.includes('animal') || cat.includes('nature') || cat.includes('tree')) return POSES.nature;
  if (cat.includes('color') || cat.includes('colour')) return POSES.color;
  if (cat.includes('number') || cat.includes('numer')) return POSES.number;
  if (cat.includes('time') || cat.includes('day') || cat.includes('week')) return POSES.time;
  if (cat.includes('emotion') || cat.includes('feeling')) return POSES.emotion;
  if (cat.includes('religion') || cat.includes('church')) return POSES.religion;
  if (cat.includes('place') || cat.includes('location') || cat.includes('country')) return POSES.place;

  // Definition keyword fallbacks
  if (def.includes('circle') || def.includes('round')) {
    return [{ ...POSES.default[0], rightHandArrow: arrow(0, 'circular', 28) }];
  }
  if (def.includes('mouth') || def.includes('lips') || def.includes('chin')) {
    return [{ ...POSES.thankyou[0] }];
  }
  if (def.includes('forehead') || def.includes('head') || def.includes('temple')) {
    return [{ ...POSES.father[0] }];
  }
  if (def.includes('chest') || def.includes('heart')) {
    return [{ ...POSES.love[0] }];
  }

  return POSES.default;
}

// ─── Number Sign Sequence Builder ─────────────────────────────────────────────

export function getNumberSignSequence(numStr: string, numVal: number): SignSequence {
  // Check single number key in NUMBER_POSES
  if (NUMBER_POSES[numStr]) {
    const poses = NUMBER_POSES[numStr];
    const frames: AvatarSignFrame[] = [
      ...poses.map((pose, i) => ({
        pose,
        duration: 1200,
        label: `${numVal} · GSL Number`,
      })),
      { pose: poses[poses.length - 1], duration: 400, label: 'hold' },
    ];
    return {
      word: `${numVal}`,
      sign: null,
      frames,
      duration: frames.reduce((s, f) => s + f.duration, 0),
    };
  }

  // Compound multi-digit number (e.g. "42", "2024"): sign each digit in sequence
  const digits = numStr.split('');
  const frames: AvatarSignFrame[] = [];

  digits.forEach((d, idx) => {
    const dPoses = NUMBER_POSES[d] || NUMBER_POSES['0'];
    frames.push({
      pose: dPoses[0],
      duration: 500,
      label: `Digit ${d} (${idx + 1}/${digits.length})`,
    });
    // Brief fluid transition between digits
    if (idx < digits.length - 1) {
      frames.push({
        pose: {
          ...dPoses[0],
          rightArm: {
            ...dPoses[0].rightArm,
            handTargetY: (dPoses[0].rightArm.handTargetY || -48) + 6,
          },
        },
        duration: 110,
        label: 'transit',
      });
    }
  });

  frames.push({ pose: NEUTRAL_POSE, duration: 250, label: 'rest' });

  return {
    word: `${numVal}`,
    sign: null,
    frames,
    duration: frames.reduce((s, f) => s + f.duration, 0),
  };
}

export function buildSignSequence(
  word: string,
  sign: GSLSearchIndexItem | null,
  searchIndex?: GSLSearchIndexItem[]
): SignSequence {
  const norm = word.trim().toLowerCase();

  // 1. Check if word is a number (numeric digits or English number word)
  const numVal = parseNumberInput(norm);
  if (numVal !== null) {
    return getNumberSignSequence(`${numVal}`, numVal);
  }

  // 2. Exact or typo-tolerant dictionary sign
  let matchedSign = sign;
  let isTypoCorrection = false;

  if (!matchedSign && searchIndex && searchIndex.length > 0) {
    const typoCheck = matchCloseVocabulary(word, searchIndex, 1);
    if (typoCheck.bestMatch && typoCheck.confidence >= 0.58) {
      matchedSign = typoCheck.bestMatch;
      isTypoCorrection = true;
    }
  }

  // 3. Fallback to fingerspelling if word has no sign match
  if (!matchedSign && word.length > 0 && !getPoses(null).length) {
    const letters = word.toUpperCase().split('');
    const frames: AvatarSignFrame[] = [
      { pose: NEUTRAL_POSE, duration: 180, label: 'ready' },
    ];
    letters.forEach((ch) => {
      const fpose = FINGERSPELL[ch] || OPEN;
      frames.push({
        pose: {
          rightArm: arm(-0.6, 1.0, fpose, 0, 10, 25),
          leftArm:  arm( 0.2, 0.3, { ...OPEN, palmFacing: 'back' }),
          face: NEUTRAL,
          rightHandArrow: null,
          leftHandArrow: null,
          torsoBend: 0,
        },
        duration: 380,
        label: `Spell: ${ch}`,
      });
    });
    frames.push({ pose: NEUTRAL_POSE, duration: 220, label: 'rest' });
    return {
      word,
      sign: null,
      frames,
      duration: frames.reduce((s, f) => s + f.duration, 0),
    };
  }

  const poses = getPoses(matchedSign);
  const frameDuration = 480;

  const frames: AvatarSignFrame[] = [
    { pose: NEUTRAL_POSE, duration: 180, label: 'ready' },
    ...poses.map((pose, i) => ({
      pose,
      duration: frameDuration,
      label: isTypoCorrection
        ? `sign-${i + 1} (${matchedSign?.primaryWord})`
        : `sign-${i + 1}`,
    })),
    { pose: NEUTRAL_POSE, duration: 260, label: 'rest' },
  ];

  return {
    word,
    sign: matchedSign,
    frames,
    duration: frames.reduce((s, f) => s + f.duration, 0),
  };
}

// ─── Rig Configuration ─────────────────────────────────────────────────────────

export function buildAvatarRig(canvas: HTMLCanvasElement): AvatarRig {
  const ctx = canvas.getContext('2d')!;
  const w   = canvas.width  || 500;
  const h   = canvas.height || 420;
  return { canvas, ctx, width: w, height: h };
}

// ─── Avatar Geometry Constants ─────────────────────────────────────────────────

const AV = {
  // Layout
  SHOULDER_Y:    0,
  SHOULDER_W:   75,   // half-width of shoulders
  NECK_H:       30,   // neck height above shoulders
  HEAD_H:       65,   // head oval half-height
  HEAD_W:       46,   // head oval half-width
  TORSO_H:     120,   // torso height below shoulders
  TORSO_BOT_W:  55,   // torso half-width at waist
  UPPER_ARM:    68,   // upper arm bone length
  FORE_ARM:     60,   // forearm bone length
  // Colors (Rylo-inspired clean light theme)
  BODY:      '#1a1a2e',
  BODY_FILL: 'rgba(235,242,255,0.7)',
  SKIN:      '#e8c9a0',
  SKIN_LIGHT:'#fae5cf',
  SKIN_SHADOW:'#d4b082',
  BONE_R:    '#ef4444',
  BONE_R_HL: '#fca5a5',
  BONE_L:    '#22c55e',
  BONE_L_HL: '#86efac',
  JOINT:     '#3b82f6',
  JOINT_W:   '#ffffff',
  THUMB_C:   '#a855f7',
  INDEX_C:   '#3b82f6',
  MIDDLE_C:  '#22c55e',
  RING_C:    '#f97316',
  PINKY_C:   '#ec4899',
  ARROW_R:   'rgba(59,130,246,0.95)',
  ARROW_L:   'rgba(34,197,94,0.95)',
  FACE_LINE: '#1a1a2e',
};

// ─── Analytic 2-Bone Inverse Kinematics (IK) ───────────────────────────────────

/**
 * Solves 2-bone analytical inverse kinematics for human arm anatomy.
 * Given shoulder (sx, sy) and target wrist (tx, ty), computes the natural
 * outward elbow position (elbowX, elbowY) with non-stretching bone lengths.
 */
export function solve2BoneIK(
  sx: number, sy: number,
  tx: number, ty: number,
  l1: number, l2: number,
  isRight: boolean
): { elbowX: number; elbowY: number; wristX: number; wristY: number } {
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.hypot(dx, dy);

  // Clamp reach within physical limits
  const minReach = Math.abs(l1 - l2) + 2.0;
  const maxReach = (l1 + l2) - 0.8;
  const clampedDist = Math.max(minReach, Math.min(dist, maxReach));

  // Law of Cosines: l2^2 = l1^2 + d^2 - 2*l1*d*cos(alpha)
  const cosAlpha = (l1 * l1 + clampedDist * clampedDist - l2 * l2) / (2 * l1 * clampedDist);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));
  const baseAngle = Math.atan2(dy, dx);

  // Outward elbow bend: right arm bends screen-left (-), left arm bends screen-right (+)
  const bendSign = isRight ? -1 : 1;
  const elbowAngle = baseAngle + bendSign * alpha;

  const elbowX = sx + Math.cos(elbowAngle) * l1;
  const elbowY = sy + Math.sin(elbowAngle) * l1;

  const wristX = sx + (dx / (dist || 1)) * clampedDist;
  const wristY = sy + (dy / (dist || 1)) * clampedDist;

  return { elbowX, elbowY, wristX, wristY };
}

/**
 * Computes screen-space arm joint coordinates.
 * Seamlessly integrates 2-bone IK whenever an absolute wrist target is specified,
 * and standard screen-space forward-kinematics when floating.
 */
function computeArmFK(
  sx: number, sy: number,
  a: ArmPose,
  isRight: boolean
): { elbowX: number; elbowY: number; wristX: number; wristY: number; handAngle: number } {
  const sign = isRight ? -1 : 1;

  if (a.handTargetX !== undefined || a.handTargetY !== undefined) {
    const tX = a.handTargetX !== undefined ? a.handTargetX * sign : sx + sign * 20;
    const tY = a.handTargetY !== undefined ? a.handTargetY : 35;

    const ik = solve2BoneIK(sx, sy, tX, tY, AV.UPPER_ARM, AV.FORE_ARM, isRight);
    const handAngle = Math.atan2(ik.wristY - ik.elbowY, ik.wristX - ik.elbowX) + a.wristAngle;
    return { ...ik, handAngle };
  }

  // Forward Kinematics fallback
  const uaAngle = Math.PI / 2 + sign * a.shoulderAngle;
  const elbowX = sx + Math.cos(uaAngle) * AV.UPPER_ARM;
  const elbowY = sy + Math.sin(uaAngle) * AV.UPPER_ARM;

  const faAngle = uaAngle - a.elbowAngle * sign;
  const wristX = elbowX + Math.cos(faAngle) * AV.FORE_ARM;
  const wristY = elbowY + Math.sin(faAngle) * AV.FORE_ARM;

  const handAngle = Math.atan2(wristY - elbowY, wristX - elbowX) + a.wristAngle;
  return { elbowX, elbowY, wristX, wristY, handAngle };
}

// ─── Fluid Interpolation Engine ────────────────────────────────────────────────

function ln(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Natural relaxed hand shape used for secondary transit finger relaxation.
 */
const RELAXED_TRANSIT: FingerPose = {
  thumb:  [0.25, 0.35, 0.25],
  index:  [0.35, 0.45, 0.35],
  middle: [0.38, 0.48, 0.38],
  ring:   [0.40, 0.50, 0.40],
  pinky:  [0.35, 0.45, 0.35],
  wristAngle: 0,
  palmFacing: 'forward',
};

function blendFingerWithRelaxed(finger: FingerPose, weight: number): FingerPose {
  const w = Math.max(0, Math.min(1, weight));
  const b = (cur: [number, number, number], rel: [number, number, number]): [number, number, number] => [
    ln(cur[0], rel[0], w),
    ln(cur[1], rel[1], w),
    ln(cur[2], rel[2], w),
  ];
  return {
    thumb:  b(finger.thumb, RELAXED_TRANSIT.thumb),
    index:  b(finger.index, RELAXED_TRANSIT.index),
    middle: b(finger.middle, RELAXED_TRANSIT.middle),
    ring:   b(finger.ring, RELAXED_TRANSIT.ring),
    pinky:  b(finger.pinky, RELAXED_TRANSIT.pinky),
    wristAngle: finger.wristAngle,
    palmFacing: finger.palmFacing,
  };
}

function lerpFinger(a: FingerPose, b: FingerPose, t: number): FingerPose {
  return {
    thumb:  a.thumb.map((v, i)  => ln(v, b.thumb[i], t))  as [number, number, number],
    index:  a.index.map((v, i)  => ln(v, b.index[i], t))  as [number, number, number],
    middle: a.middle.map((v, i) => ln(v, b.middle[i], t)) as [number, number, number],
    ring:   a.ring.map((v, i)   => ln(v, b.ring[i], t))   as [number, number, number],
    pinky:  a.pinky.map((v, i)  => ln(v, b.pinky[i], t))  as [number, number, number],
    wristAngle: ln(a.wristAngle, b.wristAngle, t),
    palmFacing: t < 0.5 ? a.palmFacing : b.palmFacing,
  };
}

/**
 * Interpolates arms using curved 3D/2D parabolic arcs and secondary finger relaxation.
 * Eliminates rigid linear movement and mimics the fluid arcs of human signers.
 */
function lerpArm(
  a: ArmPose,
  b: ArmPose,
  t: number,
  isRight: boolean,
  sx: number,
  sy: number
): ArmPose {
  const posA = computeArmFK(sx, sy, a, isRight);
  const posB = computeArmFK(sx, sy, b, isRight);

  const dx = posB.wristX - posA.wristX;
  const dy = posB.wristY - posA.wristY;
  const dist = Math.hypot(dx, dy);

  // Parabolic upward arc lift: human arms naturally lift during travel
  const arcLift = -Math.sin(Math.PI * t) * Math.min(26, Math.max(5, dist * 0.22));
  // Outward lateral flare
  const sign = isRight ? -1 : 1;
  const arcOut = Math.sin(Math.PI * t) * sign * Math.min(14, dist * 0.09);

  const targetX = ln(posA.wristX, posB.wristX, t) + arcOut;
  const targetY = ln(posA.wristY, posB.wristY, t) + arcLift;

  // Secondary finger transit relaxation: fingers soften mid-flight and snap into place at arrival
  let handPose: FingerPose;
  if (t > 0.15 && t < 0.78) {
    const transitWeight = Math.sin(((t - 0.15) / 0.63) * Math.PI);
    const directLerp = lerpFinger(a.hand, b.hand, t);
    handPose = blendFingerWithRelaxed(directLerp, transitWeight * 0.42);
  } else {
    handPose = lerpFinger(a.hand, b.hand, t);
  }

  // Trailing wrist flex lag
  const wristTrailingLag = Math.sin(Math.PI * t) * (dy * 0.0018);

  return {
    shoulderAngle: ln(a.shoulderAngle, b.shoulderAngle, t),
    elbowAngle:    ln(a.elbowAngle,    b.elbowAngle,    t),
    wristAngle:    ln(a.wristAngle,    b.wristAngle,    t) + wristTrailingLag,
    hand: handPose,
    handTargetX: targetX * (isRight ? -1 : 1),
    handTargetY: targetY,
  };
}

function lerpFace(a: FaceExpression, b: FaceExpression, t: number): FaceExpression {
  return {
    leftBrow:   ln(a.leftBrow,   b.leftBrow,   t),
    rightBrow:  ln(a.rightBrow,  b.rightBrow,  t),
    leftEye:    ln(a.leftEye,    b.leftEye,    t),
    rightEye:   ln(a.rightEye,   b.rightEye,   t),
    mouthOpen:  ln(a.mouthOpen,  b.mouthOpen,  t),
    mouthCurve: ln(a.mouthCurve, b.mouthCurve, t),
    headTilt:   ln(a.headTilt,   b.headTilt,   t),
  };
}

export function interpolatePose(a: SignPose2D, b: SignPose2D, t: number): SignPose2D {
  const rightArm = lerpArm(a.rightArm, b.rightArm, t, true,  -AV.SHOULDER_W, AV.SHOULDER_Y);
  const leftArm  = lerpArm(a.leftArm,  b.leftArm,  t, false,  AV.SHOULDER_W, AV.SHOULDER_Y);
  const face     = lerpFace(a.face, b.face, t);

  // Subtle weight shifting: when hand reaches high, torso subtly counter-balances
  const rightHeightBonus = rightArm.handTargetY !== undefined && rightArm.handTargetY < -30 ? -0.025 : 0;
  const torsoBend = ln(a.torsoBend, b.torsoBend, t) + rightHeightBonus * Math.sin(Math.PI * t);

  return {
    rightArm,
    leftArm,
    face,
    rightHandArrow: t > 0.35 && t < 0.95 ? (b.rightHandArrow || a.rightHandArrow) : null,
    leftHandArrow:  t > 0.35 && t < 0.95 ? (b.leftHandArrow  || a.leftHandArrow)  : null,
    torsoBend,
  };
}

// ─── Rendering Engine ──────────────────────────────────────────────────────────

export function applyPoseToRig(rig: AvatarRig, pose: SignPose2D): void {
  const { ctx, width, height } = rig;
  ctx.clearRect(0, 0, width, height);

  // Clean light canvas background
  ctx.fillStyle = '#f8faff';
  ctx.fillRect(0, 0, width, height);

  // Subtle dot grid
  ctx.fillStyle = 'rgba(100,130,180,0.12)';
  for (let x = 20; x < width; x += 28) {
    for (let y = 20; y < height; y += 28) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Scale to fit canvas
  const scale = Math.min(width / 340, height / 360) * 0.88;
  const cx    = width  / 2;
  const cy    = height * 0.44;

  // Natural subtle breathing
  const now = performance.now();
  const breathY = Math.sin(now * 0.0016) * 1.5;

  ctx.save();
  ctx.translate(cx, cy + breathY);
  ctx.scale(scale, scale);
  ctx.rotate(pose.torsoBend);

  drawAvatarBody(ctx, pose, now);

  ctx.restore();
}

function drawAvatarBody(ctx: CanvasRenderingContext2D, pose: SignPose2D, timeNow: number): void {
  const f = pose.face;

  // ── 1. TORSO ──────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(-AV.SHOULDER_W, AV.SHOULDER_Y);
  ctx.lineTo( AV.SHOULDER_W, AV.SHOULDER_Y);
  ctx.lineTo( AV.TORSO_BOT_W, AV.TORSO_H);
  ctx.lineTo(-AV.TORSO_BOT_W, AV.TORSO_H);
  ctx.closePath();
  ctx.strokeStyle = AV.BODY;
  ctx.lineWidth   = 5;
  ctx.lineJoin    = 'round';
  ctx.stroke();
  ctx.fillStyle = AV.BODY_FILL;
  ctx.fill();

  // Shoulder line
  ctx.beginPath();
  ctx.moveTo(-AV.SHOULDER_W, AV.SHOULDER_Y);
  ctx.lineTo( AV.SHOULDER_W, AV.SHOULDER_Y);
  ctx.strokeStyle = AV.BODY;
  ctx.lineWidth   = 5;
  ctx.stroke();

  // ── 2. NECK ───────────────────────────────────────────────────────────────
  const neckTopX = Math.sin(f.headTilt) * 8;
  const neckTopY = -(AV.NECK_H + AV.HEAD_H * 0.85);

  ctx.beginPath();
  ctx.moveTo(-5, AV.SHOULDER_Y);
  ctx.lineTo(neckTopX - 5, neckTopY);
  ctx.moveTo( 5, AV.SHOULDER_Y);
  ctx.lineTo(neckTopX + 5, neckTopY);
  ctx.strokeStyle = AV.BODY;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // ── 3. HEAD ───────────────────────────────────────────────────────────────
  const headCX = neckTopX;
  const headCY = -(AV.NECK_H + AV.HEAD_H * 1.05);

  ctx.save();
  ctx.translate(headCX, headCY);
  ctx.rotate(f.headTilt);

  // Head oval with subtle gradient
  ctx.beginPath();
  ctx.ellipse(0, 0, AV.HEAD_W, AV.HEAD_H, 0, 0, Math.PI * 2);
  ctx.strokeStyle = AV.FACE_LINE;
  ctx.lineWidth   = 4;
  ctx.stroke();

  const headGrad = ctx.createRadialGradient(-10, -15, 5, 0, 0, AV.HEAD_H);
  headGrad.addColorStop(0, AV.SKIN_LIGHT);
  headGrad.addColorStop(1, AV.SKIN);
  ctx.fillStyle = headGrad;
  ctx.fill();

  drawFace(ctx, f, timeNow);
  ctx.restore();

  // ── 4. ARMS ───────────────────────────────────────────────────────────────
  // Right arm: shoulder at (-SHOULDER_W, 0) — screen LEFT
  drawArm(ctx, -AV.SHOULDER_W, AV.SHOULDER_Y, pose.rightArm, true, pose.rightHandArrow);

  // Left arm: shoulder at (+SHOULDER_W, 0) — screen RIGHT
  drawArm(ctx,  AV.SHOULDER_W, AV.SHOULDER_Y, pose.leftArm, false, pose.leftHandArrow);
}

function drawFace(ctx: CanvasRenderingContext2D, f: FaceExpression, timeNow: number): void {
  const HW = AV.HEAD_W;

  // ── Periodic Eye Blinking ────────────────────────────────────────────────
  // Every ~3.5s, eyes blink for ~90ms
  const isBlinking = (timeNow % 3600) < 95;

  // ── Eyebrows ─────────────────────────────────────────────────────────────
  const lBy = -22 - f.leftBrow  * 9;
  const rBy = -22 - f.rightBrow * 9;

  ctx.strokeStyle = AV.FACE_LINE;
  ctx.lineWidth   = 3.5;
  ctx.lineCap     = 'round';

  // Left brow (screen left = avatar's right)
  ctx.beginPath();
  ctx.moveTo(-HW * 0.65, lBy + 4);
  ctx.quadraticCurveTo(-HW * 0.38, lBy - 2, -HW * 0.12, lBy + 2);
  ctx.stroke();

  // Right brow
  ctx.beginPath();
  ctx.moveTo(HW * 0.12, rBy + 2);
  ctx.quadraticCurveTo(HW * 0.38, rBy - 2, HW * 0.65, rBy + 4);
  ctx.stroke();

  // ── Eyes ──────────────────────────────────────────────────────────────────
  const baseEyeH = isBlinking ? 1.0 : Math.max(2, 7 * (0.5 + f.leftEye * 0.35));
  const reyeH    = isBlinking ? 1.0 : Math.max(2, 7 * (0.5 + f.rightEye * 0.35));

  // Left eye
  ctx.beginPath();
  ctx.ellipse(-HW * 0.38, -8, 9, baseEyeH, 0, 0, Math.PI * 2);
  ctx.strokeStyle = AV.FACE_LINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.fill();

  if (!isBlinking) {
    ctx.beginPath();
    ctx.ellipse(-HW * 0.38, -8, 4.5, Math.max(1, baseEyeH * 0.75), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a3e';
    ctx.fill();

    // Specular catchlight
    ctx.beginPath();
    ctx.ellipse(-HW * 0.36, -10, 1.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  // Right eye
  ctx.beginPath();
  ctx.ellipse(HW * 0.38, -8, 9, reyeH, 0, 0, Math.PI * 2);
  ctx.strokeStyle = AV.FACE_LINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.fill();

  if (!isBlinking) {
    ctx.beginPath();
    ctx.ellipse(HW * 0.38, -8, 4.5, Math.max(1, reyeH * 0.75), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a3e';
    ctx.fill();

    // Specular catchlight
    ctx.beginPath();
    ctx.ellipse(HW * 0.40, -10, 1.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  // ── Nose ──────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(-4, 2);
  ctx.quadraticCurveTo(-8, 16, 0, 20);
  ctx.quadraticCurveTo(8, 16, 4, 2);
  ctx.strokeStyle = AV.FACE_LINE;
  ctx.lineWidth   = 1.8;
  ctx.stroke();

  // ── Mouth ─────────────────────────────────────────────────────────────────
  const mOpen = Math.max(0, f.mouthOpen) * 11;
  const mCurve = f.mouthCurve * 9;
  const mY = 30;

  if (mOpen > 2) {
    ctx.beginPath();
    ctx.ellipse(0, mY + mOpen * 0.3, 14, mOpen, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2d0a00';
    ctx.fill();
    ctx.strokeStyle = AV.FACE_LINE;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-16, mY);
    ctx.quadraticCurveTo(0, mY + mCurve, 16, mY);
    ctx.strokeStyle = AV.FACE_LINE;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number,
  armPose: ArmPose,
  isRight: boolean,
  arrowDef: MovementArrow | null | undefined
): void {
  const boneColor = isRight ? AV.BONE_R : AV.BONE_L;
  const boneHighlight = isRight ? AV.BONE_R_HL : AV.BONE_L_HL;
  const { elbowX, elbowY, wristX, wristY, handAngle } = computeArmFK(sx, sy, armPose, isRight);

  // ── Upper Arm (tapered capsule with highlight) ───────────────────────────
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(elbowX, elbowY);
  ctx.strokeStyle = boneColor;
  ctx.lineWidth   = 11;
  ctx.lineCap     = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(elbowX, elbowY);
  ctx.strokeStyle = boneHighlight;
  ctx.lineWidth   = 3;
  ctx.lineCap     = 'round';
  ctx.stroke();

  // Shoulder Joint
  ctx.beginPath();
  ctx.arc(sx, sy, 8, 0, Math.PI * 2);
  ctx.fillStyle = AV.JOINT;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx - 1.5, sy - 1.5, 3, 0, Math.PI * 2);
  ctx.fillStyle = AV.JOINT_W;
  ctx.fill();

  // Elbow Joint
  ctx.beginPath();
  ctx.arc(elbowX, elbowY, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = AV.JOINT;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(elbowX - 1.2, elbowY - 1.2, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = AV.JOINT_W;
  ctx.fill();

  // ── Forearm (tapered capsule) ───────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY);
  ctx.lineTo(wristX, wristY);
  ctx.strokeStyle = boneColor;
  ctx.lineWidth   = 9;
  ctx.lineCap     = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY);
  ctx.lineTo(wristX, wristY);
  ctx.strokeStyle = boneHighlight;
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = 'round';
  ctx.stroke();

  // Wrist Joint
  ctx.beginPath();
  ctx.arc(wristX, wristY, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = AV.JOINT;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(wristX - 1, wristY - 1, 2, 0, Math.PI * 2);
  ctx.fillStyle = AV.JOINT_W;
  ctx.fill();

  // ── Hand + Fingers ────────────────────────────────────────────────────────
  drawHand(ctx, wristX, wristY, armPose.hand, isRight, handAngle);

  // ── Directional Movement Arrow ───────────────────────────────────────────
  if (arrowDef) {
    drawMovementArrow(ctx, wristX, wristY, arrowDef, isRight);
  }
}

// ─── Hand & Finger Geometry ────────────────────────────────────────────────────

const FINGER_COLORS = [AV.THUMB_C, AV.INDEX_C, AV.MIDDLE_C, AV.RING_C, AV.PINKY_C];

const FINGER_SEGS: [number, number, number][] = [
  [18, 14, 10],  // thumb
  [22, 18, 13],  // index
  [24, 19, 14],  // middle
  [21, 17, 12],  // ring
  [17, 13, 10],  // pinky
];

const FINGER_SPREAD = [-0.55, -0.28, 0, 0.28, 0.55];

function drawHand(
  ctx: CanvasRenderingContext2D,
  wx: number, wy: number,
  hand: FingerPose,
  isRight: boolean,
  handAngle: number
): void {
  const PALM_W = 23;
  const PALM_H = 21;

  const fwdX  = Math.cos(handAngle);
  const fwdY  = Math.sin(handAngle);
  const latX  = -Math.sin(handAngle) * (isRight ? 1 : -1);
  const latY  =  Math.cos(handAngle) * (isRight ? 1 : -1);

  const palmCX = wx + fwdX * 9;
  const palmCY = wy + fwdY * 9;

  // Draw contoured palm with skin gradient
  ctx.save();
  ctx.translate(palmCX, palmCY);
  ctx.rotate(handAngle + (isRight ? 0 : Math.PI));

  ctx.beginPath();
  ctx.roundRect(-PALM_W * 0.8, -PALM_H * 0.28, PALM_W * 1.6, PALM_H, 6);
  ctx.fillStyle = AV.SKIN;
  ctx.strokeStyle = AV.BODY;
  ctx.lineWidth = 1.6;
  ctx.fill();
  ctx.stroke();

  // Subtle knuckle line across palm
  ctx.beginPath();
  ctx.moveTo(-PALM_W * 0.6, PALM_H * 0.35);
  ctx.lineTo(PALM_W * 0.6, PALM_H * 0.35);
  ctx.strokeStyle = AV.SKIN_SHADOW;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();

  // Draw 5 Articulated Fingers
  const fingerPoses = [hand.thumb, hand.index, hand.middle, hand.ring, hand.pinky];

  fingerPoses.forEach((fpose, fi) => {
    const color = FINGER_COLORS[fi];
    const segs  = FINGER_SEGS[fi];
    const spread = FINGER_SPREAD[fi] * PALM_W;

    let baseX: number, baseY: number;
    if (fi === 0) {
      const thumbSide = isRight ? -1 : 1;
      baseX = palmCX + latX * PALM_W * thumbSide * 0.72 + fwdX * 5;
      baseY = palmCY + latY * PALM_W * thumbSide * 0.72 + fwdY * 5;
    } else {
      baseX = palmCX + latX * spread + fwdX * PALM_H * 0.72;
      baseY = palmCY + latY * spread + fwdY * PALM_H * 0.72;
    }

    let curX = baseX;
    let curY = baseY;

    let curAngle = fi === 0
      ? handAngle + (isRight ? -Math.PI / 4 : Math.PI / 4)
      : handAngle;

    for (let seg = 0; seg < 3; seg++) {
      const curl = fpose[seg];
      curAngle = curAngle + curl * (isRight ? 0.65 : -0.65);

      const segLen = segs[seg];
      const endX = curX + Math.cos(curAngle) * segLen;
      const endY = curY + Math.sin(curAngle) * segLen;

      // Segment bone with rounded cap
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth   = fi === 0 ? 5 - seg * 0.7 : 4.2 - seg * 0.6;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Knuckle Joint Dot
      ctx.beginPath();
      ctx.arc(endX, endY, fi === 0 ? 3.2 - seg * 0.4 : 2.6 - seg * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      curX = endX;
      curY = endY;
    }
  });
}

// ─── Glowing Movement Direction Arrows ─────────────────────────────────────────

function drawMovementArrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  a: MovementArrow,
  isRight: boolean
): void {
  const col = isRight ? AV.ARROW_R : AV.ARROW_L;
  const rad = -(a.angleDeg * Math.PI / 180);
  const len = a.length;

  ctx.save();
  ctx.strokeStyle = col;
  ctx.fillStyle   = col;
  ctx.lineCap     = 'round';

  if (a.style === 'circular') {
    const r  = 18;
    const ox = x + (isRight ? 24 : -24);
    // Outer glow
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(ox, y - 10, r, 0, Math.PI * 1.75);
    ctx.stroke();

    // Sharp line
    ctx.lineWidth = 2.6;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(ox, y - 10, r, 0, Math.PI * 1.75);
    ctx.stroke();

    const ex = ox + r * Math.cos(Math.PI * 1.75);
    const ey = y - 10 + r * Math.sin(Math.PI * 1.75);
    arrowHead(ctx, ex - 3, ey - 3, ex, ey, 7.5);
  } else if (a.style === 'arc-up' || a.style === 'arc-down') {
    const sign = a.style === 'arc-up' ? -1 : 1;
    const ex = x + Math.cos(rad) * len;
    const ey = y + Math.sin(rad) * len;
    const cpx = (x + ex) / 2 + Math.sin(rad) * len * 0.4 * sign;
    const cpy = (y + ey) / 2 - Math.cos(rad) * len * 0.4 * sign;

    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
    ctx.stroke();

    ctx.lineWidth = 2.6;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
    ctx.stroke();

    arrowHead(ctx, cpx, cpy, ex, ey, 8.5);
  } else {
    const ex = x + Math.cos(rad) * len;
    const ey = y + Math.sin(rad) * len;

    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.lineWidth = 2.6;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    arrowHead(ctx, x, y, ex, ey, 9.5);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function arrowHead(
  ctx: CanvasRenderingContext2D,
  fx: number, fy: number,
  tx: number, ty: number,
  sz: number
): void {
  const a = Math.atan2(ty - fy, tx - fx);
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - sz * Math.cos(a - Math.PI / 6), ty - sz * Math.sin(a - Math.PI / 6));
  ctx.lineTo(tx - sz * Math.cos(a + Math.PI / 6), ty - sz * Math.sin(a + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

// ─── Text-to-Speech Helper ────────────────────────────────────────────────────

export function speakWord(word: string, lang = 'en-US'): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang  = lang;
  u.rate  = 0.85;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}


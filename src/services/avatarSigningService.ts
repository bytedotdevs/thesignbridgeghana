/**
 * AvatarSigningService — Text-to-Sign 3D Avatar Engine
 *
 * Uses Three.js to render an animated stick-figure / skeletal avatar
 * that performs GSL signs from dictionary data. 
 *
 * Architecture:
 *  - Three.js scene with a humanoid skeleton (IK rig)
 *  - Sign animations are procedurally generated from pose keypoints
 *  - Each GSL word maps to a pose sequence / animation clip
 *  - Web Speech API for TTS narration alongside signing
 */

import * as THREE from 'three';
import { GSLSearchIndexItem } from '../types/dictionary';

export interface SignPose {
  rightShoulder: THREE.Euler;
  rightElbow: THREE.Euler;
  rightWrist: THREE.Euler;
  leftShoulder: THREE.Euler;
  leftElbow: THREE.Euler;
  leftWrist: THREE.Euler;
  spine: THREE.Euler;
  head: THREE.Euler;
}

export interface AvatarSignFrame {
  pose: SignPose;
  duration: number; // ms
  label: string;
}

export interface SignSequence {
  word: string;
  sign: GSLSearchIndexItem | null;
  frames: AvatarSignFrame[];
  duration: number;
}

// ── Predefined pose library (GSL-informed archetypes) ──────────────────────

export const NEUTRAL_POSE: SignPose = {
  rightShoulder: new THREE.Euler(0, 0, -0.3),
  rightElbow: new THREE.Euler(0, 0, 0),
  rightWrist: new THREE.Euler(0, 0, 0),
  leftShoulder: new THREE.Euler(0, 0, 0.3),
  leftElbow: new THREE.Euler(0, 0, 0),
  leftWrist: new THREE.Euler(0, 0, 0),
  spine: new THREE.Euler(0, 0, 0),
  head: new THREE.Euler(0, 0, 0),
};

function makePose(
  rShoulder: number[],
  rElbow: number[],
  rWrist: number[],
  lShoulder: number[],
  lElbow: number[],
  lWrist: number[],
  spine?: number[],
  head?: number[]
): SignPose {
  return {
    rightShoulder: new THREE.Euler(...(rShoulder as [number, number, number])),
    rightElbow: new THREE.Euler(...(rElbow as [number, number, number])),
    rightWrist: new THREE.Euler(...(rWrist as [number, number, number])),
    leftShoulder: new THREE.Euler(...(lShoulder as [number, number, number])),
    leftElbow: new THREE.Euler(...(lElbow as [number, number, number])),
    leftWrist: new THREE.Euler(...(lWrist as [number, number, number])),
    spine: new THREE.Euler(...((spine || [0, 0, 0]) as [number, number, number])),
    head: new THREE.Euler(...((head || [0, 0, 0]) as [number, number, number])),
  };
}

// GSL-inspired pose archetypes by category
const POSE_LIBRARY: Record<string, SignPose[]> = {
  greeting: [
    makePose([-0.5, 0, -0.4], [0.8, 0, 0], [0, 0, 0.3], [0, 0, 0.3], [0, 0, 0], [0, 0, 0]),
    makePose([-0.7, 0, -0.3], [1.0, 0, 0], [0, 0, 0.5], [0, 0, 0.3], [0, 0, 0], [0, 0, 0]),
    makePose([-0.5, 0, -0.4], [0.8, 0, 0], [0, 0, 0.3], [0, 0, 0.3], [0, 0, 0], [0, 0, 0]),
  ],
  family: [
    makePose([-0.3, 0, -0.2], [0.6, 0, 0], [0, 0, 0], [-0.3, 0, 0.2], [0.6, 0, 0], [0, 0, 0]),
    makePose([-0.5, 0, -0.3], [0.8, 0, 0.2], [0, 0.3, 0], [-0.5, 0, 0.3], [0.8, 0, -0.2], [0, -0.3, 0]),
    makePose([-0.3, 0, -0.2], [0.6, 0, 0], [0, 0, 0], [-0.3, 0, 0.2], [0.6, 0, 0], [0, 0, 0]),
  ],
  education: [
    makePose([-0.6, 0, -0.5], [1.2, 0, 0], [0, 0.2, 0], [0, 0, 0.3], [0, 0, 0], [0, 0, 0]),
    makePose([-0.4, 0, -0.3], [0.9, 0, 0], [0.1, 0.1, 0.2], [0, 0, 0.3], [0, 0, 0], [0, 0, 0]),
    NEUTRAL_POSE,
  ],
  nature: [
    makePose([-0.4, 0, -0.6], [0.7, 0, 0.3], [0, 0.4, 0], [-0.4, 0, 0.6], [0.7, 0, -0.3], [0, -0.4, 0]),
    makePose([-0.6, 0, -0.4], [0.5, 0.2, 0], [0, 0.3, 0.2], [0, 0, 0.3], [0, 0, 0], [0, 0, 0]),
    NEUTRAL_POSE,
  ],
  default: [
    makePose([-0.4, 0, -0.3], [0.7, 0, 0], [0, 0, 0.2], [0, 0, 0.3], [0, 0, 0], [0, 0, 0]),
    makePose([-0.6, 0, -0.4], [0.9, 0.1, 0], [0, 0.1, 0.3], [0, 0, 0.3], [0, 0, 0], [0, 0, 0]),
    NEUTRAL_POSE,
  ],
};

function getPosesForSign(sign: GSLSearchIndexItem | null): SignPose[] {
  if (!sign) return POSE_LIBRARY.default;
  const cat = sign.categorySlug || '';
  if (cat.includes('greet') || cat.includes('welcome')) return POSE_LIBRARY.greeting;
  if (cat.includes('family') || cat.includes('person')) return POSE_LIBRARY.family;
  if (cat.includes('school') || cat.includes('educat')) return POSE_LIBRARY.education;
  if (cat.includes('animal') || cat.includes('nature')) return POSE_LIBRARY.nature;
  return POSE_LIBRARY.default;
}

export function buildSignSequence(
  word: string,
  sign: GSLSearchIndexItem | null
): SignSequence {
  const poses = getPosesForSign(sign);
  const frameDuration = 400;

  const frames: AvatarSignFrame[] = [
    { pose: NEUTRAL_POSE, duration: 200, label: 'prepare' },
    ...poses.map((pose, i) => ({
      pose,
      duration: frameDuration,
      label: `sign-${i + 1}`,
    })),
    { pose: NEUTRAL_POSE, duration: 300, label: 'hold' },
  ];

  return {
    word,
    sign,
    frames,
    duration: frames.reduce((sum, f) => sum + f.duration, 0),
  };
}

export function interpolatePose(a: SignPose, b: SignPose, t: number): SignPose {
  const lerp = (ea: THREE.Euler, eb: THREE.Euler) => {
    return new THREE.Euler(
      THREE.MathUtils.lerp(ea.x, eb.x, t),
      THREE.MathUtils.lerp(ea.y, eb.y, t),
      THREE.MathUtils.lerp(ea.z, eb.z, t),
      ea.order
    );
  };
  return {
    rightShoulder: lerp(a.rightShoulder, b.rightShoulder),
    rightElbow: lerp(a.rightElbow, b.rightElbow),
    rightWrist: lerp(a.rightWrist, b.rightWrist),
    leftShoulder: lerp(a.leftShoulder, b.leftShoulder),
    leftElbow: lerp(a.leftElbow, b.leftElbow),
    leftWrist: lerp(a.leftWrist, b.leftWrist),
    spine: lerp(a.spine, b.spine),
    head: lerp(a.head, b.head),
  };
}

// ── Three.js Avatar Builder ────────────────────────────────────────────────

export interface AvatarRig {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  skeleton: {
    hips: THREE.Group;
    spine: THREE.Group;
    head: THREE.Mesh;
    rightUpperArm: THREE.Group;
    rightForeArm: THREE.Group;
    rightHand: THREE.Group;
    leftUpperArm: THREE.Group;
    leftForeArm: THREE.Group;
    leftHand: THREE.Group;
  };
}

function createBone(
  length: number,
  radius: number,
  color: number,
  name: string
): THREE.Mesh {
  const geo = new THREE.CapsuleGeometry(radius, length, 8, 16);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.1,
    envMapIntensity: 0.8,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.castShadow = true;
  return mesh;
}

export function buildAvatarRig(canvas: HTMLCanvasElement): AvatarRig {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);
  scene.fog = new THREE.Fog(0x0f172a, 8, 25);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.4, 4.5);
  camera.lookAt(0, 1.2, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x93c5fd, 2.5);
  keyLight.position.set(2, 4, 3);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xfcd34d, 1.2);
  fillLight.position.set(-3, 2, 1);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x6ee7b7, 0.8);
  rimLight.position.set(0, 3, -3);
  scene.add(rimLight);

  // Ground plane (subtle)
  const groundGeo = new THREE.PlaneGeometry(6, 6);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Glowing grid effect
  const gridHelper = new THREE.GridHelper(6, 12, 0x334155, 0x1e293b);
  scene.add(gridHelper);

  // ── Build skeletal avatar ──────────────────────────────────────────────
  const skinColor = 0x3b82f6; // Blue-tinted for avatar aesthetic
  const jointColor = 0x60a5fa;

  // Hips (root)
  const hips = new THREE.Group();
  hips.position.set(0, 0.95, 0);
  scene.add(hips);

  // Torso
  const torsoMesh = createBone(0.5, 0.14, skinColor, 'torso');
  torsoMesh.position.y = 0.28;
  const spine = new THREE.Group();
  spine.add(torsoMesh);
  hips.add(spine);

  // Shoulders plate
  const shoulderBar = createBone(0.01, 0.28, 0x1d4ed8, 'shoulders');
  shoulderBar.rotation.z = Math.PI / 2;
  shoulderBar.position.y = 0.6;
  spine.add(shoulderBar);

  // Head
  const headGeo = new THREE.SphereGeometry(0.18, 20, 20);
  const headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.4, metalness: 0.05 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.name = 'head';
  head.castShadow = true;
  head.position.y = 0.85;
  spine.add(head);

  // ── Right Arm ──────────────────────────────────────────────────────────
  const rightUpperArm = new THREE.Group();
  rightUpperArm.position.set(-0.35, 0.6, 0);
  const rightUpperArmMesh = createBone(0.28, 0.065, skinColor, 'rightUpperArm');
  rightUpperArmMesh.position.y = -0.14;
  rightUpperArm.add(rightUpperArmMesh);
  spine.add(rightUpperArm);

  const rightForeArm = new THREE.Group();
  rightForeArm.position.y = -0.3;
  const rightForeArmMesh = createBone(0.24, 0.055, skinColor, 'rightForeArm');
  rightForeArmMesh.position.y = -0.12;
  rightForeArm.add(rightForeArmMesh);
  rightUpperArm.add(rightForeArm);

  const rightHand = new THREE.Group();
  rightHand.position.y = -0.26;
  const rightHandMesh = createBone(0.12, 0.06, jointColor, 'rightHand');
  rightHand.add(rightHandMesh);
  rightForeArm.add(rightHand);

  // ── Left Arm ───────────────────────────────────────────────────────────
  const leftUpperArm = new THREE.Group();
  leftUpperArm.position.set(0.35, 0.6, 0);
  const leftUpperArmMesh = createBone(0.28, 0.065, skinColor, 'leftUpperArm');
  leftUpperArmMesh.position.y = -0.14;
  leftUpperArm.add(leftUpperArmMesh);
  spine.add(leftUpperArm);

  const leftForeArm = new THREE.Group();
  leftForeArm.position.y = -0.3;
  const leftForeArmMesh = createBone(0.24, 0.055, skinColor, 'leftForeArm');
  leftForeArmMesh.position.y = -0.12;
  leftForeArm.add(leftForeArmMesh);
  leftUpperArm.add(leftForeArm);

  const leftHand = new THREE.Group();
  leftHand.position.y = -0.26;
  const leftHandMesh = createBone(0.12, 0.06, jointColor, 'leftHand');
  leftHand.add(leftHandMesh);
  leftForeArm.add(leftHand);

  // Legs (simplified)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 });
  [-0.15, 0.15].forEach((x) => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.36, 8, 12), legMat);
    thigh.position.set(x, -0.22, 0);
    thigh.castShadow = true;
    hips.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.32, 8, 12), legMat);
    shin.position.set(x, -0.58, 0);
    shin.castShadow = true;
    hips.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.18), legMat);
    foot.position.set(x, -0.77, 0.04);
    foot.castShadow = true;
    hips.add(foot);
  });

  // Particle halo (ambient effect)
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 120;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 1] = Math.random() * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.03, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Points(particleGeo, particleMat));

  return {
    scene,
    camera,
    renderer,
    skeleton: {
      hips,
      spine,
      head,
      rightUpperArm,
      rightForeArm,
      rightHand,
      leftUpperArm,
      leftForeArm,
      leftHand,
    },
  };
}

export function applyPoseToRig(rig: AvatarRig, pose: SignPose): void {
  const s = rig.skeleton;
  s.spine.rotation.copy(pose.spine);
  s.head.rotation.copy(pose.head);
  s.rightUpperArm.rotation.copy(pose.rightShoulder);
  s.rightForeArm.rotation.copy(pose.rightElbow);
  s.rightHand.rotation.copy(pose.rightWrist);
  s.leftUpperArm.rotation.copy(pose.leftShoulder);
  s.leftForeArm.rotation.copy(pose.leftElbow);
  s.leftHand.rotation.copy(pose.leftWrist);
}

// ── Text-to-Speech helper ─────────────────────────────────────────────────

export function speakWord(word: string, lang = 'en-US'): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

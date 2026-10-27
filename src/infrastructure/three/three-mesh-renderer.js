import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let renderer = null;
let scene = null;
let camera = null;
let currentVrmEntry = null;
const vrmCache = new Map();

export function mount(canvas) {
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0, 0);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100);

  // Hemisphere lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8a93a0, 1.1);
  scene.add(hemiLight);

  // Key directional light
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(1.5, 3, 2.5);
  scene.add(keyLight);

  // Fill directional light
  const fillLight = new THREE.DirectionalLight(0xbfd1ff, 0.6);
  fillLight.position.set(-2, 1, -2);
  scene.add(fillLight);
}

export function load(name, buffer) {
  return new Promise((resolve, reject) => {
    if (vrmCache.has(name)) {
      use(name);
      return resolve(vrmCache.get(name).info);
    }

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.parse(
      buffer.slice(0),
      '',
      (gltf) => {
        const vrm = gltf.userData.vrm;
        if (!vrm) {
          return reject(new Error('File tidak berisi data VRM yang bisa dirender.'));
        }

        vrm.scene.traverse((child) => {
          child.frustumCulled = false;
        });

        let meshCount = 0;
        let triangleCount = 0;
        vrm.scene.traverse((child) => {
          if (child.isMesh) {
            meshCount++;
            const geom = child.geometry;
            triangleCount += (geom.index ? geom.index.count : geom.attributes.position.count) / 3;
          }
        });

        const entry = {
          vrm,
          info: {
            meshes: meshCount,
            tris: Math.round(triangleCount),
          },
        };

        vrmCache.set(name, entry);
        use(name);
        resolve(entry.info);
      },
      (err) => {
        reject(new Error('Gagal memuat mesh: ' + (err && err.message ? err.message : err)));
      },
    );
  });
}

export function use(name) {
  if (currentVrmEntry) {
    scene.remove(currentVrmEntry.vrm.scene);
  }
  currentVrmEntry = vrmCache.get(name) || null;
  if (currentVrmEntry) {
    scene.add(currentVrmEntry.vrm.scene);
  }
}

export function has(name) {
  return vrmCache.has(name);
}

export function unload() {
  if (currentVrmEntry) {
    scene.remove(currentVrmEntry.vrm.scene);
  }
  currentVrmEntry = null;
}

export function pose(poseData, rig) {
  if (!currentVrmEntry) return;
  const humanoid = currentVrmEntry.vrm.humanoid;
  if (!humanoid) return;

  rig.animated_bones.forEach((boneName, i) => {
    const vrmBoneKey = rig.humanoid[boneName];
    const node = vrmBoneKey && humanoid.getNormalizedBoneNode(vrmBoneKey);
    if (!node) return;

    const q = poseData.local[i];
    node.quaternion.set(q[0], q[1], q[2], q[3]);
    if (i === 0) {
      node.position.set(poseData.hips[0], poseData.hips[1], poseData.hips[2]);
    }
  });

  currentVrmEntry.vrm.scene.position.set(poseData.root[0], poseData.root[1], poseData.root[2]);
  humanoid.update();

  const exprManager = currentVrmEntry.vrm.expressionManager;
  if (exprManager && exprManager.expressions) {
    for (const expr of exprManager.expressions) {
      const val = (poseData.expr && poseData.expr[expr.expressionName]) || 0;
      exprManager.setValue(expr.expressionName, val);
    }
    exprManager.update();
  }
}

export function render(w, h, dpr, eye, target, fov) {
  if (!currentVrmEntry || !renderer) return;

  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);

  camera.aspect = w / h;
  camera.fov = fov;
  camera.updateProjectionMatrix();

  camera.position.set(eye[0], eye[1], eye[2]);
  camera.up.set(0, 1, 0);
  camera.lookAt(target[0], target[1], target[2]);

  renderer.render(scene, camera);
}

export function bonePos(boneName) {
  if (!currentVrmEntry) return [0, 0, 0];
  currentVrmEntry.vrm.scene.updateMatrixWorld(true);
  const node = currentVrmEntry.vrm.humanoid.getRawBoneNode(boneName);
  if (!node) return [0, 0, 0];
  const pos = node.getWorldPosition(new THREE.Vector3());
  return [pos.x, pos.y, pos.z];
}

export const VrmView = {
  mount,
  load,
  has,
  use,
  unload,
  pose,
  render,
  bonePos,
};

export default VrmView;

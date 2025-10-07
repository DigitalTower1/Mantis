import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('bg-canvas');

if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xe5eeff, 0.018);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.4, 6.5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 1.8;

  const ambientLight = new THREE.AmbientLight(0xf7f9fc, 0.9);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x0057d9, 2.8, 40, 1.6);
  keyLight.position.set(4, 5, 4);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xffd43b, 1.8, 40, 2.4);
  fillLight.position.set(-5, -3, -4);
  scene.add(fillLight);

  const haloGeometry = new THREE.RingGeometry(3.1, 3.6, 80);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0x0c74ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
  });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  halo.rotation.x = Math.PI / 2.15;
  scene.add(halo);

  const coreGeometry = new THREE.IcosahedronGeometry(1.6, 1);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x0057d9,
    emissiveIntensity: 0.45,
    metalness: 0.35,
    roughness: 0.2,
    transparent: true,
    opacity: 0.92,
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  scene.add(coreMesh);

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x0057d9,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 2), wireMaterial);
  scene.add(wireMesh);

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 880;
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i += 1) {
    const radius = THREE.MathUtils.randFloat(2.3, 6);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = THREE.MathUtils.randFloat(0, Math.PI);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) * 0.7;
    const z = radius * Math.sin(phi) * Math.sin(theta);
    positions.set([x, y, z], i * 3);
    scales[i] = THREE.MathUtils.randFloat(0.4, 1.1);
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  const particlesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xffd43b) },
    },
    vertexShader: `
      attribute float aScale;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        float pulse = sin(uTime * 0.8 + position.y * 0.25) * 0.25;
        vec3 transformed = position + normal * pulse;
        vAlpha = aScale * 0.6 + 0.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        gl_PointSize = aScale * 6.5 * (1.0 / - (modelViewMatrix * vec4(transformed, 1.0)).z);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  const resizeRenderer = () => {
    const { innerWidth, innerHeight } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };

  window.addEventListener('resize', resizeRenderer);

  const cursor = new THREE.Vector2();
  window.addEventListener('pointermove', (event) => {
    cursor.x = (event.clientX / window.innerWidth - 0.5) * 0.18;
    cursor.y = (event.clientY / window.innerHeight - 0.5) * 0.18;
  });

  const clock = new THREE.Clock();

  const animate = () => {
    const elapsed = clock.getElapsedTime();
    particlesMaterial.uniforms.uTime.value = elapsed;

    coreMesh.rotation.x = elapsed * 0.18;
    coreMesh.rotation.y = elapsed * 0.26;
    wireMesh.rotation.x = -elapsed * 0.12;
    wireMesh.rotation.y = elapsed * 0.22;
    halo.rotation.z = elapsed * 0.04;

    camera.position.x += (cursor.x - camera.position.x * 0.08);
    camera.position.y += (-cursor.y - camera.position.y * 0.08);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}

export default {};

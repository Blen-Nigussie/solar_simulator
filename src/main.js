import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SolarSystem } from './SolarSystem.js';

// Ambient background sound with better error handling
const ambientAudio = new Audio('/sounds/space_ambient.mp3');
ambientAudio.loop = true;
ambientAudio.volume = 0.2;

// Click sound for planet selection
const clickSound = new Audio('/sounds/click.mp3');
clickSound.volume = 0.5;

// Sound initialization function
function initSounds() {
  console.log('Initializing sounds...');
  
  // Try to play ambient sound
  ambientAudio.play().then(() => {
    console.log('Ambient sound started successfully');
  }).catch((error) => {
    console.log('Autoplay blocked, waiting for user interaction');
    // Add event listeners for user interaction
    const startSound = () => {
      ambientAudio.play().then(() => {
        console.log('Ambient sound started on user interaction');
        // Remove the event listeners after successful start
        document.removeEventListener('click', startSound);
        document.removeEventListener('keydown', startSound);
        document.removeEventListener('mousemove', startSound);
      }).catch((err) => {
        console.error('Failed to start ambient sound:', err);
      });
    };
    
    document.addEventListener('click', startSound, { once: true });
    document.addEventListener('keydown', startSound, { once: true });
    document.addEventListener('mousemove', startSound, { once: true });
  });
  
  // Test click sound
  clickSound.addEventListener('canplaythrough', () => {
    console.log('Click sound loaded successfully');
  });
  
  ambientAudio.addEventListener('canplaythrough', () => {
    console.log('Ambient sound loaded successfully');
  });
  
  // Error handling
  ambientAudio.addEventListener('error', (e) => {
    console.error('Ambient sound error:', e);
  });
  
  clickSound.addEventListener('error', (e) => {
    console.error('Click sound error:', e);
  });
}

// Initialize sounds
initSounds();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 300;


function createStarfield() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    const r = 400 + Math.random() * 400;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
createStarfield();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 2, 0);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
scene.add(sunLight);


const solarSystem = new SolarSystem(scene);


function drawOrbitLines() {
  solarSystem.planetData.forEach((data) => {
    if (data.distance > 0) {
      const orbitGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      orbit.position.set(0, 0, 0);
      scene.add(orbit);
    }
  });
}
drawOrbitLines();

const SunPulseState = { Growing: 0, Shrinking: 1 };
let sunPulseState = SunPulseState.Growing;
let sunGlowSprite = null;
let sunGlowScale = 20;
function addSunGlow() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('/textures/sun_glow.png', (glowTexture) => {
    const spriteMaterial = new THREE.SpriteMaterial({ map: glowTexture, color: 0xffff99, transparent: true, opacity: 0.7 });
    sunGlowSprite = new THREE.Sprite(spriteMaterial);
    sunGlowSprite.scale.set(sunGlowScale, sunGlowScale, 1);
    sunGlowSprite.position.set(0, 0, 0);
    scene.add(sunGlowSprite);
  });
}
addSunGlow();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredPlanet = null;

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(solarSystem.getInteractiveObjects());
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    if (hoveredPlanet && hoveredPlanet !== planet) {
      hoveredPlanet.scale.set(1, 1, 1);
    }
    hoveredPlanet = planet;
    hoveredPlanet.scale.set(1.2, 1.2, 1.2);
    document.body.style.cursor = 'pointer';
  } else {
    if (hoveredPlanet) hoveredPlanet.scale.set(1, 1, 1);
    hoveredPlanet = null;
    document.body.style.cursor = 'default';
  }
}
window.addEventListener('pointermove', onPointerMove, false);

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(solarSystem.getInteractiveObjects());
  if (intersects.length > 0) {
    const planet = intersects[0].object;
   
    try {
      clickSound.currentTime = 0;
      clickSound.play().then(() => {
        console.log('Click sound played successfully');
      }).catch((error) => {
        console.error('Failed to play click sound:', error);
      });
    } catch (error) {
      console.error('Error playing click sound:', error);
    }
    solarSystem.showPlanetInfo(planet.name);
  }
}
window.addEventListener('click', onClick, false);

// Camera zoom to planet on double-click
function onDoubleClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(solarSystem.getInteractiveObjects());
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    // Animate camera to planet
    const target = planet.position.clone();
    const start = camera.position.clone();
    const end = target.clone().add(new THREE.Vector3(0, 8, 18));
    let t = 0;
    function animateZoom() {
      t += 0.03;
      camera.position.lerpVectors(start, end, t);
      controls.target.lerpVectors(controls.target, target, t);
      controls.update();
      if (t < 1) {
        requestAnimationFrame(animateZoom);
      } else {
        camera.position.copy(end);
        controls.target.copy(target);
      }
    }
    animateZoom();
  }
}
window.addEventListener('dblclick', onDoubleClick, false);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Enhanced info panel styling and fade/close
const infoDiv = document.getElementById('info');
infoDiv.style.fontFamily = 'Segoe UI, Arial, sans-serif';
infoDiv.style.fontSize = '1.1em';
infoDiv.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
infoDiv.style.maxWidth = '260px';
infoDiv.style.transition = 'opacity 0.3s';
infoDiv.style.opacity = 0;
infoDiv.style.display = 'none';
infoDiv.innerHTML += '<button id="closeInfoBtn" style="margin-top:8px;float:right;background:#222;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;">Close</button>';
const closeInfoBtn = document.getElementById('closeInfoBtn');
if (closeInfoBtn) {
  closeInfoBtn.onclick = () => {
    infoDiv.style.opacity = 0;
    setTimeout(() => { infoDiv.style.display = 'none'; }, 300);
  };
}

// Animate sun pulse and render
function animate() {
  requestAnimationFrame(animate);
  solarSystem.update();
  controls.update();
  // Animate sun glow pulse
  if (sunGlowSprite) {
    if (sunPulseState === 0) {
      sunGlowScale += 0.04;
      if (sunGlowScale > 23) sunPulseState = 1;
    } else {
      sunGlowScale -= 0.04;
      if (sunGlowScale < 19) sunPulseState = 0;
    }
    sunGlowSprite.scale.set(sunGlowScale, sunGlowScale, 1);
  }
  renderer.render(scene, camera);
}
animate();

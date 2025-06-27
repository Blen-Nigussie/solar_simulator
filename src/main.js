import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SolarSystem } from './SolarSystem.js';
import { UIControls } from './UIControls.js';
import { ProjectInfo } from './ProjectInfo.js';

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

// Initialize components
const solarSystem = new SolarSystem(scene);
const uiControls = new UIControls(scene, solarSystem, renderer);
const projectInfo = new ProjectInfo();

// Starfield background
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
    stars.name = 'stars';
    scene.add(stars);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
ambientLight.name = 'ambientLight';
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 0);
pointLight.position.set(0, 0, 0);
pointLight.name = 'pointLight';
scene.add(pointLight);

// Draw orbit lines
function drawOrbitLines() {
    const orbitLinesGroup = new THREE.Object3D();
    orbitLinesGroup.name = 'orbitLines';
    
    solarSystem.planetData.forEach((data) => {
        if (data.distance > 0) {
            const orbitGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 128);
            const orbitMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x888888, 
                side: THREE.DoubleSide, 
                transparent: true, 
                opacity: 0.4 
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            orbitLinesGroup.add(orbit);
        }
    });
    scene.add(orbitLinesGroup);
}

drawOrbitLines();

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onPointerMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    onPointerMove(event);
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(solarSystem.planetMeshes);
    if (intersects.length > 0) {
        const planet = solarSystem.getPlanetByName(intersects[0].object.name);
        if (planet) {
            console.log(`Clicked on ${planet.name}`);
        }
    }
}

function onDoubleClick(event) {
    onPointerMove(event);
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(solarSystem.planetMeshes);
    if (intersects.length > 0) {
        const planet = solarSystem.getPlanetByName(intersects[0].object.name);
        if (planet) {
            controls.target.copy(planet.mesh.position);
            controls.update();
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add event listeners
window.addEventListener('pointermove', onPointerMove, false);
window.addEventListener('click', onClick, false);
window.addEventListener('dblclick', onDoubleClick, false);
window.addEventListener('resize', onWindowResize, false);

// Initialize
createStarfield();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update solar system
    solarSystem.update();
    
    // Update camera controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
}

animate();
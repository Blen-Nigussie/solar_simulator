import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SolarSystem } from './SolarSystem.js';
import { UIControls } from './UIControls.js';
import { ProjectInfo } from './ProjectInfo.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera setup
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, 100);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 300;

// Initialize components
const solarSystem = new SolarSystem(scene);
const uiControls = new UIControls(scene, solarSystem);
const projectInfo = new ProjectInfo();

// Raycaster for interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedPlanet = null;

// Create a div for planet info
const planetInfo = document.createElement('div');
planetInfo.className = 'planet-info';
planetInfo.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 5px;
    font-family: 'Segoe UI', Arial, sans-serif;
    display: none;
`;
document.body.appendChild(planetInfo);

// Add keyboard controls
let isDragging = false;
let dragStart = null;

// Add event listeners
window.addEventListener('pointermove', onPointerMove, false);
window.addEventListener('click', onClick, false);
window.addEventListener('contextmenu', onRightClick, false);
window.addEventListener('dblclick', onDoubleClick, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('resize', onWindowResize, false);

// Event handlers
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
            showPlanetInfo(planet);
            // Add a glow effect on click
            planet.mesh.material.emissive.set(0xff0000);
            planet.mesh.material.emissiveIntensity = 0.5;
            setTimeout(() => {
                planet.mesh.material.emissiveIntensity = 0;
            }, 500);
        }
    } else {
        hidePlanetInfo();
    }
}

function onRightClick(event) {
    event.preventDefault();
    onPointerMove(event);
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(solarSystem.planetMeshes);
    if (intersects.length > 0) {
        const planet = solarSystem.getPlanetByName(intersects[0].object.name);
        if (planet) {
            zoomToPlanet(planet);
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
            // Toggle planet visibility
            planet.mesh.visible = !planet.mesh.visible;
        }
    }
}

function onMouseDown(event) {
    if (event.button === 1) { // Middle click
        isDragging = true;
        dragStart = { x: event.clientX, y: event.clientY };
    }
}

function onMouseUp(event) {
    if (event.button === 1) {
        isDragging = false;
        dragStart = null;
    }
}

function onMouseMove(event) {
    if (isDragging && dragStart) {
        const dx = event.clientX - dragStart.x;
        const dy = event.clientY - dragStart.y;
        
        // Rotate camera
        controls.rotateLeft(dx * 0.005);
        controls.rotateUp(dy * 0.005);
        
        dragStart.x = event.clientX;
        dragStart.y = event.clientY;
    }
}

function onKeyDown(event) {
    switch(event.key) {
        case 'ArrowUp':
            camera.position.y += 2;
            break;
        case 'ArrowDown':
            camera.position.y -= 2;
            break;
        case 'ArrowLeft':
            camera.position.x -= 2;
            break;
        case 'ArrowRight':
            camera.position.x += 2;
            break;
        case ' ': // Space bar
            // Toggle day/night
            const sun = scene.getObjectByName('Sun');
            if (sun) {
                sun.material.emissiveIntensity = sun.material.emissiveIntensity === 1 ? 0 : 1;
            }
            break;
        case 'r': // Reset camera
            camera.position.set(0, 40, 100);
            controls.target.set(0, 0, 0);
            break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Helper functions
function showPlanetInfo(planet) {
    selectedPlanet = planet;
    planetInfo.innerHTML = `
        <h3>${planet.name}</h3>
        <p>Distance from Sun: ${planet.distance} AU</p>
        <p>Radius: ${planet.radius} units</p>
        <p>Rotation Speed: ${planet.rotationSpeed.toFixed(3)} rad/s</p>
        <p>Orbit Speed: ${planet.orbitSpeed.toFixed(3)} rad/s</p>
    `;
    planetInfo.style.display = 'block';
}

function hidePlanetInfo() {
    selectedPlanet = null;
    planetInfo.style.display = 'none';
}

function zoomToPlanet(planet) {
    const position = planet.mesh.position.clone();
    const target = position.clone().add(new THREE.Vector3(0, 8, 18));
    
    controls.target.copy(position);
    camera.position.lerp(target, 0.1);
    
    // Smooth transition
    const duration = 1000;
    const startTime = performance.now();
    
    function animateZoom() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1);
        
        camera.position.lerp(target, t);
        controls.update();
        
        if (elapsedTime < duration) {
            requestAnimationFrame(animateZoom);
        } else {
            camera.position.copy(target);
            controls.update();
        }
    }
    
    animateZoom();
}

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
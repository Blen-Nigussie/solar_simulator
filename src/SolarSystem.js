import { Planet } from './Planet.js';

export class SolarSystem {
  constructor(scene) {
    this.scene = scene;
    this.planets = [];
    this.planetData = [
      {
        name: 'Sun', 
        radius: 7, 
        distance: 0, 
        texture: 'sun.jpg', 
        rotationSpeed: 0.0005, 
        orbitSpeed: 0,
        emissive: true
      },
      {
        name: 'Mercury', 
        radius: 1, 
        distance: 12, 
        texture: 'mercury.jpg', 
        rotationSpeed: 0.004, 
        orbitSpeed: 0.02
      },
      {
        name: 'Venus', 
        radius: 1.5, 
        distance: 17, 
        texture: 'venus.jpg', 
        rotationSpeed: 0.002, 
        orbitSpeed: 0.015
      },
      {
        name: 'Earth', 
        radius: 2, 
        distance: 23, 
        texture: 'earth.jpg', 
        rotationSpeed: 0.02, 
        orbitSpeed: 0.01,
        moons: [
          { 
            name: 'Moon', 
            radius: 0.5, 
            distance: 3, 
            texture: 'moon.jpg', 
            rotationSpeed: 0.01, 
            orbitSpeed: 0.04 
          }
        ]
      },
      {
        name: 'Mars', 
        radius: 1.2, 
        distance: 30, 
        texture: 'mars.jpg', 
        rotationSpeed: 0.018, 
        orbitSpeed: 0.008,
        moons: [
          { 
            name: 'Phobos', 
            radius: 0.2, 
            distance: 5, 
            texture: 'phobos.jpg', 
            rotationSpeed: 0.015, 
            orbitSpeed: 0.05 
          },
          { 
            name: 'Deimos', 
            radius: 0.15, 
            distance: 7, 
            texture: 'deimos.jpg', 
            rotationSpeed: 0.012, 
            orbitSpeed: 0.04 
          }
        ]
      },
      {
        name: 'Jupiter', 
        radius: 4, 
        distance: 40, 
        texture: 'jupiter.jpg', 
        rotationSpeed: 0.04, 
        orbitSpeed: 0.005,
        rings: true,
        moons: [
          { 
            name: 'Io', 
            radius: 0.8, 
            distance: 8, 
            texture: 'io.jpg', 
            rotationSpeed: 0.018, 
            orbitSpeed: 0.06 
          },
          { 
            name: 'Europa', 
            radius: 0.7, 
            distance: 10, 
            texture: 'europa.jpg', 
            rotationSpeed: 0.015, 
            orbitSpeed: 0.05 
          }
        ]
      }
    ];
    this.planetMeshes = [];
    this.createPlanets();
  }

  createPlanets() {
    this.planetData.forEach((data) => {
      const planet = new Planet(data);
      this.scene.add(planet.mesh);
      this.planets.push(planet);
      
      // Make sure the sun has a proper name
      if (data.name === 'Sun') {
        planet.mesh.name = 'Sun';
      }
      
      this.planetMeshes.push(planet.mesh);
      
      if (data.moons) {
        planet.moons = data.moons.map(moonData => {
          const moon = new Planet(moonData, true);
          planet.mesh.add(moon.mesh);
          return moon;
        });
      }
      if (data.distance > 0) {
        data.orbitSpeed = 0.02 * Math.sqrt(1/data.distance); // Adjust orbit speed based on distance (Kepler's Third Law)
      }
    });
  }

  update() {
    this.planets.forEach(planet => {
      planet.update();
    });
  }

  getPlanetByName(name) {
    return this.planets.find(planet => planet.name === name);
  }

  // Add this method to get the sun mesh
  getSun() {
    return this.scene.getObjectByName('Sun');
  }

  toggleDayNight() {
    this.scene.traverse((object) => {
      if (object.isMesh && object.material.emissiveIntensity > 0) {
        object.material.emissiveIntensity = object.material.emissiveIntensity === 1 ? 0 : 1;
      }
    });
  }
}
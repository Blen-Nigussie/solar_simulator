import { Planet } from './Planet.js';
import * as THREE from 'three';

export class SolarSystem {
  constructor(scene) {
    this.scene = scene;
    this.planets = [];
    this.planetData = [
      {
        name: 'Sun', radius: 7, distance: 0, texture: 'sun.jpg', rotationSpeed: 0.0005, orbitSpeed: 0, emissive: true
      },
      {
        name: 'Mercury', radius: 1, distance: 12, texture: 'mercury.jpg', rotationSpeed: 0.004, orbitSpeed: 0.02
      },
      {
        name: 'Venus', radius: 1.5, distance: 17, texture: 'venus.jpg', rotationSpeed: 0.002, orbitSpeed: 0.015
      },
      {
        name: 'Earth', radius: 2, distance: 23, texture: 'earth.jpg', rotationSpeed: 0.02, orbitSpeed: 0.01,
        moons: [
          { name: 'Moon', radius: 0.5, distance: 3, texture: 'moon.jpg', rotationSpeed: 0.01, orbitSpeed: 0.04 }
        ]
      },
      {
        name: 'Mars', radius: 1.2, distance: 30, texture: 'mars.jpg', rotationSpeed: 0.018, orbitSpeed: 0.008
      },
      {
        name: 'Jupiter', radius: 4, distance: 40, texture: 'jupiter.jpg', rotationSpeed: 0.04, orbitSpeed: 0.005
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
      this.planetMeshes.push(planet.mesh);
      if (data.moons) {
        planet.moons = data.moons.map(moonData => {
          const moon = new Planet(moonData, true);
          planet.mesh.add(moon.mesh);
          return moon;
        });
      }
    });
  }

  update() {
    this.planets.forEach((planet) => {
      planet.update();
      if (planet.moons) {
        planet.moons.forEach(moon => moon.update());
      }
    });
  }

  getInteractiveObjects() {
    return this.planetMeshes;
  }

  showPlanetInfo(name) {
    const infoDiv = document.getElementById('info');
    const data = this.planetData.find(p => p.name === name);
    if (data) {
      infoDiv.innerHTML = `<b>${data.name}</b><br>Distance: ${data.distance || 'N/A'} AU<br>Radius: ${data.radius} units`;
      infoDiv.style.display = 'block';
      setTimeout(() => { infoDiv.style.display = 'none'; }, 3000);
    }
  }
} 
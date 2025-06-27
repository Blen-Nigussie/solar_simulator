import * as THREE from 'three';

export class Planet {
  constructor({ name, radius, distance, texture, rotationSpeed, orbitSpeed, emissive }, isMoon = false) {
    this.name = name;
    this.radius = radius;
    this.distance = distance;
    this.rotationSpeed = rotationSpeed;
    this.orbitSpeed = orbitSpeed;
    this.angle = Math.random() * Math.PI * 2;
    this.isMoon = isMoon;
    this.moons = [];
    this.texture = texture;
    this.emissive = emissive;
    this.mesh = this.createMesh();
    
    if (!isMoon && distance > 0) {
      this.mesh.position.x = distance;
    }
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = this.createMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = this.name;
    
    // If this is the sun, set up its material properly
    if (this.name === 'Sun') {
      material.emissive.set(0xffff00);
      material.emissiveIntensity = 1;
    }
    
    return mesh;
  }

  createMaterial() {
    const texture = this.loadTexture(this.texture);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: this.emissive ? 0xffff00 : 0x000000,
      emissiveIntensity: this.emissive ? 1 : 0
    });
    return material;
  }

  loadTexture(filename) {
    const loader = new THREE.TextureLoader();
    return loader.load(`/textures/${filename}`);
  }

  update() {
    this.mesh.rotation.y += this.rotationSpeed;
    if (!this.isMoon && this.distance > 0) {
      this.angle += this.orbitSpeed;
      this.mesh.position.x = Math.cos(this.angle) * this.distance;
      this.mesh.position.z = Math.sin(this.angle) * this.distance;
    }
    
    this.updateMoons();
  }

  updateMoons() {
    this.moons.forEach(moon => {
      moon.update();
    });
  }
}
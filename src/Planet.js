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
    let material;
    if (this.emissive) {
      material = new THREE.MeshStandardMaterial({
        map: this.loadTexture(this.texture),
        emissive: 0xffff00,
        emissiveIntensity: 1
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        map: this.loadTexture(this.texture)
      });
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = this.name;
    return mesh;
  }

  loadTexture(filename) {
    // Vite serves public/ as the root, so textures are at /textures/filename
    return new THREE.TextureLoader().load(`/textures/${filename}`);
  }

  update() {
    this.mesh.rotation.y += this.rotationSpeed;
    if (!this.isMoon && this.distance > 0) {
      this.angle += this.orbitSpeed;
      this.mesh.position.x = Math.cos(this.angle) * this.distance;
      this.mesh.position.z = Math.sin(this.angle) * this.distance;
    }
    if (this.isMoon) {
      this.angle += this.orbitSpeed;
      this.mesh.position.x = Math.cos(this.angle) * this.distance;
      this.mesh.position.z = Math.sin(this.angle) * this.distance;
    }
  }
} 
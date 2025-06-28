import * as THREE from 'three';

export class Planet {
  constructor({ name, radius, distance, texture, rotationSpeed = 0.002, orbitSpeed = 0.001, emissive, rings = false }, isMoon = false) {
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
    this.rings = rings;
    this.mesh = this.createMesh();
    
    if (isMoon) {
      this.mesh.position.x = Math.cos(this.angle) * this.distance;
      this.mesh.position.z = Math.sin(this.angle) * this.distance;
    }
  }

  createMesh() {
    const meshGroup = new THREE.Group();
    meshGroup.name = this.name;

    const material = this.createMaterial();
    const planetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 32, 32),
      material
    );
    meshGroup.add(planetMesh);

    if (this.rings) {
      const ringGeometry = new THREE.RingGeometry(this.radius * 1.5, this.radius * 2.5, 64);
      const ringMaterial = new THREE.MeshStandardMaterial({
        map: this.loadTexture('8k_saturn_ring_alpha.png'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
       });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = Math.PI / 2; 
      meshGroup.add(ringMesh);
    }

    if (this.name === 'Sun') {
      material.emissive.set(0xffff00);
      material.emissiveIntensity = 1;
    }
    
    return meshGroup;
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
    return new THREE.TextureLoader().load(`/textures/${filename}`);
  }

  update() {
    if (this.mesh) {
      this.mesh.rotation.y += this.rotationSpeed;
      if (!this.isMoon && this.distance > 0) {
        this.angle += this.orbitSpeed;
        this.mesh.position.x = Math.cos(this.angle) * this.distance;
        this.mesh.position.z = Math.sin(this.angle) * this.distance;
      }
    }
    
    this.updateMoons();
  }

  setSpeeds({ rotationSpeed, orbitSpeed }) {
    this.rotationSpeed = rotationSpeed;
    this.orbitSpeed = orbitSpeed;
  }

  updateMoons() {
    this.moons.forEach(moon => {
      moon.update();
    });
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;  
    }
  }
}

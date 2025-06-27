import * as dat from 'dat.gui';

export class UIControls {
    constructor(scene, solarSystem, renderer) {
        this.scene = scene;
        this.solarSystem = solarSystem;
        this.renderer = renderer;
        
        this.gui = new dat.GUI({ width: 300 });
        this.controls = {
            showOrbits: true,
            showStars: true,
            dayNight: false,
            planetScale: 1.0,
            orbitSpeed: 1.0,
            rotationSpeed: 1.0,
            backgroundColor: '#000000',
            ambientLight: 0.2,
            pointLight: 2.0
        };

        this.addControls();
    }

    addControls() {
        const folder = this.gui.addFolder('Solar System Controls');
        
        // Visibility controls
        folder.add(this.controls, 'showOrbits').onChange(this.toggleOrbits.bind(this));
        folder.add(this.controls, 'showStars').onChange(this.toggleStars.bind(this));
        folder.add(this.controls, 'dayNight').onChange(this.toggleDayNight.bind(this));
        
        // Scale controls
        folder.add(this.controls, 'planetScale', 0.1, 2.0, 0.1).onChange(this.updateScale.bind(this));
        
        // Speed controls
        folder.add(this.controls, 'orbitSpeed', 0.1, 2.0, 0.1).onChange(this.updateSpeed.bind(this));
        folder.add(this.controls, 'rotationSpeed', 0.1, 2.0, 0.1).onChange(this.updateSpeed.bind(this));
        
        // Lighting controls
        folder.addColor(this.controls, 'backgroundColor').onChange(this.updateBackground.bind(this));
        folder.add(this.controls, 'ambientLight', 0, 1, 0.1).onChange(this.updateLighting.bind(this));
        folder.add(this.controls, 'pointLight', 0, 5, 0.1).onChange(this.updateLighting.bind(this));
        
        folder.open();
    }

    toggleOrbits(value) {
        const orbitLines = this.scene.getObjectByName('orbitLines');
        if (orbitLines) {
            orbitLines.visible = value;
        }
    }

    toggleStars(value) {
        const stars = this.scene.getObjectByName('stars');
        if (stars) {
            stars.visible = value;
        }
    }

    toggleDayNight(value) {
        const sun = this.scene.getObjectByName('Sun');
        if (sun) {
            // Toggle sun's emissive color
            const material = sun.material;
            if (value) {
                material.emissive.set(0xffff00);
                material.emissiveIntensity = 1;
                // Also update point light
                const pointLight = this.scene.getObjectByName('pointLight');
                if (pointLight) {
                    pointLight.intensity = this.controls.pointLight;
                }
            } else {
                material.emissive.set(0x000000);
                material.emissiveIntensity = 0;
                // Dim point light
                const pointLight = this.scene.getObjectByName('pointLight');
                if (pointLight) {
                    pointLight.intensity = 0.1;
                }
            }
        }
    }

    updateScale(value) {
        this.solarSystem.planetMeshes.forEach(mesh => {
            if (mesh.name !== 'Sun') {
                mesh.scale.set(value, value, value);
            }
        });
    }

    updateSpeed(value) {
        this.solarSystem.planets.forEach(planet => {
            planet.orbitSpeed *= value;
            planet.rotationSpeed *= value;
        });
    }

    updateBackground(color) {
        this.scene.background = new THREE.Color(color);
    }

    updateLighting() {
        const ambientLight = this.scene.getObjectByName('ambientLight');
        const pointLight = this.scene.getObjectByName('pointLight');
        
        if (ambientLight) {
            ambientLight.intensity = this.controls.ambientLight;
        }
        if (pointLight) {
            pointLight.intensity = this.controls.pointLight;
        }
    }
}

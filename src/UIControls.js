import * as dat from 'dat.gui';

export class UIControls {
    constructor(scene, solarSystem) {
        this.scene = scene;
        this.solarSystem = solarSystem;
        this.gui = new dat.GUI();
        
        // Create controls object
        this.controls = {
            showOrbits: true,
            showStars: true,
            dayNight: true,
            planetScale: 1.0,
            orbitSpeed: 0.01,
            rotationSpeed: 0.02,
            backgroundColor: '#000000',
            ambientLight: 0.2,
            pointLight: 2.0
        };

        // Add background color control
        this.gui.addColor(this.controls, 'backgroundColor').name('Background Color').onChange((value) => {
            this.scene.background.set(value);
        });

        // Add other controls
        this.gui.add(this.controls, 'showOrbits').name('Show Orbits').onChange((value) => {
            const orbitLines = this.scene.getObjectByName('orbitLines');
            if (orbitLines) {
                orbitLines.visible = value;
            }
        });

        this.gui.add(this.controls, 'showStars').name('Show Stars').onChange((value) => {
            const stars = this.scene.getObjectByName('stars');
            if (stars) {
                stars.visible = value;
            }
        });

        this.gui.add(this.controls, 'dayNight').name('Day/Night').onChange((value) => {
            const sun = this.scene.getObjectByName('Sun');
            if (sun) {
                sun.material.emissiveIntensity = value ? 1 : 0;
            }
            
            const pointLight = this.scene.getObjectByName('pointLight');
            if (pointLight) {
                pointLight.intensity = value ? 2 : 0.1;
            }
        });

        this.gui.add(this.controls, 'planetScale', 0.1, 2.0, 0.1).name('Planet Scale').onChange((value) => {
            this.solarSystem.planets.forEach(planet => {
                planet.mesh.scale.set(value, value, value);
            });
        });

        this.gui.add(this.controls, 'orbitSpeed', 0.001, 0.1, 0.001).name('Orbit Speed').onChange((value) => {
            // Update all planets except the Sun
            this.solarSystem.planets.forEach(planet => {
                if (planet.name !== 'Sun') {
                    planet.orbitSpeed = value;
                }
            });
        });

        this.gui.add(this.controls, 'rotationSpeed', 0.001, 0.2, 0.001).name('Rotation Speed').onChange((value) => {
            // Update all planets
            this.solarSystem.planets.forEach(planet => {
                planet.rotationSpeed = value;
            });
        });

        this.gui.add(this.controls, 'ambientLight', 0, 1, 0.1).name('Ambient Light').onChange((value) => {
            const light = this.scene.getObjectByName('ambientLight');
            if (light) {
                light.intensity = value;
            }
        });

        this.gui.add(this.controls, 'pointLight', 0, 5, 0.1).name('Point Light').onChange((value) => {
            const light = this.scene.getObjectByName('pointLight');
            if (light) {
                light.intensity = value;
            }
        });
    }
}

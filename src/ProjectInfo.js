export class ProjectInfo {
    constructor() {
        this.createPanel();
        this.addEventListeners();
    }

    createPanel() {
        this.container = document.createElement('div');
        this.container.className = 'project-info';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: -350px;
            width: 350px;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 20px;
            transition: left 0.3s ease;
            z-index: 1000;
            font-family: 'Segoe UI', Arial, sans-serif;
            overflow-y: auto;
        `;

        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'info-toggle';
        this.toggleButton.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0, 0, 0, 0.8);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            color: white;
            font-size: 1.5em;
            z-index: 1001;
            transition: all 0.3s ease;
        `;
        this.toggleButton.innerHTML = 'ℹ️';

        this.content = document.createElement('div');
        this.content.style.cssText = `
            margin-top: 20px;
        `;

        this.content.innerHTML = `
            <h1>Solar System Simulator</h1>
            <p class="description">An interactive 3D simulation of our solar system using Three.js</p>
            
            <div class="section">
                <h2>Features</h2>
                <ul>
                    <li>Realistic planetary orbits and rotations</li>
                    <li>Interactive camera controls</li>
                    <li>Day/Night cycle</li>
                    <li>Planet information on click</li>
                    <li>Customizable settings</li>
                </ul>
            </div>

            <div class="section">
                <h2>Technical Details</h2>
                <p>Powered by Three.js and Vite</p>
                <p>Physics-based movements</p>
                <p>Real-time rendering</p>
            </div>

            <style>
                .project-info h1 {
                    margin: 0 0 10px 0;
                    font-size: 1.5em;
                }
                .project-info h2 {
                    margin: 20px 0 10px 0;
                    font-size: 1.2em;
                }
                .project-info p {
                    margin: 0 0 15px 0;
                }
                .project-info ul {
                    margin: 0 0 15px 20px;
                    padding: 0;
                }
                .project-info li {
                    margin: 5px 0;
                }
                .project-info .section {
                    margin-bottom: 20px;
                }
                .description {
                    font-size: 1.1em;
                    margin-bottom: 20px;
                }
            </style>
        `;

        // Append elements
        document.body.appendChild(this.container);
        document.body.appendChild(this.toggleButton);
        this.container.appendChild(this.content);
    }

    addEventListeners() {
        this.toggleButton.addEventListener('click', () => this.togglePanel());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closePanel();
        });
    }

    togglePanel() {
        this.container.style.left = this.container.style.left === '-350px' ? '0' : '-350px';
        this.toggleButton.style.transform = this.toggleButton.style.transform === 'rotate(180deg)' ? '' : 'rotate(180deg)';
    }

    closePanel() {
        if (this.container.style.left !== '-350px') {
            this.togglePanel();
        }
    }
}

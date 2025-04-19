class MountainTrack {
    constructor() {
        this.obstacles = [];
        this.roadWidth = 400;
        this.roadX = 200;
    }

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.createObstacles();
    }

    createObstacles() {
        // Create mountain-specific obstacles
        for(let i = 0; i < 10; i++) {
            this.obstacles.push({
                x: this.roadX + Math.random() * this.roadWidth,
                y: -100 - Math.random() * 500,
                width: 50,
                height: 40,
                type: 'rock'
            });
        }
    }

    update() {
        // Update obstacle positions
        this.obstacles.forEach(obs => {
            obs.y += 7;
            if(obs.y > this.canvas.height) {
                obs.y = -100;
                obs.x = this.roadX + Math.random() * this.roadWidth;
            }
        });
    }

    draw() {
        // Draw mountain-specific elements
        this.ctx.fillStyle = '#1E1E1E';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(this.roadX, 0, this.roadWidth, this.canvas.height);
        
        // Draw obstacles
        this.obstacles.forEach(obs => {
            this.ctx.fillStyle = '#795548';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }
}

export default MountainTrack;

class DesertTrack {
    constructor() {
        this.obstacles = [];
        this.roadWidth = 600;
        this.roadX = 100;
    }

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.createObstacles();
    }

    createObstacles() {
        // Create desert-specific obstacles
        for(let i = 0; i < 7; i++) {
            this.obstacles.push({
                x: this.roadX + Math.random() * this.roadWidth,
                y: -100 - Math.random() * 500,
                width: 30,
                height: 50,
                type: 'cactus'
            });
        }
    }

    update() {
        // Update obstacle positions
        this.obstacles.forEach(obs => {
            obs.y += 6;
            if(obs.y > this.canvas.height) {
                obs.y = -100;
                obs.x = this.roadX + Math.random() * this.roadWidth;
            }
        });
    }

    draw() {
        // Draw desert-specific elements
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(this.roadX, 0, this.roadWidth, this.canvas.height);
        
        // Draw obstacles
        this.obstacles.forEach(obs => {
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }
}

export default DesertTrack;

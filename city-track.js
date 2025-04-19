class CityTrack {
    constructor() {
        this.obstacles = [];
        this.roadWidth = 500;
        this.roadX = 150;
    }

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.createObstacles();
    }

    createObstacles() {
        // Create city-specific obstacles
        for(let i = 0; i < 5; i++) {
            this.obstacles.push({
                x: this.roadX + Math.random() * this.roadWidth,
                y: -100 - Math.random() * 500,
                width: 40,
                height: 60,
                type: 'car'
            });
        }
    }

    update() {
        // Update obstacle positions
        this.obstacles.forEach(obs => {
            obs.y += 5;
            if(obs.y > this.canvas.height) {
                obs.y = -100;
                obs.x = this.roadX + Math.random() * this.roadWidth;
            }
        });
    }

    draw() {
        // Draw city-specific elements
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillRect(this.roadX, 0, this.roadWidth, this.canvas.height);
        
        // Draw obstacles
        this.obstacles.forEach(obs => {
            this.ctx.fillStyle = '#FF5722';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }
}

export default CityTrack;

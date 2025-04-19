// Complete game-core.js
let gameRunning = false;
let gameTime = 0;
let gameInterval;
let canvas, ctx;
let currentTrack;
let player = {
    x: 300,
    y: 400,
    width: 40,
    height: 60,
    speed: 0,
    maxSpeed: 8,
    coins: 0,
    inventory: []
};

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

function initGame(track) {
    currentTrack = track;
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Initialize track
    currentTrack.init(canvas);
    
    // Set up event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Start game loop
    startGame();
}

function startGame() {
    gameRunning = true;
    gameInterval = setInterval(gameLoop, 1000/60);
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    render();
    gameTime += 1/60;
    updateTimer();
}

function update() {
    handleInput();
    currentTrack.update();
    checkCollisions();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentTrack.draw();
    
    // Draw player
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function handleInput() {
    if (keys.ArrowLeft && player.x > currentTrack.roadX) {
        player.x -= 5;
    }
    if (keys.ArrowRight && player.x < currentTrack.roadX + currentTrack.roadWidth - player.width) {
        player.x += 5;
    }
    if (keys.ArrowUp && player.speed < player.maxSpeed) {
        player.speed += 0.1;
    }
    if (keys.ArrowDown && player.speed > 0) {
        player.speed -= 0.2;
    }
    
    player.y -= player.speed;
}

function checkCollisions() {
    currentTrack.obstacles.forEach(obs => {
        if (detectCollision(player, obs)) {
            handleCollision(obs.type);
        }
    });
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function handleCollision(type) {
    console.log(`Collision with ${type}`);
    player.speed = Math.max(0, player.speed - 2);
}

function updateTimer() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    document.querySelector('.track-time').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function handleKeyDown(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
}

function handleKeyUp(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
}

function togglePause() {
    gameRunning = !gameRunning;
}

// Export for track initialization
window.initTrack = initGame;

// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game States
const GAME_STATES = {
    IDLE: 'idle',
    RUNNING: 'running',
    GAME_OVER: 'gameOver'
};

// Bird Object
const bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.25,
    flapPower: -5,
    reset: function() {
        this.x = 50;
        this.y = 150;
        this.velocity = 0;
    }
};

// Pipe Object
const pipes = [];
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;
const PIPE_SPACING = 280;
let lastPipeX = -100;

// Game Variables
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
let gameState = GAME_STATES.IDLE;
let gameSpeed = 4;

// Initialize best score display
document.getElementById('best-score').textContent = bestScore;

// Event Listeners
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('click', handleClick);
canvas.addEventListener('click', handleClick);

function handleKeyPress(event) {
    if (event.code === 'Space' && gameState === GAME_STATES.RUNNING) {
        bird.velocity = bird.flapPower;
        event.preventDefault();
    }
}

function handleClick(event) {
    if (gameState === GAME_STATES.RUNNING) {
        bird.velocity = bird.flapPower;
    }
}

function startGame() {
    gameState = GAME_STATES.RUNNING;
    bird.reset();
    pipes.length = 0;
    score = 0;
    lastPipeX = -100;
    document.getElementById('startBtn').textContent = 'RESTART';
    document.getElementById('gameStatus').textContent = '';
    document.getElementById('score').textContent = score;
    gameLoop();
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    pipes.push({
        x: canvas.width,
        topHeight: randomHeight,
        bottomY: randomHeight + PIPE_GAP,
        passed: false
    });
}

function updateBird() {
    // Apply gravity
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Boundary detection (ceiling and floor)
    if (bird.y + bird.height > canvas.height) {
        endGame();
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function updatePipes() {
    // Move pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= gameSpeed;

        // Check if pipe passed bird
        if (!pipes[i].passed && pipes[i].x + PIPE_WIDTH < bird.x) {
            pipes[i].passed = true;
            score++;
            document.getElementById('score').textContent = score;
        }

        // Remove off-screen pipes
        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }

    // Create new pipes - spawn infinitely
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - PIPE_SPACING) {
        createPipe();
    }
}

function checkCollision() {
    if (gameState !== GAME_STATES.RUNNING) return;

    for (let pipe of pipes) {
        // Check if bird is horizontally aligned with pipe
        if (
            bird.x < pipe.x + PIPE_WIDTH &&
            bird.x + bird.width > pipe.x
        ) {
            // Check collision with top pipe
            if (bird.y < pipe.topHeight) {
                endGame();
                return;
            }
            // Check collision with bottom pipe
            if (bird.y + bird.height > pipe.bottomY) {
                endGame();
                return;
            }
        }
    }
}

function endGame() {
    gameState = GAME_STATES.GAME_OVER;
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBestScore', bestScore);
        document.getElementById('best-score').textContent = bestScore;
        document.getElementById('gameStatus').textContent = 'New Record! 🎉';
    } else {
        document.getElementById('gameStatus').textContent = 'Game Over!';
    }
}

function drawBird() {
    // Bird body (yellow circle)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 8, bird.y + bird.height / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Bird pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 8, bird.y + bird.height / 2 - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Bird beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width / 2 + 10, bird.y + bird.height / 2);
    ctx.lineTo(bird.x + bird.width / 2 + 16, bird.y + bird.height / 2 - 3);
    ctx.lineTo(bird.x + bird.width / 2 + 16, bird.y + bird.height / 2 + 3);
    ctx.closePath();
    ctx.fill();
}

function drawPipes() {
    ctx.fillStyle = '#2ECC40';
    
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        
        // Top pipe cap
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(pipe.x - 2, pipe.topHeight - 15, PIPE_WIDTH + 4, 15);
        
        // Bottom pipe cap
        ctx.fillRect(pipe.x - 2, pipe.bottomY, PIPE_WIDTH + 4, 15);
        
        // Bottom pipe
        ctx.fillStyle = '#2ECC40';
        ctx.fillRect(pipe.x, pipe.bottomY + 15, PIPE_WIDTH, canvas.height - pipe.bottomY - 15);
    }
}

function draw() {
    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Draw grass pattern
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 20, 10, 20);
    }

    // Draw game objects
    drawPipes();
    drawBird();
}

function gameLoop() {
    if (gameState === GAME_STATES.RUNNING) {
        updateBird();
        updatePipes();
        checkCollision();
    }

    draw();

    if (gameState === GAME_STATES.RUNNING) {
        requestAnimationFrame(gameLoop);
    }
}

// Initial draw
draw();

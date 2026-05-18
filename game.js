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

// Initialize best score display safely
const bestScoreElem = document.getElementById('best-score');
if (bestScoreElem) bestScoreElem.textContent = bestScore;

// Event Listeners
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('click', handleClick);
canvas.addEventListener('click', handleClick);

// Smart start listener that creates a button if your HTML is cached/missing it
let startBtn = document.getElementById('startBtn');

if (!startBtn) {
    startBtn = document.createElement('button');
    startBtn.id = 'startBtn';
    startBtn.textContent = 'START GAME';
    startBtn.style = "padding: 10px 20px; font-size: 16px; margin: 10px auto; cursor: pointer; display: block;";
    canvas.parentNode.insertBefore(startBtn, canvas);
}

// Attach the click event to the button safely
startBtn.addEventListener('click', function(event) {
    if (gameState !== GAME_STATES.RUNNING) {
        startGame();
    }
    event.stopPropagation(); 
});

function handleKeyPress(event) {
    if (event.code === 'Space') {
        if (gameState === GAME_STATES.IDLE || gameState === GAME_STATES.GAME_OVER) {
            startGame();
        } else if (gameState === GAME_STATES.RUNNING) {
            bird.velocity = bird.flapPower;
        }
        event.preventDefault();
    }
}

function handleClick(event) {
    if (gameState === GAME_STATES.IDLE || gameState === GAME_STATES.GAME_OVER) {
        startGame();
    } else if (gameState === GAME_STATES.RUNNING) {
        bird.velocity = bird.flapPower;
    }
}

function startGame() {
    gameState = GAME_STATES.RUNNING;
    bird.reset();
    pipes.length = 0;
    score = 0;
    lastPipeX = -100;
    
    const btn = document.getElementById('startBtn');
    if (btn) btn.textContent = 'RESTART';
    
    const status = document.getElementById('gameStatus');
    if (status) status.textContent = '';
    
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.textContent = score;
    
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
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height) {
        endGame();
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= gameSpeed;

        if (!pipes[i].passed && pipes[i].x + PIPE_WIDTH < bird.x) {
            pipes[i].passed = true;
            score++;
            const scoreDisplay = document.getElementById('score');
            if (scoreDisplay) scoreDisplay.textContent = score;
        }

        // FIXED ARRAY SPLICE BUG HERE:
        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - PIPE_SPACING) {
        createPipe();
    }
}

function checkCollision() {
    if (gameState !== GAME_STATES.RUNNING) return;

    for (let pipe of pipes) {
        if (
            bird.x < pipe.x + PIPE_WIDTH &&
            bird.x + bird.width > pipe.x
        ) {
            if (bird.y < pipe.topHeight) {
                endGame();
                return;
            }
            if (bird.y + bird.height > pipe.bottomY) {
                endGame();
                return;
            }
        }
    }
}

function endGame() {
    gameState = GAME_STATES.GAME_OVER;
    const status = document.getElementById('gameStatus');
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBestScore', bestScore);
        const bestScoreElem = document.getElementById('best-score');
        if (bestScoreElem) bestScoreElem.textContent = bestScore;
        if (status) status.textContent = 'New Record! 🎉';
    } else {
        if (status) status.textContent = 'Game Over!';
    }
}

function drawBird() {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 8, bird.y + bird.height / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 8, bird.y + bird.height / 2 - 5, 2, 0, Math.PI * 2);
    ctx.fill();

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
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(pipe.x - 2, pipe.topHeight - 15, PIPE_WIDTH + 4, 15);
        ctx.fillRect(pipe.x - 2, pipe.bottomY, PIPE_WIDTH + 4, 15);
        
        ctx.fillStyle = '#2ECC40';
        ctx.fillRect(pipe.x, pipe.bottomY + 15, PIPE_WIDTH, canvas.height - pipe.bottomY - 15);
    }
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 20, 10, 20);
    }

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

draw();

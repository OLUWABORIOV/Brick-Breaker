const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");
const scoreDisplay = document.getElementById("scoreDisplay");
const highScoreDisplay = document.getElementById("highScore");

// Game state
let gameRunning = true;

// Ball properties
let ballRadius = 10;
let x = canvas.width/2;
let y = canvas.height-30;
let dx = 3;
let dy = -3;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width-paddleWidth)/2;

// Brick properties
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Controls
let rightPressed = false;
let leftPressed = false;

// Score
let score = 0;
let highScore = localStorage.getItem('brickBreakerHighScore') || 0;
highScoreDisplay.textContent = highScore;

// Create bricks array
let bricks = [];
initializeBricks();

function initializeBricks() {
    bricks = [];
    for(let c=0; c<brickColumnCount; c++) {
        bricks[c] = [];
        for(let r=0; r<brickRowCount; r++) {
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1,
                color: `hsl(${Math.random() * 40 + 200}, 70%, 50%)`  // Random blue shades
            };
        }
    }
}

// Event listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);
restartButton.addEventListener("click", restartGame);

function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

function updateScore() {
    score++;
    scoreDisplay.textContent = score;
    if(score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('brickBreakerHighScore', highScore);
    }
}

function collisionDetection() {
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            const b = bricks[c][r];
            if(b.status === 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    updateScore();
                    if(score === brickRowCount*brickColumnCount) {
                        gameRunning = false;
                        showGameEndMessage("👑 MORE THAN A CONQUEROR 👑");
                        restartButton.style.display = "block";
                    }
                }
            }
        }
    }
}

function showGameEndMessage(message) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "30px Poppins";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width/2, canvas.height/2);
    
    ctx.font = "20px Poppins";
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 40);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#00a8ff";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    const gradient = ctx.createLinearGradient(paddleX, 0, paddleX + paddleWidth, 0);
    gradient.addColorStop(0, "#0095DD");
    gradient.addColorStop(1, "#00a8ff");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                const brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                const brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function restartGame() {
    gameRunning = true;
    score = 0;
    scoreDisplay.textContent = "0";
    x = canvas.width/2;
    y = canvas.height-30;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width-paddleWidth)/2;
    initializeBricks();
    restartButton.style.display = "none";
    draw();
}

function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Ball collision with walls
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy < ballRadius) {
        dy = -dy;
    }
    else if(y + dy > canvas.height-ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        }
        else {
            gameRunning = false;
            showGameEndMessage("Game Over");
            restartButton.style.display = "block";
            return;
        }
    }

    // Paddle movement
    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // Keep paddle within canvas bounds
    if (paddleX < 0) {
        paddleX = 0;
    }
    if (paddleX + paddleWidth > canvas.width) {
        paddleX = canvas.width - paddleWidth;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}

// Start the game
draw(); 
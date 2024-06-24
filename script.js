const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext('2d');
const highScoreElement = document.getElementById("high-score");
const scoreElement = document.getElementById("score");

const createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color
    canvasContext.fillRect(x, y, width, height)
}

const applePosition = () => {
    appleX = Math.floor(Math.random() * canvas.width / size) * size;
    appleY = Math.floor(Math.random() * canvas.height / size) * size;
}

const changeDirection = e => {
    if (e.key === "ArrowUp" && y != size) {
        x = 0;
        y = -size;
    } else if (e.key === "ArrowDown" && y != -size) {
        x = 0;
        y = size;
    } else if (e.key === "ArrowLeft" && x != size) {
        x = -size;
        y = 0;
    } else if (e.key === "ArrowRight" && x != -size) {
        x = size;
        y = 0;
    }
}

const onGameOver = () => {
    dead.play();
    clearInterval(game);
    canvasContext.font = "40px Arial";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Game Over.",
        canvas.width / 2 - 100, canvas.height / 2 - 20);
    
    // Notify game over
    showNotification("Game Over!");
}

let gameOver = false;
let appleX, appleY;
let snakeX = 0, snakeY = 0;
let x = 0, y = 25;
let snake = [];
let score = 0;
let size = 25;

// Get high score from local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// Load audio files
let dead = new Audio();
let eat = new Audio();

dead.src = "audio/dead.mp3";
eat.src = "audio/eat.mp3";

const init = () => {
    if (gameOver) return onGameOver();

    // When snake eats apple
    if (snakeX === appleX && snakeY === appleY) {
        eat.play();
        applePosition();
        snake.push([appleY, appleX]);
        score++;
        highScore = score >= highScore ? score : highScore;

        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
        
        // Notify apple eaten
        showNotification("Apple Eaten!");
    }

    snakeX += x;
    snakeY += y;

    for (let i = snake.length - 1; i > 0; i--) snake[i] = snake[i - 1];
    snake[0] = [snakeX, snakeY];

    createRect(0, 0, canvas.width, canvas.height, "green");
    createRect(appleX, appleY, size, size, "red");

    for (let i = 0; i < snake.length; i++) {
        createRect(snake[i][0], snake[i][1], size, size, "yellow");

        // Check if snake head hits body
        if (snake[0][1] === snake[i][1] && i !== 0 && snake[0][0] === snake[i][0]) {
            gameOver = true;
        }
    }
    
    // Check if snake hits wall
    checkHitWall();
}

const checkHitWall = () => {
    if (snakeX == -size) {
        snakeX = canvas.width;
    } else if (snakeX == canvas.width) {
        snakeX = -size;
    } else if (snakeY == -size) {
        snakeY = canvas.height;
    } else if (snakeY == canvas.height) {
        snakeY = -size;
    }
}

applePosition();
let game = setInterval(init, 150);
setTimeout(() => {
    document.addEventListener("keyup", changeDirection);
}, 2);

// Function to save username to local storage
function save() {
    const content = document.getElementById("username").value;
    localStorage.setItem("username", content);
    console.log("Username saved");
}

// Function to show notification
function showNotification(message) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            var notification = new Notification('Snake Game', {
                body: message,
                icon: 'snake-icon.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    var notification = new Notification('Snake Game', {
                        body: message,
                        icon: 'snake-icon.png'
                    });
                }
            });
        }
    }
}

// Vibration function
function vibrateDevice() {
    if ("vibrate" in navigator) {
        navigator.vibrate(200); // Vibrate for 200 milliseconds
    } else {
        console.log("Vibration API is not supported in this browser.");
    }
}

// Event listener for device orientation
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
        const beta = event.beta; // Angle in degrees (tilt left/right)
        const gamma = event.gamma; // Angle in degrees (tilt forward/backward)

        if (gameOver) return; // Ignore if game is over

        // Adjust snake direction based on device tilt
        if (gamma > 10) {
            // Tilt forward
            if (x !== -size) {
                x = 0;
                y = size;
            }
        } else if (gamma < -10) {
            // Tilt backward
            if (x !== -size) {
                x = 0;
                y = -size;
            }
        } else if (beta > 10) {
            // Tilt right
            if (y !== -size) {
                x = size;
                y = 0;
            }
        } else if (beta < -10) {
            // Tilt left
            if (y !== -size) {
                x = -size;
                y = 0;
            }
        } else if (beta > -10 && beta < 10 && gamma > -10 && gamma < 10) {
            // Upright position, continue in current direction
        }
    });
}

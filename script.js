// Obtener el canvas y su contexto
const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext('2d');

// Elementos HTML para mostrar la puntuación más alta y la puntuación actual
const highScoreElement = document.getElementById("high-score");
const scoreElement = document.getElementById("score");

// Función para crear un rectángulo en el canvas
const createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
}

// Función para posicionar la manzana en una ubicación aleatoria
const applePosition = () => {
    appleX = Math.floor(Math.random() * canvas.width / size) * size;
    appleY = Math.floor(Math.random() * canvas.height / size) * size;
}

// Función para cambiar la dirección de la serpiente según la tecla presionada
const changeDirection = e => {
    if (e.key === "ArrowUp" && y !== size) {
        x = 0;
        y = -size;
    } else if (e.key === "ArrowDown" && y !== -size) {
        x = 0;
        y = size;
    } else if (e.key === "ArrowLeft" && x !== size) {
        x = -size;
        y = 0;
    } else if (e.key === "ArrowRight" && x !== -size) {
        x = size;
        y = 0;
    }
}

// Función llamada cuando el juego termina
const onGameOver = () => {
    dead.play(); // Reproducir sonido de game over
    clearInterval(game); // Detener el intervalo del juego
    canvasContext.font = "40px Arial";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Game Over.",
        canvas.width / 2 - 100, canvas.height / 2 - 20);

    // Guardar la puntuación más alta en localStorage
    localStorage.setItem("snake-high-score", highScore);

    // Mostrar notificación de game over
    showNotification("Game Over!");

    // Enviar la puntuación más alta al servidor a través de WebSocket
    const datos = {
        game: 'Snake',
        event: 'highScore',
        player: localStorage.getItem("username"),
        value: highScore
    };

    var datosJSON = JSON.stringify(datos);
    ws.send(datosJSON);
}

// Variables principales del juego
let gameOver = false;
let appleX, appleY;
let snakeX = 0, snakeY = 0;
let x = 0, y = 25;
let snake = [];
let score = 0;
let size = 25;

// Obtener la puntuación más alta desde localStorage
let highScore = localStorage.getItem("snake-high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// Cargar archivos de audio
let dead = new Audio();
let eat = new Audio();

dead.src = "audio/dead.mp3";
eat.src = "audio/eat.mp3";

// Función principal del juego
const init = () => {
    if (gameOver) return onGameOver(); // Si el juego terminó, llamar a onGameOver

    // Cuando la serpiente come la manzana
    if (snakeX === appleX && snakeY === appleY) {
        eat.play(); // Reproducir sonido de comer
        vibrateDevice(100); // Vibrar el dispositivo brevemente
        applePosition(); // Posicionar una nueva manzana
        snake.push([appleY, appleX]); // Agregar segmento a la serpiente
        score++; // Incrementar la puntuación
        highScore = Math.max(highScore, score); // Actualizar la puntuación más alta
        localStorage.setItem("snake-high-score", highScore); // Guardar la puntuación más alta en localStorage
        scoreElement.innerText = `Score: ${score}`; // Mostrar la puntuación actualizada
        highScoreElement.innerText = `High Score: ${highScore}`; // Mostrar la puntuación más alta actualizada

        // Mostrar notificación de haber comido la manzana
        showNotification("Apple Eaten!");

        // Enviar la puntuación más alta al servidor a través de WebSocket
        const datos = {
            game: 'Snake',
            event: 'highScore',
            player: localStorage.getItem("username"),
            value: highScore
        };

        var datosJSON = JSON.stringify(datos);
        ws.send(datosJSON);
    }

    // Mover la serpiente según la dirección actual
    snakeX += x;
    snakeY += y;

    // Actualizar la posición de los segmentos de la serpiente
    for (let i = snake.length - 1; i > 0; i--) snake[i] = snake[i - 1];
    snake[0] = [snakeX, snakeY];

    // Dibujar el fondo verde del canvas
    createRect(0, 0, canvas.width, canvas.height, "green");

    // Dibujar la manzana roja en su posición
    createRect(appleX, appleY, size, size, "red");

    // Dibujar cada segmento de la serpiente en amarillo
    for (let i = 0; i < snake.length; i++) {
        createRect(snake[i][0], snake[i][1], size, size, "yellow");

        // Verificar si la cabeza de la serpiente choca con su cuerpo
        if (snake[0][1] === snake[i][1] && i !== 0 && snake[0][0] === snake[i][0]) {
            gameOver = true;
        }
    }

    // Verificar si la serpiente choca con las paredes
    checkHitWall();
}

// Función para verificar si la serpiente choca con las paredes
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

// Posicionar la primera manzana al inicio del juego
applePosition();

// Iniciar el juego llamando a init cada 150 milisegundos
let game = setInterval(init, 150);

// Agregar evento para cambiar la dirección de la serpiente al presionar teclas
setTimeout(() => {
    document.addEventListener("keyup", changeDirection);
}, 2);

// Función para guardar el nombre de usuario en localStorage
function save() {
    const content = document.getElementById("username").value;
    localStorage.setItem("username", content);
    console.log("Username saved");
}

// Función para mostrar notificaciones al usuario
function showNotification(message) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            var notification = new Notification('Snake Game', {
                body: message,
                icon: 'serpiente.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    var notification = new Notification('Snake Game', {
                        body: message,
                        icon: 'serpiente.png'
                    });
                }
            });
        }
    }
}

// Función para vibrar el dispositivo con duración especificada
function vibrateDevice(duration) {
    if ("vibrate" in navigator) {
        navigator.vibrate([duration]); // Vibrar durante la duración especificada
    } else {
        console.log("Vibration API is not supported in this browser.");
    }
}

// Configuración del WebSocket
var ws = new WebSocket('wss://gamehubmanager.azurewebsites.net/ws');

// Manejar eventos del WebSocket
ws.onmessage = function(event) {
    console.log('Mensaje recibido del servidor:', event.data);
    const datos = JSON.parse(event.data);
    console.log(datos);
};

ws.onerror = function(event) {
    console.error('Error en la conexión WebSocket:', event);
};

ws.onclose = function(event) {
    console.log('Conexión WebSocket cerrada:', event);
};

// Evento para manejar la orientación del dispositivo
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
        const beta = event.beta; // Ángulo en grados (inclinación izquierda/derecha)
        const gamma = event.gamma; // Ángulo en grados (inclinación adelante/atrás)

        if (gameOver) return; // Ignorar si el juego ha terminado

        // Ajustar la dirección de la serpiente según la inclinación del dispositivo
        if (gamma > 10) {
            // Inclinación hacia adelante
            if (x !== -size) {
                x = 0;
                y = size;
            }
        } else if (gamma < -10) {
            // Inclinación hacia atrás
            if (x !== -size) {
                x = 0;
                y = -size;
            }
        } else if (beta > 10) {
            // Inclinación hacia la derecha
            if (y !== -size) {
                x = size;
                y = 0;
            }
        } else if (beta < -10) {
            // Inclinación hacia la izquierda
            if (y !== -size) {
                x = -size;
                y = 0;
            }
        } else if (beta > -10 && beta < 10 && gamma > -10 && gamma < 10) {
            // Posición vertical, continuar en la dirección actual
        }
    });
}

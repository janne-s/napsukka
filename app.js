const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// Resize canvas to fill screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Ball properties
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  vx: 0,
  vy: 0
};

// Gravity and physics constants
const gravity = 0; // Gravity force
const bounceFactor = 0.9; // Energy lost on bounce
const friction = 0.99; // Energy lost over time
const motionSensitivity = 0.35; // Sensitivity to motion events
const keyForce = 0.5; // Force applied when using arrow keys

// Wall collision states
let hasCollided = {
  left: false,
  right: false,
  top: false,
  bottom: false
};

// Draw the ball
function drawBall() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
}

// Update ball position
function updateBall() {
  // Apply gravity
  ball.vy += gravity;

  // Update position
  ball.x += ball.vx;
  ball.y += ball.vy;
  
  // Calculate ball speed
	const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

  // Detect and handle wall collisions
  if (ball.x - ball.radius < 0) {
	if (!hasCollided.left) {
	  playBounceSound(speed);
	  hasCollided.left = true;
	}
	ball.vx = -ball.vx * bounceFactor;
	ball.x = ball.radius;
  } else {
	hasCollided.left = false;
  }

  if (ball.x + ball.radius > canvas.width) {
	if (!hasCollided.right) {
	  playBounceSound(speed);
	  hasCollided.right = true;
	}
	ball.vx = -ball.vx * bounceFactor;
	ball.x = canvas.width - ball.radius;
  } else {
	hasCollided.right = false;
  }

  if (ball.y - ball.radius < 0) {
	if (!hasCollided.top) {
	  //playBounceSound(speed);
	  hasCollided.top = true;
	}
	ball.vy = -ball.vy * bounceFactor;
	ball.y = ball.radius;
  } else {
	hasCollided.top = false;
  }

  if (ball.y + ball.radius > canvas.height) {
	if (!hasCollided.bottom) {
	  //playBounceSound(speed);
	  hasCollided.bottom = true;
	}
	ball.vy = -ball.vy * bounceFactor;
	ball.y = canvas.height - ball.radius;
  } else {
	hasCollided.bottom = false;
  }

  // Apply friction
  ball.vx *= friction;
  ball.vy *= friction;
}

// Animation loop
let animationId;
function animate() {
  drawBall();
  updateBall();
  animationId = requestAnimationFrame(animate);
}

// Request motion sensor permission (for iOS)
function requestMotionPermission() {
	if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
		DeviceMotionEvent.requestPermission();
	}
	
	window.addEventListener("devicemotion", handleMotion);
}

// Handle device motion
function handleMotion(event) {
  const accelerationX = event.acceleration.x || 0; // Side-to-side motion
  const accelerationY = event.acceleration.y || 0; // Up-and-down motion

  // Apply forces to the ball based on motion
  ball.vx += accelerationX * motionSensitivity;
  ball.vy -= accelerationY * motionSensitivity; // Subtract to invert Y-axis
}

// Sound for bounce
const bounce = new Tone.Player("bounce.mp3").toDestination();

function playBounceSound(speed) {
	const maxSpeed = 50; // Maximum speed to normalize volume
	const minVolume = -40; // Minimum volume in decibels
	const maxVolume = 0; // Maximum volume in decibels
		
		// Normalize speed to a volume scale
	const volume = Math.min(maxVolume, Math.max(minVolume, (speed / maxSpeed) * (maxVolume - minVolume) + minVolume));
	bounce.volume.value = volume;
	bounce.start();
}

// Handle arrow key presses
function handleKeyDown(event) {
  switch (event.key) {
	case 'ArrowUp':
	  ball.vy -= keyForce;
	  break;
	case 'ArrowDown':
	  ball.vy += keyForce;
	  break;
	case 'ArrowLeft':
	  ball.vx -= keyForce;
	  break;
	case 'ArrowRight':
	  ball.vx += keyForce;
	  break;
  }
}

// Start button functionality
startButton.addEventListener('click', () => {
  startButton.style.display = 'none'; // Hide the button
  requestMotionPermission(); // Request motion permission
  Tone.start();
  //playBounceSound();
  animate(); // Start the animation
});

// Listen for keypress events
window.addEventListener('keydown', handleKeyDown);

// Handle screen resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
const introScreen = document.getElementById('intro-screen');
const startBtn = document.getElementById('startBtn');
const gameContainer = document.querySelector('.game-container');

startBtn.addEventListener('click', () => {
  // stop pulsing effect
  startBtn.style.animation = "none";

  // trigger fade-out animation
  introScreen.classList.add('fade-out');

  // after fade-out completes, hide intro and show game
  setTimeout(() => {
    introScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    bgMusic.play();
  }, 600);
});

const pickle = document.getElementById('pickle');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const multiplierEl = document.getElementById('multiplier');
const gameArea = document.getElementById('game-area');
const colorPicker = document.getElementById('pickleColor');
const bgMusic = document.getElementById('bgMusic');
const milestoneSound = document.getElementById('milestoneSound');

let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
highscoreEl.textContent = highscore;

let holding = false;
let pickleY = 20;
let objects = [];
let multiplier = 1;
let milestones = [1000, 10000, 50000, 100000];
let lastMilestone = 0;
let trailActive = false;
let lastBlink = 0;

bgMusic.volume = 0.15;

colorPicker.addEventListener('input', () => {
  pickle.style.background = colorPicker.value;
});

document.addEventListener('keydown', e => { if (e.code === 'Space') holding = true; });
document.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    holding = false;
    showEndScore(score);
    score = 0;
    pickleY = 20;
    multiplier = 1;
    lastMilestone = 0;
    multiplierEl.textContent = multiplier;
    pickle.style.bottom = pickleY + 'px';
    objects.forEach(obj => obj.remove());
    objects = [];
  }
});

function spawnCloud(y) {
  const cloud = document.createElement('div');
  cloud.className = 'cloud';
  cloud.style.bottom = y + 'px';
  cloud.style.left = Math.random() * 500 + 'px';
  gameArea.appendChild(cloud);
  objects.push(cloud);
  cloud.dataset.speed = 1;
}

function spawnRainbow(y) {
  if (Math.random() > 0.002) return;
  const rainbow = document.createElement('div');
  rainbow.className = 'rainbow';
  rainbow.style.bottom = y + 'px';
  rainbow.style.left = Math.random() * 500 + 'px';
  gameArea.appendChild(rainbow);
  objects.push(rainbow);
  spawnParticles(parseFloat(rainbow.style.left)+60, y+30);
  rainbow.dataset.speed = 1;
}

function spawnParticles(x, y) {
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + Math.random() * 20 - 10 + 'px';
    particle.style.bottom = y + Math.random() * 20 - 10 + 'px';
    particle.style.background = `hsl(${Math.random()*360}, 80%, 60%)`;
    gameArea.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}

function activateTrail() {
  trailActive = true;
  const trailInterval = setInterval(() => {
    if (!trailActive) return clearInterval(trailInterval);
    spawnParticles(275, gameArea.clientHeight/2);
  }, 100);
  setTimeout(() => trailActive = false, 2000);
}

function showMultiplierPopup(multiplier) {
  const popup = document.createElement('div');
  popup.className = 'multiplier-popup';
  popup.textContent = `Multiplier x${multiplier}!`;
  gameArea.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

function showEndScore(score) {
  const popup = document.createElement('div');
  popup.className = 'multiplier-popup';
  popup.textContent = `Your Score: ${score}`;
  popup.style.top = '250px';
  popup.style.fontSize = '2em';
  gameArea.appendChild(popup);
  setTimeout(() => popup.remove(), 2000);
}

function checkMilestones() {
  for (let i = 0; i < milestones.length; i++) {
    if (score >= milestones[i] && lastMilestone < milestones[i]) {
      multiplier++;
      lastMilestone = milestones[i];
      multiplierEl.textContent = multiplier;
      milestoneSound.volume = 0.3;
      milestoneSound.play();
      spawnParticles(275, gameArea.clientHeight/2);
      activateTrail();
      showMultiplierPopup(multiplier);
    }
  }
  if (score > 100000) {
    const next = Math.floor(score / 100000) * 100000;
    if (next > lastMilestone) {
      multiplier++;
      lastMilestone = next;
      multiplierEl.textContent = multiplier;
      milestoneSound.volume = 0.3;
      milestoneSound.play();
      spawnParticles(275, gameArea.clientHeight/2);
      activateTrail();
      showMultiplierPopup(multiplier);
    }
  }
}

function blinkPickle() {
  const eyes = pickle.querySelectorAll('.eye');
  eyes.forEach(eye => eye.style.transform = 'scaleY(0.1)');
  setTimeout(() => eyes.forEach(eye => eye.style.transform = 'scaleY(1)'), 200);
}

function gameLoop() {
  const now = Date.now();

  if (holding) {
    const angle = Math.sin(now/150) * 10;
    pickle.style.transform = `translateX(0) rotate(${angle}deg) scaleY(1.2) scaleX(0.8)`;
    pickleY += 3;
    score++;
    scoreEl.textContent = score;

    const gameHeight = gameArea.clientHeight;
    const pickleScreenPos = Math.max(20, gameHeight / 2 - 40);
    pickle.style.bottom = pickleScreenPos + 'px';

    objects.forEach(obj => {
      let speed = obj.dataset.speed ? parseFloat(obj.dataset.speed) : 1;
      obj.style.bottom = parseFloat(obj.style.bottom) - 3 * speed + 'px';
    });

    objects = objects.filter(obj => {
      if (parseFloat(obj.style.bottom) + obj.offsetHeight < 0 || parseFloat(obj.style.left) > gameArea.clientWidth) {
        obj.remove();
        return false;
      }
      return true;
    });

    if (Math.random() < 0.0075) spawnCloud(gameHeight + Math.random() * 200);
    spawnRainbow(gameHeight + Math.random() * 200);

    checkMilestones();

    if (score > highscore) {
      highscore = score;
      localStorage.setItem('highscore', highscore);
      highscoreEl.textContent = highscore;
    }
  } else {
    pickle.style.transform = `rotate(0deg) scaleY(1) scaleX(1)`;
  }

  if (now - lastBlink > 3000) {
    blinkPickle();
    lastBlink = now;
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();

// 무림고수 - 피하기 게임
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const size = 600;
const playerSize = 36;
const arrowLength = 44;
const arrowWidth = 16;
const arrowColor = '#ffb300';
const playerColor = '#2196f3';
let arrows = [];
let player, startTime, elapsed, timerId, gameState, arrowInterval, arrowSpeed, arrowRate, bgm, hitSound;

function resetGame() {
  player = {
    x: size / 2 - playerSize / 2,
    y: size / 2 - playerSize / 2,
    speed: 6,
    dx: 0,
    dy: 0
  };
  arrows = [];
  startTime = null;
  elapsed = 0;
  arrowInterval = 1400;
  arrowSpeed = 3.5;
  arrowRate = 1;
  gameState = 'playing';
  document.getElementById('timer').style.display = 'block';
  document.getElementById('time').textContent = '0.00';
  bgm.currentTime = 0;
  bgm.play();
  requestAnimationFrame(gameLoop);
  setTimeout(spawnArrow, 400);
}

function showStartScreen() {
  document.getElementById('start-screen').style.display = 'flex';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('gameover-screen').style.display = 'none';
  document.getElementById('timer').style.display = 'none';
  bgm.pause();
}

function showGameOver() {
  gameState = 'over';
  document.getElementById('game-canvas').style.display = 'none';
  document.getElementById('gameover-screen').style.display = 'flex';
  document.getElementById('timer').style.display = 'none';
  document.getElementById('final-time').textContent = `생존 시간: ${elapsed.toFixed(2)}초`;
  bgm.pause();
  hitSound.currentTime = 0;
  hitSound.play();
}

function spawnArrow() {
  if (gameState !== 'playing') return;
  for (let i = 0; i < arrowRate; i++) {
    const dir = Math.floor(Math.random() * 4); // 0:상 1:하 2:좌 3:우
    let x, y, angle, vx, vy;
    if (dir === 0) { // 위
      x = Math.random() * (size - arrowWidth);
      y = -arrowLength;
      angle = Math.PI / 2;
      vx = (size / 2 - x - arrowWidth / 2) / (size / 2) * arrowSpeed;
      vy = arrowSpeed;
    } else if (dir === 1) { // 아래
      x = Math.random() * (size - arrowWidth);
      y = size + arrowLength;
      angle = -Math.PI / 2;
      vx = (size / 2 - x - arrowWidth / 2) / (size / 2) * arrowSpeed;
      vy = -arrowSpeed;
    } else if (dir === 2) { // 왼쪽
      x = -arrowLength;
      y = Math.random() * (size - arrowWidth);
      angle = 0;
      vx = arrowSpeed;
      vy = (size / 2 - y - arrowWidth / 2) / (size / 2) * arrowSpeed;
    } else { // 오른쪽
      x = size + arrowLength;
      y = Math.random() * (size - arrowWidth);
      angle = Math.PI;
      vx = -arrowSpeed;
      vy = (size / 2 - y - arrowWidth / 2) / (size / 2) * arrowSpeed;
    }
    arrows.push({ x, y, vx, vy, angle });
  }
  // 난이도 증가
  if (arrowInterval > 500) arrowInterval -= 10;
  if (arrowSpeed < 8) arrowSpeed += 0.03;
  if (elapsed > 10 && arrowRate < 2) arrowRate = 2;
  if (elapsed > 25 && arrowRate < 3) arrowRate = 3;
  if (gameState === 'playing') setTimeout(spawnArrow, arrowInterval);
}

function drawPlayer() {
  const img = document.getElementById('onionkung-img');
  ctx.drawImage(img, player.x, player.y, playerSize, playerSize);
}

function drawArrow(a) {
  const img = document.getElementById('arrow-img');
  ctx.save();
  ctx.translate(a.x + arrowWidth / 2, a.y + arrowWidth / 2);
  ctx.rotate(a.angle);
  ctx.drawImage(img, -arrowLength / 2, -arrowWidth / 2, arrowLength, arrowWidth);
  ctx.restore();
}

function gameLoop(ts) {
  if (gameState !== 'playing') return;
  if (!startTime) startTime = ts;
  elapsed = (ts - startTime) / 1000;
  document.getElementById('time').textContent = elapsed.toFixed(2);
  ctx.clearRect(0, 0, size, size);
  drawPlayer();
  for (let i = 0; i < arrows.length; i++) {
    const a = arrows[i];
    a.x += a.vx;
    a.y += a.vy;
    drawArrow(a);
    // 충돌 체크
    if (
      a.x + arrowWidth > player.x &&
      a.x < player.x + playerSize &&
      a.y + arrowWidth > player.y &&
      a.y < player.y + playerSize
    ) {
      showGameOver();
      return;
    }
  }
  // 화면 밖 화살 제거
  arrows = arrows.filter(a => a.x > -arrowLength && a.x < size + arrowLength && a.y > -arrowLength && a.y < size + arrowLength);
  requestAnimationFrame(gameLoop);
}

function handleKey(e) {
  if (gameState !== 'playing') return;
  if (e.key === 'ArrowLeft') player.x -= player.speed;
  if (e.key === 'ArrowRight') player.x += player.speed;
  if (e.key === 'ArrowUp') player.y -= player.speed;
  if (e.key === 'ArrowDown') player.y += player.speed;
  // 경계 체크
  if (player.x < 0) player.x = 0;
  if (player.x > size - playerSize) player.x = size - playerSize;
  if (player.y < 0) player.y = 0;
  if (player.y > size - playerSize) player.y = size - playerSize;
}

document.getElementById('start-btn').onclick = function() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-canvas').style.display = 'block';
  resetGame();
};
document.getElementById('restart-btn').onclick = function() {
  document.getElementById('gameover-screen').style.display = 'none';
  document.getElementById('game-canvas').style.display = 'block';
  resetGame();
};
document.addEventListener('keydown', handleKey);

// 모바일 터치 이동 지원
let touchStartX, touchStartY;
canvas.addEventListener('touchstart', function(e) {
  if (gameState !== 'playing') return;
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});
canvas.addEventListener('touchmove', function(e) {
  if (gameState !== 'playing') return;
  const t = e.touches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx < -10) player.x -= player.speed;
    if (dx > 10) player.x += player.speed;
  } else {
    if (dy < -10) player.y -= player.speed;
    if (dy > 10) player.y += player.speed;
  }
  // 경계 체크
  if (player.x < 0) player.x = 0;
  if (player.x > size - playerSize) player.x = size - playerSize;
  if (player.y < 0) player.y = 0;
  if (player.y > size - playerSize) player.y = size - playerSize;
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

window.onload = function() {
  bgm = document.getElementById('bgm');
  hitSound = document.getElementById('hit-sound');
  showStartScreen();
};

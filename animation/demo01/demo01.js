var canvas = document.getElementById('canvas'),

  context = canvas.getContext('2d'),

  paused = true,

  discs = [
    {
      x: 150,
      y: 250,
      lastX: 150,
      lastY: 250,
      velocityX: -3.2,
      velocityY: 3.5,
      radius: 25,
      innerColor: 'rgba(255,255,0,1)',
      middleColor: 'rgba(255,255,0,0.7)',
      outerColor: 'rgba(255,255,0,0.5)',
      strokeStyle: 'gray'
    }, {
      x: 50,
      y: 150,
      lastX: 50,
      lastY: 150,
      velocityX: 2.2,
      velocityY: 2.5,
      radius: 25,
      innerColor: 'rgba(100,145,230,1.0)',
      middleColor: 'rgba(100,145,230,0.7)',
      outerColor: 'rgba(100,145,230,0.5)',
      strokeStyle: 'blue'
    }, {
      x: 150,
      y: 75,
      lastX: 150,
      lastY: 75,
      velocityX: 1.2,
      velocityY: 1.5,
      radius: 25,
      innerColor: 'rgba(255,0,0,1.0)',
      middleColor: 'rgba(255,0,0,0.7)',
      outerColor: 'rgba(255,0,0,0.5)',
      strokeStyle: 'orange'
    }
  ],

  numDiscs = discs.length,

  animateButton = document.getElementById('animateButton');

function drawBackground() {
  var STEP_Y = 12,
      TOP_MARGIN = STEP_Y * 4,
      LEFY_MARGIN = STEP_Y * 3,
      i = canvas.height;

  context.strokeStyle = 'lightgray';
  context.lineWith = 0.5;

  while (i > TOP_MARGIN) {
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(canvas.width, i);
    context.stroke();
    i -= STEP_Y;
  }

  context.strokeStyle = 'rgba(100,0,0,0.3)';
  context.lineWith = 1;
  context.beginPath();
  context.moveTo(LEFY_MARGIN, 0);
  context.lineTo(LEFY_MARGIN, canvas.width);
  context.stroke();
}

function update(time) {
  var disc = null;

  // 速度方向转换
  for (var i = 0; i < discs.length; i++) {
    disc = discs[i]

    if (disc.x + disc.velocityX + disc.radius > canvas.width || disc.x + disc.velocityX - disc.radius < 0)
      disc.velocityX *= -1;

    if (disc.y + disc.velocityY + disc.radius > canvas.height || disc.y + disc.velocityY - disc.radius < 0)
      disc.velocityY *= -1;

    disc.x += disc.velocityX;
    disc.y += disc.velocityY;
  }
}

function draw() {
  var disc = null;

  for (var i = 0; i < discs.length; i++) {
    disc = discs[i];

    // 圆形渐变
    var gradient = context.createRadialGradient(disc.x, disc.y, 0, disc.x, disc.y, disc.radius);
    gradient.addColorStop(0.3, disc.innerColor);
    gradient.addColorStop(0.5, disc.middleColor);
    gradient.addColorStop(1.0, disc.outerColor);

    context.save();
    context.beginPath();
    context.arc(disc.x, disc.y, disc.radius, 0, Math.PI * 2, false);
    context.fillStyle = gradient;
    context.strokeStyle = disc.strokeStyle;
    context.fill();
    context.stroke();
    context.restore();
  }
}

// 帧数计算
var lastTime = 0;
function calculateFps() {
  var now = (+ new Date),
    fps = 1000 / (now - lastTime);

  lastTime = now;

  return fps;
}

var lastFpsUpdateTime = 0,
    lastFpsUpdate = 0;
function animate(time) {
  var fps = 0,
      now = +new Date;

  if (!time)
    time = +new Date;

  if (!paused) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    update(time);
    draw();

    fps = calculateFps();

    // 限制每1秒才更新帧数显示
    if (now - lastFpsUpdateTime > 1000) {
      lastFpsUpdateTime = now;
      lastFpsUpdate = fps;
    }

    context.fillStyle = 'cornflowerblue';
    context.fillText(lastFpsUpdate.toFixed() + 'fps', 20, 60);

    window.requestAnimationFrame(animate);
  }
}

animateButton.onclick = function(e) {
  paused = !paused

  if (paused) {
    animateButton.value = 'Animate';
  } else {
    window.requestAnimationFrame(animate);
    animateButton.value = 'Pause';
  }
}

context.font = '48px Helvetica';

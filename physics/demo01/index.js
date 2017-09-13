var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  animateButton = document.getElementById('animateButton'),
  secondsInput = document.getElementById('secondsInput')

  showMouseLocation = false,
  mouse = {
    x: 0,
    y: 0
  },
  fps = 0,

  RIGHT = 1,
  LEFT = 2,
  BALL_RADIUS = 10,
  GRAVITY_FORCE = 9.81, // 重力
  PLATFORM_HEIGHT_IN_METERS = 10,
  LEDGE_LEFT = 350,
  LEDGE_TOP = 50,
  LEDGE_WIDTH = 100,
  LEDGE_HEIGHT = 10,

  pixelsPerMeter = (canvas.height - LEDGE_TOP) / PLATFORM_HEIGHT_IN_METERS, // 像素和米比例

  fallingAnimationTimer = new AnimationTimer(2000),
  pushAnimationTimer = new AnimationTimer(1000),
  arrow = LEFT,

  moveBall = {
    execute: function (sprite, ctx, time) {
      if (pushAnimationTimer.isRunning()) {
        if (arrow === LEFT) sprite.left -= sprite.velocityX / fps
        else sprite.left += sprite.velocityX / fps;

        if (isBallOnLedge()) {
          if (pushAnimationTimer.getElapsedTime() > 200) {
            pushAnimationTimer.stop();
          }
        } else if (!fallingAnimationTimer.isRunning()) {
          startFalling();
        }
      }

      if (fallingAnimationTimer.isRunning()) {
        console.log(fallingAnimationTimer.isRunning());
        sprite.velocityY = GRAVITY_FORCE * (fallingAnimationTimer.getElapsedTime() / 1000) * pixelsPerMeter;
        sprite.top += sprite.velocityY / fps;

        if (sprite.top > canvas.height) stopFalling();
      }
    }
  },
  ball = new Sprite('ball', {
    paint: function () {
      context.save();
      context.beginPath();

      context.lineWidth = 0.5;
      context.strokeStyle = '#000';
      context.fillStyle = 'rgb(28, 159, 124)';
      context.arc(ball.left + ball.width / 2, ball.top + ball.height / 2, ball.width / 2, 0, Math.PI*2, false);
      context.fill();
      context.stroke();

      context.closePath();
      context.restore();
    }
  },
  [ moveBall ]),

  startBtn = new Polygon(400, 150, 30, 3, -Math.PI / 2, '#000', 'rgb(45, 177, 233)', true);

function isBallOnLedge() {
   return ball.left + BALL_RADIUS > LEDGE_LEFT &&
          ball.left < LEDGE_LEFT + LEDGE_WIDTH;
}

function done() {
  animateButton.value = 'Start';
  secondsInput.value = 0;
  pointer.angle = Math.PI / 2;
}

function startFalling() {
   fallingAnimationTimer.start();
   ball.velocityY = 0;
}

function stopFalling() {
   fallingAnimationTimer.stop();
   pushAnimationTimer.stop();

   ball.left = LEDGE_LEFT + LEDGE_WIDTH/2 - BALL_RADIUS;
   ball.top = LEDGE_TOP - BALL_RADIUS*2;

   ball.velocityY = 0;
}

// #region 数据更新
function update(time) {
  updateBackgroud(time);
  updateFps(time);
  ball.update(context, time);
}

var lastFpsUpdateTime = 0,
  lastFpsUpdate = 0;
function updateFps(time) {
  // 限制每1秒才更新帧数显示
  if (time - lastFpsUpdateTime > 1000) {
    lastFpsUpdateTime = time;
    lastFpsUpdate = fps;
  }
}

function updateBackgroud(time) {
}

function updatePointer(time) {
  var elapsedTime = stopwatch.getElapsedTime(),
    seconds = timerSetting - elapsedTime / 1000;

  if (stopwatch.isRunning &&
      elapsedTime > timerSetting * 1000) {
    done();
  } else if (stopwatch.isRunning) {
    secondsInput.value = seconds.toFixed(2);
    pointer.angle = seconds / 60 * (Math.PI * 2) + Math.PI / 2;
  }
}
// #endregion

// #region 绘制
function draw() {
  drawGrid('lightgray', 10, 10);
  drawBackground();
  drawFps();
  if (showMouseLocation)
    drawGuidelines();

  // 开始按钮绘制
  startBtn.stroke(context);
  startBtn.fill(context);
  // 绘制平台
  drawPlatform();
  // 绘制球
  ball.paint();
}

function drawPlatform() {
  context.save();
  context.beginPath();

  context.strokeStyle = '#000';
  context.fillStyle = 'rgb(238, 194, 30)';
  context.lineWith = 0.5;
  context.rect(LEDGE_LEFT, LEDGE_TOP, LEDGE_WIDTH, LEDGE_HEIGHT);
  context.stroke();
  context.fill();

  context.closePath();
  context.restore();
}

function drawGrid(color, stepx, stepy) {
   context.save()

   context.shadowColor = undefined;
   context.shadowOffsetX = 0;
   context.shadowOffsetY = 0;

   context.strokeStyle = color;
   context.lineWidth = 0.5;

   for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
     context.beginPath();
     context.moveTo(i, 0);
     context.lineTo(i, context.canvas.height);
     context.stroke();
   }

   for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
     context.beginPath();
     context.moveTo(0, i);
     context.lineTo(context.canvas.width, i);
     context.stroke();
   }

   context.restore();
}

function drawFps() {
  context.save();
  context.fillStyle = 'cornflowerblue';
  context.fillText(lastFpsUpdate.toFixed() + 'fps', 20, 60);
  context.restore();
}

function drawGuidelines() {
  context.save();
  context.fillStyle = 'cornflowerblue';
  context.fillText('x:' + mouse.x + ' y:' + mouse.y, 20, 128);

  context.strokeStyle = 'rgba(0,0,230,0.8)';
  context.lineWith = 0.5;

  // 水平线
  context.beginPath();
  context.moveTo(0, mouse.y + 0.5);
  context.lineTo(canvas.width, mouse.y + 0.5);
  context.stroke();

  // 垂直线
  context.beginPath();
  context.moveTo(mouse.x + 0.5, 0);
  context.lineTo(mouse.x + 0.5, canvas.height);
  context.stroke();

  context.restore();
}

function drawBackground() {
}
// #endregion

// #region 事件处理
function startBtnDownListener(m) {
  var points = startBtn.getPoints();

  var maxX = points[0].x, maxY = points[0].y, minX = points[0].x, minY = points[0].y;
  for (var i = 1; i < points.length; i++) {
    maxX = points[i].x > maxX ? points[i].x : maxX;
    minX = points[i].x < minX ? points[i].x : minX;
    maxY = points[i].y > maxY ? points[i].y : maxY;
    minY = points[i].y < minY ? points[i].y : minY;
  }

  if (m.x <= maxX && m.x >= minX
    && m.y <= maxY && m.y >= minY) {
    startBtn.fillStyle = 'rgb(117, 123, 236)';
  }
}

function startBtnUpListener(m) {
  var points = startBtn.getPoints();

  var maxX = points[0].x, maxY = points[0].y, minX = points[0].x, minY = points[0].y;
  for (var i = 1; i < points.length; i++) {
    maxX = points[i].x > maxX ? points[i].x : maxX;
    minX = points[i].x < minX ? points[i].x : minX;
    maxY = points[i].y > maxY ? points[i].y : maxY;
    minY = points[i].y < minY ? points[i].y : minY;
  }

  if (m.x <= maxX && m.x >= minX
    && m.y <= maxY && m.y >= minY) {
    startBtn.fillStyle = 'rgb(45, 177, 233)';
    pushAnimationTimer.start();
  }
}

canvas.onmousedown = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);

  startBtnDownListener(mouse);
};
canvas.onmousemove = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
};

canvas.onmouseup = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);

  startBtnUpListener(mouse);
}

canvas.addEventListener('touchstart', function (e) {
  mouse = windowToCanvas(canvas, e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener('touchmove', function (e) {
  mouse = windowToCanvas(canvas, e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener('touchend', function (e) {
  mouse = windowToCanvas(canvas, e.touches[0].clientX, e.touches[0].clientY);
});
// #endregion

function main(time) {
  erase(context);
  update(time);
  draw();

  fps = calculateFps(time);
  window.requestNextAnimationFrame(main);
}

animateButton.onclick = function(e) {
  if (stopwatch.isRunning()) {
    animateButton.value = 'Start';
    stopwatch.stop();
    secondsInput.disabled = false;
  } else {
    timerSetting = parseFloat(secondsInput.value);
    secondsInput.disabled = true;
    animateButton.value = 'Pause';
    stopwatch.start();
  }
}
chk_mouseLocation.onclick = function (e) {
  showMouseLocation = e.target.checked;
}

context.font = '48px Helvetica';
ball.left = 400;
ball.top = LEDGE_TOP - ball.height*2;
ball.width = ball.height = BALL_RADIUS * 2;
ball.velocityX = 110;
ball.velocityY = 0;

window.requestNextAnimationFrame(main);

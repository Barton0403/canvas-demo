var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  animateButton = document.getElementById('animateButton'),
  secondsInput = document.getElementById('secondsInput')

  showMouseLocation = false,
  mouse = {
    x: 0,
    y: 0
  },

  timer = new AnimationTimer(10),

  timerSetting = 10,
  circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 150
  },
  pointer = {
    angle: Math.PI / 2
  };

function done() {
  animateButton.value = 'Start';
  secondsInput.value = 0;
  stopwatch.stop();
  pointer.angle = Math.PI / 2;
}

// #region 数据更新
function update(time) {
  updateBackgroud(time);
  updateFps(time);
  if (stopwatch.isRunning())
    updatePointer(time);
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
  drawPointer();
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
  // 边框
  context.save();
  context.strokeStyle = 'rgb(0, 0, 0)';
  context.lineWidth = 0.5;
  context.fillStyle = '#fff';
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2, false);
  context.fill();
  context.stroke();
  context.restore();

  // 刻度
  context.save();
  context.lineWidth = 0.5;

  var ANGLE_DELTA = Math.PI/150,
      TICK_WIDTH = 15;
  for (var angle = 0, i = 0; angle < Math.PI*2; angle += ANGLE_DELTA, i++) {
    if (i == 0) continue;

    context.beginPath();
    if (i % 25 == 0) {
      context.moveTo(circle.x + Math.cos(angle) * (circle.radius - TICK_WIDTH), circle.y - Math.sin(angle) * (circle.radius - TICK_WIDTH));
      context.lineTo(circle.x + Math.cos(angle) * circle.radius, circle.y - Math.sin(angle) * circle.radius);
    } else if (i % 5 == 0) {
      context.moveTo(circle.x + Math.cos(angle) * (circle.radius - TICK_WIDTH / 2), circle.y - Math.sin(angle) * (circle.radius - TICK_WIDTH / 2));
      context.lineTo(circle.x + Math.cos(angle) * circle.radius, circle.y - Math.sin(angle) * circle.radius);
    } else {
      context.moveTo(circle.x + Math.cos(angle) * (circle.radius - 4), circle.y - Math.sin(angle) * (circle.radius - 4));
      context.lineTo(circle.x + Math.cos(angle) * circle.radius, circle.y - Math.sin(angle) * circle.radius);
    }
    context.stroke();
  }
  context.restore();

  // 刻度秒数
  context.save();
  for (var angle = Math.PI / 2, i = 0; i <= 60; i++, angle += Math.PI / 30) {
    if (i == 0) continue;

    context.beginPath();
    if (i % 5 == 0) {
      context.font = '12px Helvetica';
      context.fillText(i,
        circle.x - 6 + Math.cos(angle) * (circle.radius + 10),
        circle.y + 6 - Math.sin(angle) * (circle.radius + 10));
    }
  }
  context.restore();
}

function drawPointer() {
  context.save();
  context.lineWidth = 0.5;

  context.beginPath();
  context.moveTo(circle.x, circle.y);
  context.lineTo(circle.x + circle.radius * Math.cos(pointer.angle),
                circle.y - circle.radius * Math.sin(pointer.angle));
  context.stroke();
  context.restore();
}
// #endregion

// #region 事件处理
canvas.onmousedown = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
};

canvas.onmousemove = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
};

canvas.onmouseup = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
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
window.requestNextAnimationFrame(main);

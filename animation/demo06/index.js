var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  animateButton = document.getElementById('animateButton'),

  paused = true, // 暂停
  lastTime = 0, // 上次从浏览器启动到动画上次更新花费的时间
  fps = 0,

  showMouseLocation = false,
  mouse = {
    x: 0,
    y: 0
  },

  animating = false,
  dragging = false,
  mousedown = null,
  mouseup = null,

  disc = {
    x: 150,
    y: 250,
    lastX: 150,
    lastY: 250,
    velocityX: 0,
    velocityY: 0,
    radius: 25,
    innerColor: 'rgba(255,255,0,1)',
    middleColor: 'rgba(255,255,0,0.7)',
    outerColor: 'rgba(255,255,0,0.5)',
    strokeStyle: 'gray'
  };

// #region 数据更新
function update(time) {
  updateBackgroud(time);
  if (animating) {
    updateDisc(time);
  }
  updateFps(time);
}

function updateDisc(time) {
  // 计算帧速
  deltaX = disc.velocityX / fps,
  deltaY = disc.velocityY / fps;

  if (disc.x + deltaX + disc.radius > canvas.width || disc.x + deltaX - disc.radius < 0) {
    disc.velocityX *= -1;
    deltaX *= -1;
  }

  if (disc.y + deltaY + disc.radius > canvas.height || disc.y + deltaY - disc.radius < 0) {
    disc.velocityY *= -1;
    deltaY *= -1;
  }

  disc.x += deltaX;
  disc.y += deltaY;
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
// #endregion

// #region 绘制
function draw() {
  drawBackground();
  drawDisc();
  drawFps();
  if (showMouseLocation)
    drawGuidelines();
}

function drawDisc() {
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
canvas.onmousedown = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
  mousedown = {
    x: mouse.x,
    y: mouse.y,
    time: (new Date).getTime()
  };

  if (animating) {
    animating = false;
    disc.velocityX = 0;
    disc.velocityY = 0;
  } else {
    dragging = true;
  }
};

canvas.onmousemove = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
  if (dragging) {
    disc.x = mouse.x;
    disc.y = mouse.y;
  }
};

canvas.onmouseup = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
  mouseup = {
    x: mouse.x,
    y: mouse.y,
    time: (new Date).getTime()
  };

  if (dragging) {
    if (didThrow()) {
      disc.velocityX = (mouseup.x - mousedown.x) * 4;
      disc.velocityY = (mouseup.y - mousedown.y) * 4;
      animating = true;
    } else {
      disc.velocityX = 0;
      disc.velocityY = 0;
    }
  }

  dragging = false;
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

function didThrow() {
  var elapsedTime = mouseup.time - mousedown.time;
  var elapsedMotion = Math.abs(mouseup.x - mousedown.x) + Math.abs(mouseup.y - mousedown.y);

  return (elapsedMotion / elapsedTime * 10) > 3;
}

function main(time) {
  if (!paused) {
    erase(context);
    update(time);
    draw();
  }

  fps = calculateFps(time);
  window.requestNextAnimationFrame(main);
}

animateButton.onclick = function(e) {
  paused = !paused;

  if (paused) {
    animateButton.value = 'Start';
  } else {
    animateButton.value = 'Pause';
  }
}
chk_mouseLocation.onclick = function (e) {
  showMouseLocation = e.target.checked;
}

context.font = '48px Helvetica';
window.requestNextAnimationFrame(main);

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

  spritesheet = new Image(),
  runnerCells = [
    { left: 1, top: 0, width: 49, height: 64 },
    { left: 53, top: 0, width: 49, height: 64 },
    { left: 105, top: 0, width: 43, height: 64 },
    { left: 151, top: 0, width: 48, height: 64 },
    { left: 202, top: 0, width: 47, height: 64 },
    { left: 262, top: 0, width: 52, height: 64 },
    { left: 317, top: 0, width: 51, height: 64 },
    { left: 371, top: 0, width: 48, height: 64 },
    { left: 422, top: 0, width: 39, height: 64 },
  ],

  // behaviors 行为...................................
  runInPlace = {
    lastAdvanceTime: 0,
    PAGEFLIP_INTERVAL: 100,

    execute: function (sprite, ctx, time) {
      if (time - this.lastAdvanceTime > this.PAGEFLIP_INTERVAL) {
        runner.painter.advance();
        this.lastAdvanceTime = time;
      }
    }
  },

  moveLeftToRight = {
    lastMoveTime: 0,

    execute: function (sprite, ctx, time) {
      if (this.lastMoveTime !== 0) {
        sprite.left -= sprite.velocityX * ((time - this.lastMoveTime) / 1000);

        if (sprite.left < 0)
          sprite.left = context.canvas.width;
      }

      this.lastMoveTime = time;
    }
  },
  // sprite 精灵.......................................
  runner = new Sprite('runner', new SpriteSheetPainter('../../images/running-sprite-sheet.png', runnerCells), [runInPlace, moveLeftToRight]);

// #region 数据更新
function update(time) {
  updateBackgroud(time);
  updateFps(time);

  runner.update(context, time)
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
  drawFps();

  runner.paint(context)

  if (showMouseLocation)
    drawGuidelines();
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
  if (spritesheet.complete) {
    context.drawImage(spritesheet, 0, 148, spritesheet.width, spritesheet.height);
  }
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
spritesheet.src = '../../images/running-sprite-sheet.png';

runner.left = canvas.width;
runner.top = 280;
runner.velocityX = 50;

window.requestNextAnimationFrame(main);

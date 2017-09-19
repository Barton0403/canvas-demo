var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),

    animationBtn = document.getElementById('btn_animation'),

    linearRadio = document.getElementById('ani_linear'),
    easeInRadio = document.getElementById('ani_ease-in'),
    easeOutRadio = document.getElementById('ani_ease-out'),
    easeInOutRadio = document.getElementById('ani_ease-in-out'),
    elasticRadio = document.getElementById('ani_elastic'),
    bounceRadio = document.getElementById('ani_bounce'),

    fps = 0,
    pause = true,

    linear = AnimationTimer.makeLinear(),
    easeIn = AnimationTimer.makeEaseIn(1),
    easeOut = AnimationTimer.makeEaseOut(1),
    easeInOut = AnimationTimer.makeEaseInOut(),
    elastic = AnimationTimer.makeElastic(5),
    bounce = AnimationTimer.makeBounce(5),

    animation = new AnimationTimer(5000, linear),

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
    baseline = {
      left: 1,
      right: canvas.width - runnerCells[0].width,
      top: canvas.height - 50,
      tick_height: 8.5,
      width: canvas.width - runnerCells[0].width - 1
    },
    timeline = {
      top: 0,
      left: baseline.right,
      height: 200
    },

    // 滚动行为
    runInPlace = {
      lastAdvanceTime: 0,
      pageflip_interval: 100,

      execute: function (sprite, ctx, time) {
        if (animation.isRunning()) {
          var elapsedTime = animation.getElapsedTime();

          if (elapsedTime - this.lastAdvanceTime > this.pageflip_interval) {
            sprite.painter.advance();
            this.lastAdvanceTime = elapsedTime;
          }
        } else if (this.lastAdvanceTime != 0) {
          this.lastAdvanceTime = 0
        }
      }
    },
    // 从右移动到左边行为
    moveRightToLeft = {
      lastTime: 0,

      execute: function (sprite, ctx, time) {
        if (animation.isRunning()) {
          var elapsedTime = animation.getElapsedTime();

          if (this.lastTime > 0) {
            sprite.left -= sprite.velocityX * (elapsedTime - this.lastTime) / 1000;
          }

          this.lastTime = elapsedTime;
        }
      }
    },
    runner = new Sprite('runner', new SpriteSheetPainter('../../images/running-sprite-sheet.png', runnerCells), [ runInPlace, moveRightToLeft ]);

function update(time) {
  if (!pause)
    updateTimeLine();
  runner.update(time);
}

var lastTimeLineUpdateTime = 0;
function updateTimeLine() {
  if (animation.isRunning()) {
    var elapsedTime = animation.getRealElapsedTime();

    if (lastTimeLineUpdateTime > 0) {
      timeline.left -= runner.velocityX * ((elapsedTime - lastTimeLineUpdateTime) / 1000);
    }

    lastTimeLineUpdateTime = elapsedTime;
  }
}

function draw() {
  drawAxis();
  drawTimeLine();
  runner.paint();
}

function drawTimeLine() {
  context.save();

  context.lineWidth = 0.5;

  context.beginPath();
  context.moveTo(timeline.left, baseline.top - timeline.height);
  context.lineTo(timeline.left, baseline.top);
  context.stroke();

  context.restore();
}

function drawAxis() {
  context.save();

  context.lineWidth = 0.5;
  context.strokeStyle = 'cornflowerblue';

  context.beginPath();
  context.moveTo(baseline.left, baseline.top);
  context.lineTo(baseline.right, baseline.top);
  context.stroke();

  for (var i = 0; i <= baseline.width; i+=baseline.width/20) {
    context.beginPath();
    context.moveTo(baseline.left + i, baseline.top - baseline.tick_height / 2);
    context.lineTo(baseline.left + i, baseline.top + baseline.tick_height / 2);
    context.stroke();
  }

  for (var i = 0; i <= baseline.width; i+=baseline.width/4) {
    context.beginPath();
    context.moveTo(baseline.left + i, baseline.top - baseline.tick_height);
    context.lineTo(baseline.left + i, baseline.top +　baseline.tick_height);
    context.stroke();
  }

  context.restore();
}

function main(time) {
  erase(context);
  update(time);
  draw();

  if (animation.isOver()) {
    animation.stop();
  }

  fps = calculateFps(time);
  window.requestNextAnimationFrame(main);
}

// listener
linearRadio.onchange = function (e) {
  animation.timeWarp = linear;
};
easeInRadio.onchange = function (e) {
  animation.timeWarp = easeIn;
};
easeOutRadio.onchange = function (e) {
  animation.timeWarp = easeOut;
};
easeInOutRadio.onchange = function (e) {
  animation.timeWarp = easeInOut;
};
elasticRadio.onchange = function (e) {
  animation.timeWarp = elastic;
};
bounceRadio.onchange = function (e) {
  animation.timeWarp = bounce;
};

animationBtn.onclick = function (e) {
  pause = !pause;

  if (!pause) {
    animationBtn.innerText = 'stop';
    animation.start();
  } else {
    animationBtn.innerText = 'start';
    animation.stop();
  }
};


// init
runner.left = baseline.right;
runner.top = baseline.top - runnerCells[0].height;
runner.velocityX = 100;

window.requestNextAnimationFrame(main);

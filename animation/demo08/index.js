var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),

    linearRadio = document.getElementById('ani_linear'),
    easeInRadio = document.getElementById('ani_ease-in'),
    easeOutRadio = document.getElementById('ani_ease-out'),
    easeInOutRadio = document.getElementById('ani_ease-in-out'),
    elasticRadio = document.getElementById('ani_elastic'),
    bounceRadio = document.getElementById('ani_bounce'),

    fps = 0,

    linear = AnimationTimer.makeLinear(),
    easeIn = AnimationTimer.makeEaseIn(1),
    easeOut = AnimationTimer.makeEaseOut(1),
    easeInOut = AnimationTimer.makeEaseInOut(),
    elastic = AnimationTimer.makeElastic(5),
    bounce = AnimationTimer.makeBounce(5),

    MOVE_LEFT = -1,
    MOVE_RIGHT = 1,

    animation = new AnimationTimer(5000, linear),
    moveDirection = MOVE_RIGHT,

    LEDGE = {
      width: canvas.width - 100,
      height: 20,
      left: 50,
      top: canvas.height - 50
    },

    // 滚动行为
    move = {
      lastTime: null,

      resetBall: function (sprite) {
        sprite.left = LEDGE.left;
      },

      execute: function (sprite, ctx, time) {
        if (animation.isRunning()) {
          var elapsedTime = animation.getElapsedTime();

          if (this.lastTime) {
            sprite.left += (sprite.velocityX * (elapsedTime - this.lastTime) / 1000) * moveDirection;
          }

        }
        this.lastTime = elapsedTime;
      }
    },

    BALL_RADIO = 20,
    ball = new Sprite('ball', {
      paint: function (sprite, ctx) {
        ctx.save();

        ctx.lineWidth = 0.5;
        ctx.fillStyle = 'rgb(52, 56, 89)';
        ctx.beginPath();
        ctx.arc(ball.left, ball.top, ball.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }, [ move ]);

function update(time) {
  ball.update(time);
}

function draw() {
  drawLedge();
  ball.paint();
}

function drawLedge() {
  context.save();

  context.lineWidth = 0.5;
  context.fillStyle = 'rgb(135, 236, 48)';
  context.beginPath();
  context.rect(LEDGE.left, LEDGE.top, LEDGE.width, LEDGE.height);
  context.fill();
  context.stroke();

  context.restore();
}

function main(time) {
  erase(context);
  update(time);
  draw();

  if (animation.isRunning() && animation.isOver()) {
    console.log(animation.getElapsedTime());
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

window.onkeydown = function (e) {
  if (animation.isRunning()) return;

  if (e.keyCode === 39) {
    moveDirection = MOVE_RIGHT;
    animation.start();
  } else if (e.keyCode == 37) {
    moveDirection = MOVE_LEFT;
    animation.start();
  }
}

// init
ball.radius = BALL_RADIO;
ball.width = ball.height = ball.radius*2;
ball.left = LEDGE.left;
ball.top = LEDGE.top - ball.radius;
ball.velocityX = 100;

window.requestNextAnimationFrame(main);

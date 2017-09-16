var GRAVITY_FORCE = 9.81,

    canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),

    scoreboard = document.getElementById('scoreboard'),
    launchVelocityOutput = document.getElementById('launchVelocityOutput'),
    launchAngleOutput = document.getElementById('launchAngleOutput'),

    fps = 0,
    pixelsPerMeter = canvas.width / 10,

    ballInFlight = false,
    threePointer = false,
    launchVelocity = 0,
    launchAngle = 0,
    launchTime = 0,
    score = 0,

    mouse = { x: 0, y: 0 },

    launchpad = {
      x: 50,
      y: canvas.height - 50,
      w: 50,
      h: 12
    },

    // 球进入桶内
    catchBall = {
      ballInBucket: function () {
        return ball.left > (bucket.left + bucket.width / 2) && ball.left < bucket.left + bucket.width && ball.top > bucket.top && ball.top < bucket.top + bucket.height / 3;
      },

      adjustScore: function () {
        if (threePointer) score += 3;
        else score += 2;

        scoreboard.innerText = score;
      },

      execute: function (sprite, ctx, time) {
        if (ballInFlight && this.ballInBucket()) {
          reset();
          this.adjustScore();
        }
      }
    },

    bucket = new Sprite('bucket', new ImagePainter('../../images/bucket.png'), [ catchBall ]),

    // 球飞出行为
    lob = {
      applyGravity: function (elapsedTime) {
        ball.velocityY = (GRAVITY_FORCE * elapsedTime) - launchVelocity * Math.sin(launchAngle);
      },

      updateBallPosition: function () {
        ball.left += ball.velocityX / fps * pixelsPerMeter;
        ball.top += ball.velocityY / fps * pixelsPerMeter;
      },

      checkForThreePointer: function () {
        if (ball.top < 0) threePointer = true;
      },

      checkBallBounds: function () {
        if (ball.top > canvas.height || ball.left > canvas.width) {
          reset();
        }
      },

      execute: function (sprite, ctx, time) {
        var elapsedFlightTime;

        if (ballInFlight) {
          elapsedFlightTime = (new Date() - launchTime) / 1000;

          this.applyGravity(elapsedFlightTime);
          this.updateBallPosition();
          this.checkForThreePointer();
          this.checkBallBounds();
        }
      }
    },
    ball = new Sprite('ball', {
      paint: function (sprite, ctx) {
        context.save();

        context.lineWidth = 2;
        context.fillStyle = 'rgb(255,255,0)';
        context.strokeStyle = 'rgb(0, 0, 0)';

        context.beginPath();
        context.arc(sprite.left, sprite.top, sprite.radius, 0, Math.PI*2, false);
        // context.clip();
        context.fill();
        context.stroke();

        context.restore();
      }
    }, [ lob ]);

function reset() {
  ballInFlight = false;
  ball.velocityY = 0;
  ball.velocityX = 0;
  ball.left = launchpad.x + launchpad.w / 2;
  ball.top = launchpad.y - ball.radius;
}

function update(time) {
  ball.update(context, time);
  bucket.update(context, time);
}

function draw() {
  drawBackground();
  bucket.paint(context);
  if (!ballInFlight)
    drawGuidewire();
  ball.paint(context);
}

function drawGuidewire() {
  context.save();
  context.lineWidth = 0.5;
  context.beginPath();
  context.moveTo(ball.left, ball.top);
  context.lineTo(mouse.x, mouse.y);
  context.stroke();
  context.restore();
}

function drawBackground() {
  context.save();
  context.fillStyle = 'rgb(63, 92, 157)';
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fill();
  context.restore();

  context.save();
  context.lineWidth = 0.5;
  context.fillStyle = 'rgb(63, 129, 157)';
  context.strokeStyle = 'rgb(0, 0, 0)';
  context.beginPath();
  context.rect(launchpad.x, launchpad.y, launchpad.w, launchpad.h);
  context.fill();
  context.stroke();
  context.restore();
}

function main(time) {
  erase(context);
  update(time);
  draw();

  fps = calculateFps(time);
  window.requestNextAnimationFrame(main);
}

canvas.onmousemove = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
  var deltaX, deltaY;

  if (!ballInFlight) {
    deltaX = Math.abs(mouse.x - ball.left);
    deltaY = Math.abs(mouse.y - ball.top);

    // 初始角度
    launchAngle = Math.atan(parseFloat(deltaY) / parseFloat(deltaX));
    // 初始速度
    launchVelocity = 4 * deltaY / Math.sin(launchAngle) / pixelsPerMeter;

    // 显示面板初始化
    launchVelocityOutput.innerText = launchVelocity.toFixed(2);
    launchAngleOutput.innerText = (launchAngle*180/Math.PI).toFixed(2);
  }
};
canvas.onmousedown = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);

  if (!ballInFlight && mouse.x > ball.left && mouse.y < ball.top) {
    ball.velocityY = Math.sin(launchAngle) * launchVelocity;
    ball.velocityX = Math.cos(launchAngle) * launchVelocity;
    threePointer = false;
    ballInFlight = true;
    launchTime = +new Date();
  }
};

ball.radius = 8;
ball.width = ball.height = ball.radius * 2;
ball.left = launchpad.x + launchpad.w / 2;
ball.top = launchpad.y - ball.radius;

bucket.left = 668;
bucket.top = canvas.height - 100;
bucket.width = 83;
bucket.height = 62;

window.requestNextAnimationFrame(main);

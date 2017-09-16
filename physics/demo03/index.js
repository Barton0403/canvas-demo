var GRAVITY_FORCE = 9.81,

    canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),

    fps = 0,
    pixelsPerMeter = canvas.width / 10,
    mouse = { x: 0, y: 0 },

    initAngle = Math.PI / 4,
    launchAngle = Math.PI / 4,
    launchTime = 0,

    // 钟摆摇摆动作
    swing = {
      execute: function (sprite, ctx, time) {
        var elapsedTime = (new Date() - launchTime) / 1000;

        // 更新角度, 顺时针旋转90度更改0度初始位置
        launchAngle = initAngle * Math.cos(Math.sqrt(GRAVITY_FORCE/GUIDEWIRE_LENGTH) * elapsedTime) + Math.PI / 2;

        // 更新球的位置
        ball.left = DIAN.left + GUIDEWIRE_LENGTH * Math.cos(launchAngle) * pixelsPerMeter;
        ball.top = DIAN.top + GUIDEWIRE_LENGTH * Math.sin(launchAngle) * pixelsPerMeter;
      }
    },
    ball = new Sprite('ball', {
      paint: function (sprite, ctx) {
        context.save();
        context.lineWidth = 0.5;
        context.fillStyle = 'rgb(52, 17, 173)';
        context.beginPath();
        context.arc(sprite.left, sprite.top, sprite.radius, 0, Math.PI*2, false);
        context.fill();
        context.stroke();
        context.restore();
      }
    }, [ swing ]),

    DIAN = {
      top: 50,
      left: canvas.width / 2,
      radius: 5
    },
    GUIDEWIRE_LENGTH = 3; // m

function update(time) {
  ball.update(context, time);
}

function draw() {
  drawBackground();
  drawGuidewire();
  drawDian();
  ball.paint(context);
}

function drawDian() {
    context.save();
    context.lineWidth = 0.5;
    context.fillStyle = 'rgb(63, 129, 157)';
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.beginPath();
    context.arc(DIAN.left, DIAN.top, DIAN.radius, 0, Math.PI*2, false);
    context.fill();
    context.stroke();
    context.restore();
}

function drawGuidewire() {
  context.save();
  context.lineWidth = 0.5;
  context.beginPath();
  context.moveTo(DIAN.left, DIAN.top);
  context.lineTo(ball.left, ball.top);
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
}

function main(time) {
  erase(context);
  update(time);
  draw();

  fps = calculateFps(time);
  window.requestNextAnimationFrame(main);
}

ball.radius = 30;
ball.width = ball.height = ball.radius * 2;
ball.left = DIAN.left + GUIDEWIRE_LENGTH * Math.cos(launchAngle) * pixelsPerMeter;
ball.top = DIAN.top + GUIDEWIRE_LENGTH * Math.sin(launchAngle) * pixelsPerMeter;
launchTime = +new Date();

window.requestNextAnimationFrame(main);

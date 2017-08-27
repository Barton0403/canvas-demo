var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),

  RADIUS = 75,
  ball = new Sprite('ball', {
    paint: function (sprite, ctx) {
      ctx.beginPath();
      ctx.arc(sprite.left + sprite.width / 2,
        sprite.top + sprite.height / 2, RADIUS, 0, Math.PI*2, false);
      ctx.clip();

      ctx.shadowColor = 'rgb(0,0,0)';
      ctx.shadowOffsetX = -4;
      ctx.shadowOffsetY = -4;
      ctx.shadowBlur = 8;

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(100,100,195)';
      ctx.fillStyle = 'rgba(30,144,255,0.15)';
      ctx.fill();
      ctx.stroke();
    }
  });

// 网格绘制
function drawGrid(color, stepx, stepy) {
  context.strokeStyle = color;
  context.lineWidth = 0.5;

  for (var i = stepx + 0.5; i < canvas.width; i += stepx) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, canvas.height);
    context.stroke();
  }

  for (var i = stepy + 0.5; i < canvas.height; i += stepy) {
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(canvas.width, i);
    context.stroke();
  }
}

drawGrid('lightgray', 10, 10);
ball.left = 320;
ball.top = 160;
ball.paint(context);

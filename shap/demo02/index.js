var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  fps = 0,

  mouse = {
    x: 0,
    y: 0
  },
  lastdrag = {
    x: 0,
    y: 0
  },
  shapeBeginDragged = null,
  myShaps = [
    new Polygon(80, 50, 30, 3),
    new Polygon(110, 150, 60, 4, Math.PI / 4),
    new Polygon().setPoints([
      new Point(400, 100),
      new Point(380, 150),
      new Point(500, 150),
      new Point(520, 100)
    ]),
  ],
  ballSprite = new Sprite('ball', new ImagePainter('../../images/tennis-ball.png'));

// #region 更新
// 检查碰撞
function detectCollisions () {
  var shape;
  for (var i = 0; i < myShaps.length; i++) {
    shape = myShaps[i];

    if (shape !== shapeBeginDragged) {
      if (shapeBeginDragged.collidesWith(shape)) {
        console.log('碰撞');
      }
    }
  }
}

function update(time) {
  // 拖动
  if (shapeBeginDragged) {
    shapeBeginDragged.move(mouse.x - lastdrag.x, mouse.y - lastdrag.y);

    lastdrag.x = mouse.x;
    lastdrag.y = mouse.y;

    detectCollisions();
  }
}
// #endregion

// #region 绘制
function draw() {
  drawShapes();
}

function drawBackground() {
  context.save();

  context.fillStyle = 'rgb(4, 156, 78)';
  context.rect(0, 0, canvas.width, canvas.height);
  context.fill();

  context.restore();
}

function drawShapes() {
  var shape;

  for (var i = 0; i < myShaps.length; i++) {
    shape = myShaps[i];
    shape.stroke(context);
    shape.fill(context);
  }
}
// #endregion

function main(time) {
  erase(context);
  update(time);
  draw();

  fps = calculateFps(time);
  window.requestNextAnimationFrame(main);
}

// 监听
canvas.onmousedown = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);

  for (var i = 0; i < myShaps.length; i++) {
    var shap = myShaps[i];

    if (shap.isPointInPath(context, mouse.x, mouse.y)) {
      shapeBeginDragged = shap;
      lastdrag.x = mouse.x;
      lastdrag.y = mouse.y;
    }
  }
}
canvas.onmousemove = function(e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
};
canvas.onmouseup = function(e) {
  shapeBeginDragged = null;
};

// init
ballSprite.top = 100;
ballSprite.left = 100;
ballSprite.width = 79;
ballSprite.height = 79;

myShaps.push(new ImageShape('../../images/golfball.png', 200, 50));
myShaps.push(new SpriteShape(ballSprite, 120, 200));

window.requestNextAnimationFrame(main);

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
  polygons = [
    new Polygon(80, 50, 30, 3),
    new Polygon(110, 150, 60, 4, Math.PI / 4),
    new Polygon().setPoints([
      new Point(400, 100),
      new Point(380, 150),
      new Point(500, 150),
      new Point(520, 100)
    ])
  ];

// 检查碰撞
function detectCollisions () {
  var shape;

  for (var i = 0; i < polygons.length; i++) {
    shape = polygons[i];

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

function draw() {
  drawPolygons();
}

function drawPolygons() {
  context.save();

  for (var i = 0; i < polygons.length; i++) {
    var polygon = polygons[i];

    polygon.createPath(context);
    polygon.stroke(context);
    polygon.fill(context);
  }

  context.restore();
}

function main(time) {
  erase(context);
  update(time);
  draw();

  fps = calculateFps(time);
  window.requestNextAnimationFrame(main);
}

canvas.onmousedown = function(e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);

  for (var i = 0; i < polygons.length; i++) {
    var polygon = polygons[i];

    if (polygon.isPointInPath(context, mouse.x, mouse.y)) {
      shapeBeginDragged = polygon;
      lastdrag.x = mouse.x;
      lastdrag.y = mouse.y;
    }
  }
};

canvas.onmousemove = function(e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
};

canvas.onmouseup = function(e) {
  shapeBeginDragged = null;
};

window.requestNextAnimationFrame(main);

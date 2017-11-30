var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  fps = 0,

  myShapes = [],
  polygonPoints = [
    [ new Point(250, 150), new Point(250, 200),
      new Point(300, 200) ],

    [ new Point(100, 100), new Point(100, 125),
      new Point(125, 125), new Point(125, 100) ],

    [ new Point(400, 100), new Point(380, 150),
      new Point(500, 150), new Point(520, 100) ],
  ],

  polygonStrokeStyles = [ 'blue', 'yellow', 'red'],
  polygonFillStyles   = [ 'rgba(255,255,0,0.7)',
                          'rgba(100,140,230,0.6)',
                          'rgba(255,255,255,0.8)' ],
  shapeMoving = undefined,
  c1 = new Circle(150, 275, 20),
  c2 = new Circle(250, 250, 30),

  lastTime = undefined,
  velocity = { x: 350, y: 190 },
  lastVelocity = { x: 350, y: 190 },
  STICK_DELAY = 500,
  stuck = false,
  showInstructions = true;

  // #region 更新
  // 黏贴
  function stick(mtv) {

    // 圆和园碰撞时，感觉速度方向计算单位向量
    if (!mtv.axis) {
      mtv.axis = (new Vector(velocity.x, velocity.y)).normalize();
    }

    // 计算位移量
    dx = mtv.axis.x * mtv.overlap;
    dy = mtv.axis.y * mtv.overlap;

    // 防止方向相同
    if ((dx < 0 && velocity.x < 0) || (dx > 0 && velocity.x > 0))
       dx = -dx;

    if ((dy < 0 && velocity.y < 0) || (dy > 0 && velocity.y > 0))
       dy = -dy;

     // 根据黏贴延迟，清除碰撞
     setTimeout(function () {
        shapeMoving.move(dx, dy);
     }, STICK_DELAY);

     // 速度初始
     lastVelocity.x = velocity.x;
     lastVelocity.y = velocity.y;
     velocity.x = velocity.y = 0;

     // Don't stick again before STICK_DELAY expires
     stuck = true;
  }

  // 检查碰撞，并且做处理
  function detectCollisions () {
    var shape;
    for (var i = 0; i < myShapes.length; i++) {
      shape = myShapes[i];

      if (shape !== shapeMoving) {
        var mtv = shapeMoving.collidesWith(shape); // 碰撞检测

        if (mtv.axis || mtv.overlap !== 0) { // 判断是否碰撞
          if (!stuck)
            stick(mtv); // 碰撞处理，黏贴
        }
      }
    }

    // 画板边角碰撞
    bbox = shapeMoving.boundingBox();
    if (bbox.left + bbox.width > canvas.width || bbox.left < 0) {
       velocity.x = -velocity.x;
    }
    if (bbox.top + bbox.height > canvas.height || bbox.top < 0) {
       velocity.y = -velocity.y;
    }
  }

  function update(time) {
    // 移动
    if (shapeMoving) {
      shapeMoving.move(velocity.x / fps, velocity.y / fps);

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

    for (var i = 0; i < myShapes.length; i++) {
      shape = myShapes[i];
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

    for (var i = 0; i < myShapes.length; i++) {
      var shap = myShapes[i];

      if (shap.isPointInPath(context, mouse.x, mouse.y)) {
        stuck = false;
        shapeMoving = shap;
        velocity.x = lastVelocity.x;
        velocity.y = lastVelocity.y;
      }
    }
  }

  // Initialization................................................

  for (var i=0; i < polygonPoints.length; ++i) {
    var polygon = new Polygon(),
       points = polygonPoints[i];

    polygon.strokeStyle = polygonStrokeStyles[i];
    polygon.fillStyle = polygonFillStyles[i];

    polygon.setPoints(points);

    myShapes.push(polygon);
  }

  c1.fillStyle = 'rgba(200, 50, 50, 0.5)';

  myShapes.push(c1);
  myShapes.push(c2);

  window.requestNextAnimationFrame(main);

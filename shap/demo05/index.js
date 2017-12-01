var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  fps = 0,

  myShapes = [],
  myMoveShapes = [],
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
  c1 = new Circle(150, 275, 20),
  c2 = new Circle(250, 250, 30),
  lastVelocity = { x: 350, y: 190 };

function MoveShape(velocity, shape) {
  this.velocity = velocity;
  this.shape = shape;
  this.shapeMoving = undefined;
}

MoveShape.prototype = {

  detectCollisions: function (cvs) {
    this.handleShapeCollisions(); // 物体碰撞检测
    this.handleEdgeCollisions(cvs); // 边角碰撞检测
  },

  handleShapeCollisions: function () {
    var shape;
    for (var i = 0; i < myShapes.length; i++) {
      shape = myShapes[i];

      if (shape !== this.shapeMoving) {
        var mtv = this.shapeMoving.collidesWith(shape); // 碰撞检测

        if (mtv.axis || mtv.overlap !== 0) { // 判断是否碰撞
          this.bounce(mtv, this.shapeMoving, this.shape); // 碰撞处理，黏贴
        }
      }
    }
  },

  handleEdgeCollisions: function (cvs) {
     var bbox = this.shapeMoving.boundingBox(),
         right = bbox.left + bbox.width,
         bottom = bbox.top + bbox.height;

     if (right > cvs.width || bbox.left < 0) {
        this.velocity.x = -this.velocity.x;

        // 超出位置纠正
        if (right > cvs.width)
           this.shapeMoving.move(0-(right-cvs.width), 0);

        if (bbox.left < 0)
           this.shapeMoving.move(-bbox.left, 0);
     }
     if (bottom > cvs.height || bbox.top < 0) {
        this.velocity.y = -this.velocity.y;

        // 超出位置纠正
        if (bottom > cvs.height)
           this.shapeMoving.move(0, 0-(bottom-cvs.height));
        if (bbox.top < 0)
           this.shapeMoving.move(0, -bbox.top);
     }
  },

  bounce: function (mtv, collider, collidee) {
    // 检测纠正投影板向量方向
    this.checkMTVAxisDirection(mtv, collider, collidee);

    var point = new Point(),
        velocityVector = new Vector(this.velocity.x, this.velocity.y),
        velocityUnitVector = velocityVector.normalize(),
        velocityVectorMagnitude = velocityVector.getMagnitude(),
        perpendicular,
        vdot, ldot, dotProductRatio;

    // 获取法向量
    if (mtv.axis) {
      perpendicular = mtv.axis.perpendicular();
    } else {
      perpendicular = new Vector(-velocityUnitVector.y,
                                     velocityUnitVector.x);
    }

    // 根据公式计算反弹
    // V起始速度向量，L法向量，A结束速度向量
    // A=2*(V点积L)/(L点积L)L-V
    vdot = velocityUnitVector.dotProduct(perpendicular);
    ldot = perpendicular.dotProduct(perpendicular);
    dotProductRatio = vdot / ldot;

    point.x = 2 * dotProductRatio * perpendicular.x - velocityUnitVector.x;
    point.y = 2 * dotProductRatio * perpendicular.y - velocityUnitVector.y;

    // 位置纠正
    this.separate(mtv);

    this.velocity.x = point.x * velocityVectorMagnitude;
    this.velocity.y = point.y * velocityVectorMagnitude;
  },

  checkMTVAxisDirection: function (mtv, collider, collidee) {
     var centroid1, centroid2, centroidVector, centroidUnitVector;

     if (mtv.axis === undefined)
        return;

     centroid1 = new Vector(collider.centroid()),
     centroid2 = new Vector(collidee.centroid()),
     centroidVector = centroid2.subtract(centroid1),
     centroidUnitVector = (new Vector(centroidVector)).normalize();

     if (centroidUnitVector.dotProduct(mtv.axis) > 0) {
        mtv.axis.x = -mtv.axis.x;
        mtv.axis.y = -mtv.axis.y;
     }
  },

  separate: function (mtv) {
    // 圆和园碰撞时，感觉速度方向计算单位向量
    if (!mtv.axis) {
      mtv.axis = (new Vector(this.velocity.x, this.velocity.y)).normalize();
    }

    // 计算位移量
    dx = mtv.axis.x * mtv.overlap;
    dy = mtv.axis.y * mtv.overlap;

    // 防止方向相同
    if ((dx < 0 && this.velocity.x < 0) || (dx > 0 && this.velocity.x > 0))
       dx = -dx;

    if ((dy < 0 && this.velocity.y < 0) || (dy > 0 && this.velocity.y > 0))
       dy = -dy;

    this.shapeMoving.move(dx, dy);
  }
};

// #region 更新
function update(time) {
  // 查找可移动的物体
  for (var i = 0; i < myMoveShapes.length; i++) {
    if (myMoveShapes[i].shapeMoving) {
      var moveShape = myMoveShapes[i],
          velocity = moveShape.velocity;

      moveShape.shapeMoving.move(velocity.x / fps, velocity.y / fps);
      moveShape.detectCollisions(canvas);
    }
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

  for (var i = 0; i < myMoveShapes.length; i++) {
    var moveShapes = myMoveShapes[i],
        shape = moveShapes.shape;

    if (shape.isPointInPath(context, mouse.x, mouse.y)) {
      debugger
      moveShapes.velocity.x = lastVelocity.x;
      moveShapes.velocity.y = lastVelocity.y;
      moveShapes.shapeMoving = shape;
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

for (var i = 0; i < myShapes.length; i++) {
  var moveShape = new MoveShape({ x: 350, y: 190 }, myShapes[i]);
  myMoveShapes.push(moveShape);
}

window.requestNextAnimationFrame(main);

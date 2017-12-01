// #region 公共方法
/**
 * 识别手机浏览器
 * @return {[type]} [description]
 */
function checkIsMobile() {
  var ua = navigator.userAgent.toLowerCase();
  var contains = function(a, b) {
    if (a.indexOf(b) != -1) {
      return true;
    }
  };

  if (contains(ua, "ipad") || (contains(ua, "rv:1.2.3.4")) || (contains(ua, "0.0.0.0")) || (contains(ua, "8.0.552.237"))) {
    return false
  }
  if ((contains(ua, "android") && contains(ua, "mobile")) || (contains(ua, "android") && contains(ua, "mozilla")) || (contains(ua, "android") && contains(ua, "opera")) || contains(ua, "ucweb7") || contains(ua, "iphone")) {
    return true;
  }

  return false;
};

/**
 * 获取点击位置信息
 * @param  {[type]} cvs [description]
 * @param  {[type]} x   [description]
 * @param  {[type]} y   [description]
 * @return {[type]}     [description]
 */
function windowToCanvas(cvs, x, y) {
  var bbox = cvs.getBoundingClientRect();

  return {
    x: x - bbox.left * (cvs.width / bbox.width),
    y: y - bbox.top * (cvs.height / bbox.height)
  }
}

/**
 * 清除界面
 * @return {[type]} [description]
 */
function erase(cxt) {
  cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
}

/**
 * 秒帧计算
 * @param  {[type]} time [description]
 * @return {[type]}      [description]
 */
var lastCalculateTime;
function calculateFps(time) {
  // 初始化
  if (!lastCalculateTime) {
    lastCalculateTime = time;
  }

  var fps = 1000 / (time - lastCalculateTime);
  lastCalculateTime = time;

  return fps;
}
// #endregion

// #region requestAnimationFrame 各浏览器兼容性
window.requestNextAnimationFrame = (function() {
  var originalWebkitRequestAnimationFrame = undefined,
    wrapper = undefined,
    callback = undefined,
    geckoVersion = 0,
    userAgent = navigator.userAgent,
    index = 0,
    self = this;

  // Workaround for Chrome 10 bug where Chrome
  // does not pass the time to the animation function

  if (window.webkitRequestAnimationFrame) {
    // Define the wrapper

    wrapper = function(time) {
      if (time === undefined) {
        time = +new Date();
      }
      self.callback(time);
    };

    // Make the switch

    originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;

    window.webkitRequestAnimationFrame = function(callback, element) {
      self.callback = callback;

      // Browser calls the wrapper and wrapper calls the callback

      originalWebkitRequestAnimationFrame(wrapper, element);
    }
  }

  // Workaround for Gecko 2.0, which has a bug in
  // mozRequestAnimationFrame() that restricts animations
  // to 30-40 fps.

  if (window.mozRequestAnimationFrame) {
    // Check the Gecko version. Gecko is used by browsers
    // other than Firefox. Gecko 2.0 corresponds to
    // Firefox 4.0.

    index = userAgent.indexOf('rv:');

    if (userAgent.indexOf('Gecko') != -1) {
      geckoVersion = userAgent.substr(index + 3, 3);

      if (geckoVersion === '2.0') {
        // Forces the return statement to fall through
        // to the setTimeout() function.

        window.mozRequestAnimationFrame = undefined;
      }
    }
  }

  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    var start,
      finish;

    window.setTimeout(function() {
      start = +new Date();
      callback(start);
      finish = +new Date();

      self.timeout = 1000 / 60 - (finish - start);

    }, self.timeout);
  };
})();
// #endregion

// #region 精灵
var Sprite = function(name, painter, behaviors) {
  this.name = name;
  this.painter = painter;
  this.behaviors = behaviors || [];

  return this;
};

Sprite.prototype = {
  name: '',
  painter: null,
  top: 0,
  left: 0,
  width: 10,
  height: 10,
  velocityX: 0,
  velocityY: 0,
  visible: true,
  animating: false,
  behaviors: [],

  paint: function(ctx) {
    if (this.painter && this.visible)
      this.painter.paint(this, ctx);
    }
  ,
  update: function(ctx, time) {
    for (var i = 0; i < this.behaviors.length; i++) {
      this.behaviors[i].execute(this, ctx, time);
    }
  }
};

// 图像绘制器
var ImagePainter = function(imgUrl) {
  this.image = new Image();
  this.image.src = imgUrl;
};

ImagePainter.prototype = {
  paint: function(sprite, ctx) {
    if (!this.image.complete) {
      this.image.onload = function(e) {
        sprite.width = this.width;
        sprite.height = this.height;

        context.drawImage(this, // this is image
            sprite.left, sprite.top, sprite.width, sprite.height);
      };
    } else {
      ctx.drawImage(this.image, sprite.left, sprite.top, sprite.width, sprite.height);
    }
  }
};

// 精灵表绘制器
var SpriteSheetPainter = function(imageUrl, cells) {
  this.cells = cells || [];
  this.image = new Image();
  this.image.src = imageUrl;
};

SpriteSheetPainter.prototype = {
  cells: [],
  cellIndex: 0,
  image: null,

  advance: function() {
    if (this.cellIndex == this.cells.length - 1)
      this.cellIndex = 0;
    else
      this.cellIndex++;
  },

  paint: function(sprite, ctx) {
    var cell = this.cells[this.cellIndex];
    if (this.image.complete) {
      ctx.drawImage(this.image, cell.left, cell.top, cell.width, cell.height, sprite.left, sprite.top, cell.width, cell.height);
    }
  }
};

// 精灵动画
var SpriteAnimator = function (painters, elapsedCallback) {
  this.painters = painters || [];
  this.elapsedCallback = elapsedCallback;
};

SpriteAnimator.prototype = {
  startTime: 0,
  painters: [],
  elapsedCallback: null,
  duration: 1000,
  index: 0,

  end: function (sprite, originalPainter) {
    sprite.animating = false;
    if (this.elapsedCallback) this.elapsedCallback(sprite);
    else sprite.painter = originalPainter;
  },

  start: function (sprite, duration) {
    this.startTime = +new Date();

    var endTime = this.startTime + duration,
      period = duration / this.painters.length,
      animator = this,
      originalPainter = sprite.painter,
      lastUpdateTime = null;

    this.index = 0;
    sprite.animating = true;
    sprite.painter = this.painters[this.index];

    requestNextAnimationFrame(function spriteAnimatorAnimate (time) {
      if (!lastUpdateTime) lastUpdateTime = time;

      if (+new Date < endTime) {
        if (time - lastUpdateTime > period) {
          sprite.painter = animator.painters[++animator.index];
          lastUpdateTime = time;
        }

        requestNextAnimationFrame(spriteAnimatorAnimate);
      } else {
        animator.end(sprite, originalPainter);
      }
    });
  }
};
// #endregion

// #region timer工具
var Stopwatch = function() {};
Stopwatch.prototype = {
  startTime: 0,
  running: false,
  elapsedTime: null,

  start: function () {
    this.startTime = +new Date();
    this.running = true;
    this.elapsedTime = null;
  },

  stop: function () {
    this.elapsedTime = (+new Date()) - this.startTime;
    this.running = false;
  },

  getElapsedTime: function () {
    if (this.isRunning())
      return (+new Date()) - this.startTime;

    return this.elapsedTime;
  },

  isRunning: function () {
    return this.running;
  },

  reset: function() {
    this.elapsedTime = 0;
  }
};

var AnimationTimer = function (duration, timeWarp) {
  this.duration = duration;
  this.timeWarp = timeWarp;
  this.stopwatch = new Stopwatch();
};
AnimationTimer.prototype = {
  start: function () {
    this.stopwatch.start();
  },

  stop: function () {
    this.stopwatch.stop();
  },

  getRealElapsedTime: function () {
    return this.stopwatch.getElapsedTime();
  },

  getElapsedTime: function () {
    var elapsedTime = this.stopwatch.getElapsedTime(),
        percentComplete = elapsedTime / this.duration;

      if (!this.stopwatch.isRunning()) return null;
      if (this.timeWarp == null) return elapsedTime;

      return elapsedTime * (this.timeWarp(percentComplete) / percentComplete);
  },

  isRunning: function () {
    return this.stopwatch.isRunning();
  },

  isOver: function () {
    return this.stopwatch.getElapsedTime() > this.duration;
  },

  reset: function () {
    this.stopwatch.reset();
  }
};

AnimationTimer.makeEaseOut = function (strength) {
   return function (percentComplete) {
      return 1 - Math.pow(1 - percentComplete, strength*2);
   };
};

AnimationTimer.makeEaseIn = function (strength) {
   return function (percentComplete) {
      return Math.pow(percentComplete, strength*2);
   };
};

AnimationTimer.makeEaseInOut = function () {
   return function (percentComplete) {
      return percentComplete - Math.sin(percentComplete*2*Math.PI) / (2*Math.PI);
   };
};

AnimationTimer.makeElastic = function (passes) {
   passes = passes || 3;
   return function (percentComplete) {
       return ((1-Math.cos(percentComplete * Math.PI * passes)) *
               (1 - percentComplete)) + percentComplete;
   };
};

AnimationTimer.makeBounce = function (bounces) {
   var fn = AnimationTimer.makeElastic(bounces);
   return function (percentComplete) {
      percentComplete = fn(percentComplete);
      return percentComplete <= 1 ? percentComplete : 2-percentComplete;
   };
};

AnimationTimer.makeLinear = function () {
   return function (percentComplete) {
      return percentComplete;
   };
};
// #endregion

// #region 向量
var Vector = function (x, y) {
  if (arguments.length == 0) {
    this.x = 0;
    this.y = 0;

    return this;
  }

  // point
  if (arguments.length < 2) {
    var point = arguments[0];
    this.x = point.x;
    this.y = point.y;

    return this;
  }

  this.x = x;
  this.y = y;

  return this;
};
Vector.prototype = {
  // 获取向量实际长度
  getMagnitude: function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  },

  add: function (vector) {
    var v = new Vector();
    v.x = this.x + vector.x;
    v.y = this.y + vector.y;
    return v;
  },

  // 得出2个点的连接向量
  subtract: function (vector) {
    var v = new Vector();
    v.x = this.x - vector.x;
    v.y = this.y - vector.y;
    return v;
  },

  // 点积，可得出向量在某个向量的投影长度
  dotProduct: function (vector) {
    return this.x * vector.x + this.y * vector.y;
  },

  edge: function (vector) {
    return this.subtract(vector);
  },

  // 垂线向量
  perpendicular: function (vector) {
    var v = new Vector();
    v.x = this.y;
    v.y = 0 - this.x;
    return v;
  },

  // 向量单位话
  normalize: function () {
    var v = new Vector(),
        m = this.getMagnitude();

    if (m != 0) {
      v.x = this.x / m;
      v.y = this.y / m;
    }

    return v;
  },

  normal: function () {
    var p = this.perpendicular();
    return p.normalize();
  }
};
// #endregion

// #region 投影
var Projection = function (min, max) {
  this.min = min;
  this.max = max;
}
Projection.prototype = {
  overlaps: function (projection) {
    return this.max > projection.min && this.min < projection.max;
  },

  getOverlap: function (projection) {
     var overlap;

     if (!this.overlaps(projection))
        return 0;

     if (this.max > projection.max) {
        overlap = projection.max - this.min;
     }
     else {
       overlap = this.max - projection.min;
     }
     return overlap;
  }
};
// #endregion

// #region 形状

// 常量.....................................................

var BIG_NUMBER = 1000000;

// 基类.....................................................

var Point = function (x, y) {
   this.x = x;
   this.y = y;
};

var MinimumTranslationVector = function (axis, overlap) {
   this.axis = axis;
   this.overlap = overlap;
};

// 矩形外框
var BoundingBox = function(left, top, width, height) {
   this.left = left;
   this.top = top;
   this.width = width;
   this.height = height;
};

// 方法类....................................................

/**
 * [getPolygonPointClosestToCircle description]
 * @param  {[type]} polygon [description]
 * @param  {[type]} circle  [description]
 * @return {[type]}         [description]
 */
function getPolygonPointClosestToCircle(polygon, circle) {
  var min = 10000,
      length,
      testPoint,
      closestPoint;

  for (var i = 0; i < polygon.points.length; ++i) {
    testPoint = polygon.points[i];
    length = Math.sqrt(Math.pow(testPoint.x - circle.x, 2),
                       Math.pow(testPoint.y - circle.y, 2));

    if (length < min) {
      min = length;
      closestPoint = testPoint;
    }
  }

  return closestPoint;
}

/**
 * 检测多边形和圆形的碰撞，并且返回最小单位向量
 * @param  {[type]} polygon [description]
 * @param  {[type]} circle  [description]
 * @param  {[type]} displacement [description]
 * @return {[type]}         [description]
 */
function polygonCollidesWithCircle(polygon, circle, displacement) {
  var closestPoint = getPolygonPointClosestToCircle(polygon, circle),
      axes = polygon.getAxes(), v1, v2;

  v1 = new Vector(circle.x, circle.y);
  v2 = new Vector(closestPoint.x, closestPoint.y);

  axes.push(v1.subtract(v2).normalize());

  return polygon.minimumTranslationVector(axes, circle, displacement);
}

/**
 * 检测多边形和多边形的碰撞，并且返回最小单位向量
 * @param  {[type]} p1           [description]
 * @param  {[type]} p2           [description]
 * @param  {[type]} displacement [description]
 * @return {[type]}              [description]
 */
function polygonCollidesWithPolygon(p1, p2, displacement) {
  var mtv1 = p1.minimumTranslationVector(p1.getAxes(), p2, displacement),
      mtv2 = p1.minimumTranslationVector(p2.getAxes(), p2, displacement);

  if (mtv1.overlap === 0 || mtv2.overlap === 0)
    return { axis: undefined, overlap: 0 };
  else
    return mtv1.overlap < mtv2.overlap ? mtv1 : mtv2;
}

/**
 * 检测圆形和圆形的碰撞，并且返回最小单位向量
 * @param  {[type]} c1 [description]
 * @param  {[type]} c2 [description]
 * @return {[type]}    [description]
 */
function circleCollidesWithCircle (c1, c2) {
   var distance = Math.sqrt( Math.pow(c2.x - c1.x, 2) +
                             Math.pow(c2.y - c1.y, 2)),
       overlap = Math.abs(c1.radius + c2.radius) - distance;

   return overlap < 0 ?
      new MinimumTranslationVector(undefined, 0) :
      new MinimumTranslationVector(undefined, overlap);
};

// 对象类..............................................................

var Shape = function () {
  this.x = null;
  this.y = null;
  this.strokeStyle = '#000';
  this,fillStyle = '#fff';
};

Shape.prototype = {
  boundingBox: function () {
     throw 'boundingBox() not implemented';
  },

  collidesWith: function (shape) {
     throw 'collidesWith(shape, displacement) not implemented';
  },

  separationOnAxes: function (axes, shape) {
    var p1, p2, axis;

    for (var i = 0; i < axes.length; i++) {
      axis = axes[i];

      // 获取投影
      p1 = shape.project(axis);
      p2 = this.project(axis);

      // 判断是否分离
      if (!p1.overlaps(p2)) return true;
    }

    return false;
  },

  project: function (axis) {
    throw 'project(axis) not implemented';
  },

  getAxes: function () {
    throw 'getAxes() not implemented';
  },

  move: function (dx, dy) {
    throw 'move(dx, dy) not implemented';
  },

  // Drawing methods

  createPath: function (cxt) {
    throw 'createPath(cxt) not implemented';
  },

  stroke: function (cxt) {
     cxt.save();
     this.createPath(cxt);
     cxt.strokeStyle = this.strokeStyle;
     cxt.stroke();
     cxt.restore();
  },

  fill: function (cxt) {
     cxt.save();
     this.createPath(cxt);
     cxt.fillStyle = this.fillStyle;
     cxt.fill();
     cxt.restore();
  },

  isPointInPath: function (cxt, x, y) {
    this.createPath(cxt);
    return cxt.isPointInPath(x, y);
  },

  minimumTranslationVector: function (axes, shape, displacement) {
    var minimumOverlap = BIG_NUMBER,
        overlap,
        axisWithSmallestOverlap,
        mtv;

    for (var i=0; i < axes.length; ++i) {
      axis = axes[i];
      projection1 = this.project(axis);
      projection2 = shape.project(axis);
      overlap = projection1.getOverlap(projection2);

      if (overlap === 0) {
         return new MinimumTranslationVector(undefined, 0);
      }
      else {
         if (overlap < minimumOverlap) {
            minimumOverlap = overlap;
            axisWithSmallestOverlap = axis;
         }
      }
    }
    mtv = new MinimumTranslationVector(axisWithSmallestOverlap,
                                     minimumOverlap);
    return mtv;
  }
};

// #region 圆
var Circle = function (x, y, radius, strokeStyle, fillStyle) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  strokeStyle ? this.strokeStyle = strokeStyle : this.strokeStyle = '#000';
  fillStyle ? this.fillStyle = fillStyle : this.fillStyle = '#fff';
};

Circle.prototype = new Shape();

Circle.prototype.collidesWith = function (shape, displacement) {
  if (shape.radius) {
    return circleCollidesWithCircle(this, shape, displacement);
  } else {
    return polygonCollidesWithCircle(shape, this, displacement);
  }
};

Circle.prototype.centroid = function () {
   return new Point(this.x,this.y);
};

Circle.prototype.getAxes = function () {
  return null; // 圆不存在边
};

Circle.prototype.move = function (dx, dy) {
  this.x += dx;
  this.y += dy;
};

Circle.prototype.project = function (axis) {
  var scalars = [],
      point = new Point(this.x, this.y),
      dotProduct = new Vector(point).dotProduct(axis);

  scalars.push(dotProduct);
  scalars.push(dotProduct + this.radius);
  scalars.push(dotProduct - this.radius);

  return new Projection(Math.min.apply(Math, scalars),
                        Math.max.apply(Math, scalars));
};

Circle.prototype.boundingBox = function (dx, dy) {
   return new BoundingBox(this.x - this.radius,
                          this.y - this.radius,
                          2*this.radius,
                          2*this.radius);
};

Circle.prototype.createPath = function (ctx) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
  ctx.closePath();
};
// #endregion

// #region 多边形
var Polygon = function (centerX, centerY, radius, sides, startAngle, strokeStyle, fillStyle, filled) {
   this.x = centerX;
   this.y = centerY;
   this.radius = radius;
   this.sides = sides;
   this.startAngle = startAngle || 0;
   this.strokeStyle = strokeStyle || '#000';
   this.fillStyle = fillStyle || '#fff';
   this.filled = filled;
   this.points = centerX ? this.getPoints() : [];
};

Polygon.prototype = new Shape();

// 兼容和圆形碰撞
Polygon.prototype.collidesWith = function (shape, displacement) {
  if (shape.radius) {
    return polygonCollidesWithCircle(this, shape, displacement);
  } else {
    return polygonCollidesWithPolygon(this, shape, displacement);
  }
};

Polygon.prototype.centroid = function () {
   var pointSum = new Point(0,0);

   for (var i=0, point; i < this.points.length; ++i) {
      point = this.points[i];
      pointSum.x += point.x;
      pointSum.y += point.y;
   }
   return new Point(pointSum.x / this.points.length,
                    pointSum.y / this.points.length);
}

Polygon.prototype.setPoints = function (points) {
  this.points = points;

  return this;
};

Polygon.prototype.getPoints = function () {
   var points = [],
       angle = this.startAngle || 0;

   for (var i=0; i < this.sides; ++i) {
      points.push(new Point(this.x + this.radius * Math.sin(angle),
                        this.y - this.radius * Math.cos(angle)));
      angle += 2*Math.PI/this.sides;
   }

   return points;
};

Polygon.prototype.createPath = function (ctx) {
   var points = this.points;

   ctx.beginPath();

   ctx.moveTo(points[0].x, points[0].y);

   for (var i=1; i < this.points.length; ++i) {
      ctx.lineTo(points[i].x, points[i].y);
   }

   ctx.closePath();
};

Polygon.prototype.move = function (dx, dy) {
  for (var i = 0, point; i < this.points.length; i++) {
    point = this.points[i];

    point.x += dx;
    point.y += dy;
  }
};

Polygon.prototype.boundingBox = function (dx, dy) {
   var minx = BIG_NUMBER,
       miny = BIG_NUMBER,
       maxx = -BIG_NUMBER,
       maxy = -BIG_NUMBER,
       point;

   for (var i=0; i < this.points.length; ++i) {
      point = this.points[i];
      minx = Math.min(minx,point.x);
      miny = Math.min(miny,point.y);
      maxx = Math.max(maxx,point.x);
      maxy = Math.max(maxy,point.y);
   }

   return new BoundingBox(minx, miny,
                          parseFloat(maxx - minx),
                          parseFloat(maxy - miny));
};

Polygon.prototype.getAxes = function () {
  var v1 = new Vector(),
      v2 = new Vector(),
      axes = [];

  for (var i = 0; i < this.points.length - 1; i++) {
    v1.x = this.points[i].x;
    v1.y = this.points[i].y;

    v2.x = this.points[i+1].x;
    v2.y = this.points[i+1].y;

    axes.push(v1.edge(v2).normal());
  }

  v1.x = this.points[this.points.length - 1].x;
  v1.y = this.points[this.points.length - 1].y;

  v2.x = this.points[0].x;
  v2.y = this.points[0].y;

  axes.push(v1.edge(v2).normal());

  return axes;
};

// 投影方法
Polygon.prototype.project = function (axis) {
  var scalars = [],
      v = new Vector();

  for (var i = 0; i < this.points.length; i++) {
    v.x = this.points[i].x;
    v.y = this.points[i].y;
    scalars.push(v.dotProduct(axis));
  }

  return new Projection(Math.min.apply(Math, scalars),
                        Math.max.apply(Math, scalars));
};
// #endregion

// #endregion



// 图像碰撞边框
var ImageShape = function (imageSource, x, y, w, h) {
  var self = this;

  this.image = new Image();
  this.imageLoaded = false;
  this.points = [ new Point(x, y) ];
  this.x = x;
  this.y = y;

  this.image.src = imageSource;
  this.image.onload = function (e) {
    self.setPolygonPoints();
    self.imageLoaded = true;
  };
};

ImageShape.prototype = new Polygon();

ImageShape.prototype.fill = function (ctx) { };

ImageShape.prototype.setPolygonPoints = function () {
  this.points.push(new Point(this.x + this.image.width, this.y));
  this.points.push(new Point(this.x + this.image.width, this.y + this.image.height));
  this.points.push(new Point(this.x, this.y + this.image.height));
};

ImageShape.prototype.drawImage = function (ctx) {
  ctx.drawImage(this.image, this.points[0].x, this.points[0].y);
};

ImageShape.prototype.stroke = function (ctx) {
  var self = this;

  if (this.imageLoaded) {
    ctx.drawImage(this.image, this.points[0].x, this.points[0].y);
  } else {
    // this.image.onload = function (e) {
    //   self.drawImage(ctx);
    // };
  }
};

// 精灵碰撞边框
var SpriteShape = function (sprite, x, y) {
  this.sprite = sprite;
  this.x = x;
  this.y = y;
  sprite.left = x;
  sprite.top = y;
  this.setPolygonPoints();
};

SpriteShape.prototype = new Polygon();

SpriteShape.prototype.fill = function (ctx) { };

SpriteShape.prototype.move = function (dx, dy) {
  var point;

  for (var i = 0; i < this.points.length; ++i) {
    point = this.points[i];
    point.x += dx;
    point.y += dy;
  }

  this.sprite.left = this.points[0].x;
  this.sprite.top = this.points[0].y;
};

SpriteShape.prototype.setPolygonPoints = function () {
  this.points.push(new Point(this.x, this.y));
  this.points.push(new Point(this.x + this.sprite.width, this.y));
  this.points.push(new Point(this.x + this.sprite.width, this.y + this.sprite.height));
  this.points.push(new Point(this.x, this.y + this.sprite.height));
};

SpriteShape.prototype.stroke = function (ctx) {
  this.sprite.paint(ctx);
};

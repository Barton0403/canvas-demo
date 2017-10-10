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
      this.painter.paint(this, context);
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
  image: null,

  paint: function(sprite, ctx) {
    if (!this.image.complete) {
      // this.image.onload = function(e) {
      //   sprite.width = this.width;
      //   sprite.height = this.height;
      //
      //   context.drawImage(this, // this is image
      //       sprite.left, sprite.top, sprite.width, sprite.height);
      // };
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
  getMagnitude: function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  },

  add: function (vector) {
    var v = new Vector();
    v.x = this.x + vector.x;
    v.y = this.y + vector.y;
    return v;
  },

  subtract: function (vector) {
    var v = new Vector();
    v.x = this.x - vector.x;
    v.y = this.y - vector.y;
    return v;
  },

  dotProduct: function (vector) {
    return this.x * vector.x + this.y * vector.y;
  },

  edge: function (vector) {
    return this.subtract(vector);
  },

  perpendicular: function (vector) {
    var v = new Vector();
    v.x = this.y;
    v.y = 0 - this.x;
    return v;
  },

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
  }
};
// #endregion

// #region 形状
var Shape = function () {
  this.x = null;
  this.y = null;
  this.strokeStyle = '#000';
  this,fillStyle = '#fff';
};

Shape.prototype = {
  collidesWith: function (shape) {
    // 获取所有投影轴
    var axes = this.getAxes().concat(shape.getAxes());
    return !this.separationOnAxes(axes, shape);
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
  }
};

var Circle = function (x, y, radius, strokeStyle, fillStyle) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  strokeStyle ? this.strokeStyle = strokeStyle : this.strokeStyle = '#000';
  fillStyle ? this.fillStyle = fillStyle : this.fillStyle = '#fff';
};

Circle.prototype = new Shape();

Circle.prototype.collidesWith = function (shape) {
  var point, length, min = 10000, v1, v2,
      edge, perpendicular, normal,
      axes = shape.getAxes(), distance;

  if (!axes) {
    distance = Math.sqrt(Math.pow(shape.x - this.x, 2) +
                         Math.pow(shape.y - this.y, 2));

    return distance < Math.abs(this.radius + shape.radius);
  } else {
    return polygonCollidesWithCircle(shape, this);
  }
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

Circle.prototype.createPath = function (ctx) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
  ctx.closePath();
};

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

function polygonCollidesWithCircle(polygon, circle) {
  var closestPoint = getPolygonPointClosestToCircle(polygon, circle),
      axes = polygon.getAxes(), v1, v2;

  v1 = new Vector(circle.x, circle.y);
  v2 = new Vector(closestPoint.x, closestPoint.y);

  axes.push(v1.subtract(v2).normalize());

  return !polygon.separationOnAxes(axes, circle);
}
// #endregion

// #region 多边形绘制
var Point = function (x, y) {
   this.x = x;
   this.y = y;
};

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
Polygon.prototype.collidesWith = function (shape) {
  var axes = shape.getAxes();

  if (!axes) {
    return polygonCollidesWithCircle(this, shape);
  } else {
    axes.concat(this.getAxes());
    return !this.separationOnAxes(axes, shape);
  }
};

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

// 投影方法

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

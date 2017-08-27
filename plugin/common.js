//识别手机浏览器
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

// requestAnimationFrame 各浏览器兼容性
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
  cxt.clearRect(0, 0, canvas.width, canvas.height);
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

// 精灵对象
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
  this.image.src = imageUrl;
};

ImagePainter.prototype = {
  image: null,

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

var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  animateButton = document.getElementById('animateButton'),

  paused = true, // 暂停
  lastTime = 0, // 上次从浏览器启动到动画上次更新花费的时间
  fps = 0,

  // debug
  showMouseLocation = false,
  mouse = {
    x: 0,
    y: 0
  },

  NUM_EXPLOSION_PAINTERS = 9,
  NUM_FUSE_PAINTERS = 9,

  // 绘制器
  bombPainter = new ImagePainter('../../images/bomb/bomb.png'), // 炸弹未点燃状态
  bombNoFusePainter = new ImagePainter('../../images/bomb/bomb-no-fuse.png'), // 导线烧完状态
  fuseBurningPainters = [], // 导线燃烧绘制器
  explosionPainters = [], // 爆炸绘制器
  bomb = new Sprite('bomb', bombPainter),

  // 导火线燃烧动画
  fuseBurningAnimator = new SpriteAnimator(
    fuseBurningPainters,
    function () { bomb.painter = bombNoFusePainter }
  ),

  // 炸弹爆炸动画
  explosionAnimator = new SpriteAnimator(
    explosionPainters,
    function () { bomb.painter = bombPainter }
  );

// #region 数据更新
function update(time) {
  updateBackgroud(time);
  updateFps(time);
}

var lastFpsUpdateTime = 0,
  lastFpsUpdate = 0;
function updateFps(time) {
  // 限制每1秒才更新帧数显示
  if (time - lastFpsUpdateTime > 1000) {
    lastFpsUpdateTime = time;
    lastFpsUpdate = fps;
  }
}

function updateBackgroud(time) {
}
// #endregion

// #region 绘制
function draw() {
  drawBackground();
  drawFps();
  bomb.paint(context);
  if (showMouseLocation)
    drawGuidelines();
}

function drawFps() {
  context.save();
  context.fillStyle = 'cornflowerblue';
  context.fillText(lastFpsUpdate.toFixed() + 'fps', 20, 60);
  context.restore();
}

function drawGuidelines() {
  context.save();
  context.fillStyle = 'cornflowerblue';
  context.fillText('x:' + mouse.x + ' y:' + mouse.y, 20, 128);

  context.strokeStyle = 'rgba(0,0,230,0.8)';
  context.lineWith = 0.5;

  // 水平线
  context.beginPath();
  context.moveTo(0, mouse.y + 0.5);
  context.lineTo(canvas.width, mouse.y + 0.5);
  context.stroke();

  // 垂直线
  context.beginPath();
  context.moveTo(mouse.x + 0.5, 0);
  context.lineTo(mouse.x + 0.5, canvas.height);
  context.stroke();

  context.restore();
}

function drawBackground() {
}
// #endregion

// #region 事件处理
canvas.onmousedown = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
};

canvas.onmousemove = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
};

canvas.onmouseup = function (e) {
  mouse = windowToCanvas(canvas, e.clientX, e.clientY);
}

canvas.addEventListener('touchstart', function (e) {
  mouse = windowToCanvas(canvas, e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener('touchmove', function (e) {
  mouse = windowToCanvas(canvas, e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener('touchend', function (e) {
  mouse = windowToCanvas(canvas, e.touches[0].clientX, e.touches[0].clientY);
});
// #endregion

function main(time) {
  erase(context);
  update(time);
  draw();

  fps = calculateFps(time);
  window.requestNextAnimationFrame(main);
}

animateButton.onclick = function(e) {
  if (bomb.animating) return;

  fuseBurningAnimator.start(bomb, 2000); // 2s 燃烧

  // 延迟3秒， 1秒停滞时间

  setTimeout(function () {
    explosionAnimator.start(bomb, 1000);
  }, 3000);
}
chk_mouseLocation.onclick = function (e) {
  showMouseLocation = e.target.checked;
}

context.font = '48px Helvetica';

// 初始化炸弹精灵
bomb.left = 100;
bomb.top = 80;
bomb.width = 180;
bomb.height = 130;

// 初始化导线燃烧动画的绘制器组
for (var i = 0; i < NUM_FUSE_PAINTERS; i++) {
  fuseBurningPainters.push(
    new ImagePainter('../../images/bomb/fuse-0' + i + '.png')
  );
}

// 初始化炸弹爆炸动画的绘制器组
for (var i = 0; i < NUM_EXPLOSION_PAINTERS; i++) {
  explosionPainters.push(
    new ImagePainter('../../images/bomb/explosion-0' + i + '.png')
  );
}

window.requestNextAnimationFrame(main);

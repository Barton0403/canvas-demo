var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  animateButton = document.getElementById('animateButton'),

  paused = true, // 暂停
  lastTime = 0, // 上次从浏览器启动到动画上次更新花费的时间
  fps = 0,

  sky = new Image(),
  grass = new Image(),
  grass2 = new Image(),
  tree = new Image(),
  nearTree = new Image(),

  skyOffset = 0,
  grassOffset = 0,
  treeOffset = 0,
  nearTreeOffset = 0,

  SKY_VELOCITY = 8,
  TREE_VELOCITY = 20,
  FAST_TREE_VELOCITY = 40,
  GRASS_VELOCITY = 75;

// #region 公共方法
/**
   * 清除界面
   * @return {[type]} [description]
   */
function erase() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
   * 秒帧计算
   * @param  {[type]} time [description]
   * @return {[type]}      [description]
   */
function calculateFps(time) {
  fps = 1000 / (time - lastTime);
  lastTime = time;
  return fps;
}
// #endregion

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
  skyOffset = skyOffset < canvas.width
    ? skyOffset + SKY_VELOCITY / fps
    : 0;

  grassOffset = grassOffset < canvas.width
    ? grassOffset + GRASS_VELOCITY / fps
    : 0;

  treeOffset = treeOffset < canvas.width
    ? treeOffset + TREE_VELOCITY / fps
    : 0;

  nearTreeOffset = nearTreeOffset < canvas.width
    ? nearTreeOffset + FAST_TREE_VELOCITY / fps
    : 0;
}
// #endregion

// #region 绘制
function draw() {
  drawBackground();
  drawFps();
}

function drawFps() {
  context.save();
  context.fillStyle = 'cornflowerblue';
  context.fillText(lastFpsUpdate.toFixed() + 'fps', 20, 60);
  context.restore();
}

function drawBackground() {
  context.save();
  context.translate(-skyOffset, 0);
  context.drawImage(sky, 0, 0);
  context.drawImage(sky, sky.width - 2, 0);
  context.restore();

  context.save();
  context.translate(-treeOffset, 0);
  context.drawImage(tree,100, 240);
  context.drawImage(tree,1100, 240);
  context.drawImage(tree,400, 240);
  context.drawImage(tree,1400, 240);
  context.drawImage(tree,700, 240);
  context.drawImage(tree,1700, 240);
  context.restore();

  context.save();
  context.translate(-nearTreeOffset, 0);
  context.drawImage(nearTree,250, 220);
  context.drawImage(nearTree,1250, 220);
  context.drawImage(nearTree,800, 220);
  context.drawImage(nearTree,1800, 220);
  context.restore();

  context.save();
  context.translate(-grassOffset, 0);
  context.drawImage(grass, 0, canvas.height - grass.height);
  context.drawImage(grass, grass.width - 5, canvas.height - grass.height);
  context.drawImage(grass2, 0, canvas.height - grass2.height);
  context.drawImage(grass2, grass2.width, canvas.height - grass2.height);
  context.restore();
}
// #endregion

function animate(time) {
  // 初始化
  if (!lastTime)
    lastTime = time;

  if (!paused) {
    erase();
    update(time);
    draw();
  }

  fps = calculateFps(time);
  window.requestAnimationFrame(animate);
}

animateButton.onclick = function(e) {
  paused = !paused

  if (paused) {
    animateButton.value = 'Animate';
  } else {
    animateButton.value = 'Pause';
  }
}

context.font = '48px Helvetica';
tree.src = './smalltree.png';
nearTree.src = './tree-twotrunks.png';
grass.src = './grass.png';
grass2.src = './grass2.png';
sky.src = './sky.png';
sky.onload = function(e) {
  window.requestAnimationFrame(animate);
};

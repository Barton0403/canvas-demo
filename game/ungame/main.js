var game = new Game('ungame', 'canvas_game'),
  gameOver = false;

  // 加载................................................
  loading = true,
  toast_load = document.getElementById('toast_load'),
  btn_load = document.getElementById('btn_load'),
  div_loadProgress = document.getElementById('div_loadProgress'),
  progressbar = new COREHTML5.Progressbar(300, 25, 'rgba(0,0,0,0.5)', 3, 72, 144),

  // 血条................................................
  canvas_lives = document.getElementById('canvas_lives'),
  context_lives = canvas_lives.getContext('2d'),
  livesLeft = 3,

  // 扣血...............................................
  toast_loseLife = document.getElementById('toast_loseLife'),
  btn_loseLife = document.getElementById('btn_loseLife'),

  // 分数.............................................
  toast_score = document.getElementById('toast_score'),
  score = 0,

  // 分数结果...........................................
  txt_highScore = document.getElementById('txt_highScore'),

  // 背景滚动...........................................

  translateDelta = 0.025,
  translateOffset = 0,

  scrollBackground = function () {
     translateOffset =
        (translateOffset + translateDelta) % game.context.canvas.width;
     game.context.translate(-translateOffset,0);
  }

  // 画笔..............................................

  SUN_TOP = 110,
  SUN_LEFT = 450,
  SUN_RADIUS = 80,

  paintSun = function (context) {
     context.save();

     context.strokeStyle = 'orange';
     context.fillStyle = 'yellow';
     context.strokeStyle = 'orange';
     context.lineWidth = 1;

     context.beginPath();
     context.arc(SUN_LEFT, SUN_TOP, SUN_RADIUS, 0, Math.PI*2, true);
     context.fill();
     context.stroke();

     context.stroke();
     context.restore();
  },

  paintFarCloud = function (context, x, y) {
     context.save();
     scrollBackground();
     context.lineWidth=0.5;
     context.strokeStyle='rgba(100, 140, 230, 0, 0.8)';
     context.fillStyle='rgba(255,255,255,0.4)';
     context.beginPath();

     context.moveTo(x+102, y+91);
     context.quadraticCurveTo(x+180, y+110, x+250, y+90);
     context.quadraticCurveTo(x+312, y+87, x+279, y+60);
     context.quadraticCurveTo(x+321, y+20, x+265, y+20);
     context.quadraticCurveTo(x+219, y+4, x+171, y+23);
     context.quadraticCurveTo(x+137, y+5, x+104, y+18);
     context.quadraticCurveTo(x+57, y+23, x+79, y+48);
     context.quadraticCurveTo(x+57, y+74, x+104, y+92);
     context.closePath();
     context.stroke();
     context.fill();
     context.restore();
  },

  paintNearCloud = function (context, x, y) {
     context.save();
     scrollBackground();
     scrollBackground();
     context.lineWidth=0.5;
     context.strokeStyle='rgba(100, 140, 230, 0, 0.8)';
     context.fillStyle='rgba(255,255,255,0.4)';
     context.beginPath();

     context.fillStyle='rgba(255,255,255,0.7)';

     context.moveTo(x+364, y+37);
     context.quadraticCurveTo(x+426, y+28, x+418, y+72);
     context.quadraticCurveTo(x+450, y+123, x+388, y+114);
     context.quadraticCurveTo(x+357, y+144, x+303,y+ 115);
     context.quadraticCurveTo(x+251, y+118, x+278, y+83);
     context.quadraticCurveTo(x+254, y+46, x+320, y+46);
     context.quadraticCurveTo(x+326, y+12, x+362, y+37);
     context.closePath();
     context.stroke();
     context.fill();
     context.restore();
  };

// 更新分数显示..............................................

var updateScore = function () {
   if ( !loading && game.lastScoreUpdate !== undefined) { // 判断是否加载完毕，并且非第一次更新分数
      if (game.gameTime - game.lastScoreUpdate > 1000) { // 判断是否经过1秒了
         toast_score.style.display = 'block';
         score += 10;
         toast_score.innerHTML = score.toFixed(0);
         game.playSound('audio_pop');
         game.lastScoreUpdate = game.gameTime;
      }
   }
   else {
      game.lastScoreUpdate = game.gameTime;
   }
};

// 更新血条显示...............................................

var updateLivesDisplay = function (e) {
  var x, y, RADIUS = 10;

  context_lives.fillStyle = '#d92354';
  context_lives.clearRect(0,0,canvas_lives.width,canvas_lives.height);

  for (var i = 0; i < livesLeft; i++) {
    x = 20 + 30 * i;
    y = 18;

    context_lives.beginPath();
    context_lives.arc(x, y, RADIUS, 0, 2 * Math.PI);
    context_lives.fill();
  }
};

// 游戏结束..................................................
var over = function () {
  gameOver = true;
  toast_loseLife.style.display = 'none';
  canvas_lives.style.display = 'none';
  toast_score.style.display = 'none';

  txt_highScore.innerHTML = score;

  toast_gameOver.style.display = 'block';
};

// 加载按钮.................................................

btn_load.onclick = function (e) {
  this.style.display = 'none';
  div_loadProgress.style.display = 'block';

  div_loadProgress.appendChild(progressbar.domElement);

  // 图片列入队列
  game.queueImage('images/image1.png');
  game.queueImage('images/image2.png');
  game.queueImage('images/image3.png');
  game.queueImage('images/image4.png');
  game.queueImage('images/image5.png');
  game.queueImage('images/image6.png');
  game.queueImage('images/image7.png');
  game.queueImage('images/image8.png');
  game.queueImage('images/image9.png');
  game.queueImage('images/image10.png');
  game.queueImage('images/image11.png');
  game.queueImage('images/image12.png');

  interval = setInterval( function (e) {
    // 加载所有图片，加载中则返回加载进度
    loadingPercentComplete = game.loadImages();

     if (loadingPercentComplete === 100) {
        clearInterval(interval);

        setTimeout( function (e) {
           toast_load.style.display = 'none';
           div_loadProgress.style.display = 'none';
           btn_load.style.display = 'block';

              setTimeout( function (e) {
                 toast_score.style.display = 'block';
                 canvas_lives.style.display = 'block';
                 toast_loseLife.style.display = 'block';

                 setTimeout( function (e) {
                    loading = false;
                    score = 10;
                    toast_score.innerText = '10'; // won't get set till later, otherwise
                    game.playSound('audio_pop');
                    btn_loseLife.focus();
                 }, 1000);
              }, 500);
        }, 500);
     }
     progressbar.draw(loadingPercentComplete);
  }, 16);
};

// 扣血按钮..................................................

btn_loseLife.onclick = function (e) {
  livesLeft--;

  if (livesLeft == 0) toast_loseLife.style.display = none;

  game.playSound('audio_whoosh');
};

// 游戏周期..................................................

game.paintUnderSprites = function () {
    paintNearCloud(game.context, 120, 20);
    paintNearCloud(game.context, game.context.canvas.width+120, 20);
    paintSun(game.context);
    paintFarCloud(game.context, 20, 20);
    paintFarCloud(game.context, game.context.canvas.width+20, 20);
};

game.paintOverSprites = function () {
     if (!gameOver && livesLeft === 0) {
           over();
     }
     else {

        if (!gameOver) {
           updateScore();
        }
        updateLivesDisplay();
     }
};

game.start();

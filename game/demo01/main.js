var canvas, context,
  App = {
    ActiveScene: ''
  };

function main() {
  canvas = document.createElement('canvas');

  if (!checkEnv) {
      alert('该浏览器过久！请升级浏览器，建议使用火狐或谷歌浏览器！');
      return false;
  }

  initComponent();
  goScene('MainPage');
}

function initComponent() {
  canvas.id = 'canvas';
  canvas.width = 414;
  canvas.height = 736;
  context = canvas.getContext('2d');
  document.body.appendChild(canvas);

  context.fillStyle = '#000';
  context.fillRect(0, 0, 414, 736);
}

function checkEnv() {
  if (!canvas.getContext()) {
    return false;
  }

  return true;
}

function reset() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, 414, 736);
}

function goScene(name) {
  reset();

  switch (name) {
    case 'StartPage':
      goStartPage();
      break;
    case 'MainPage':
      goMainPage();
      break;
    default:
      console.error('无场景');
  }

  App.ActiveScene = name;
}

function goStartPage() {
  var startBtn = { x: 157, y: 368, w: 100, h: 50, isFocus: false };

  // 标题
  context.font = 'bold 40px 黑体';
  context.fillStyle = '#fff';
  context.textAlign = 'center';
  context.fillText('太空旅行', 207, 268);

  function DrawStartBtn(btn) {
    // 开始按钮背景
    context.beginPath();
    context.moveTo(157,368);
    context.lineTo(257,368);
    context.lineWidth=50;
    if (!btn.isFocus) {
      context.strokeStyle='#0f0';
    } else {
      context.strokeStyle='rgb(0, 155, 0)';
    }
    context.lineCap='round';
    context.stroke();
    // 开始按钮字
    context.font = 'bold 20px 黑体';
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.fillText('开始', 207, 375);
  }

  DrawStartBtn(startBtn);

  canvas.addEventListener('click', function (e) {
    var x = e.clientX, y = e.clientY;

    if (x >= startBtn.x && x <= startBtn.x + startBtn.w) {
      if (y >= startBtn.y && x <= startBtn.y + startBtn.h) {
        startBtn.isFocus = true;
        DrawStartBtn(startBtn);
        goScene('MainPage');
      }
    }
  });
}

function goMainPage() {
  var stars = generatorStar(5);

  var img = new Image();
  img.src = './imgs/star.png';
  img.onload = function () {
    for (star of stars) {
      // context.fillStyle="#FF0000";
      // context.beginPath();
      // context.arc(star.x, star.y, star.r, 0, Math.PI*2, true); //Math.PI*2是JS计算方法，是圆
      // context.fill();
      // context.closePath();

      // context.drawImage(img, star.x - star.r, star.y - star.r, star.r * 2, star.r * 2);
      // context.rotate(20 * Math.PI/180);

      // 旋转绘制
      context.save();
      context.translate(star.x, star.y);
      context.rotate(star.radin);
      context.drawImage(img, -star.r, -star.r, star.r * 2, star.r * 2);
      context.restore();
    }
  }
}

function rotater(stars) {

}

function generatorStar(num) {
  var stars = [];

  var y0 = 736;
  for (var i = 0; i < num; i++) {
    var r = Math.ceil(Math.random() * 50 + 22);
    var y = y0 - 50 - r;
    var radin = Math.ceil(Math.random() * 2 * Math.PI);

    var x;
    if (Math.ceil(i / 2) != i / 2) {
      x = 115;
    } else {
      x = 300;
    }

    stars.push({ x: x, y: y, r: r, radin: radin });
    y0 = y - r;
  }

  return stars;
}

main();

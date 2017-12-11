var btn_load = document.getElementById('btn_load'),
  loadProgressDiv = document.getElementById('loadProgressDiv'),
  progressbar = new COREHTML5.Progressbar(300, 25, 'rgba(0,0,0,0.5)', 3, 72, 144);

btn_load.onclick = function (e) {
  this.style.display = 'none';
  loadProgressDiv.style.display = 'block';

  loadProgressDiv.appendChild(progressbar.domElement);
  progressbar.draw(50);
};

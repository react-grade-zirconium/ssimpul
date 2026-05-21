function removeUnexpectedBodyTextNodes() {
  const nodes = Array.from(document.body.childNodes);
  for (const node of nodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    if (!node.textContent) continue;
    if (node.textContent.trim() === '') continue;
    node.remove();
  }
}

removeUnexpectedBodyTextNodes();

const title = document.getElementById('title');
const desc = document.getElementById('desc');
const dashPanel = document.getElementById('dashPanel');
const framePanel = document.getElementById('framePanel');
const frame = document.getElementById('frame');

function setActive(btn) {
  document.querySelectorAll('.menu button').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
}

function showDashboard(btn) {
  setActive(btn);
  dashPanel.classList.add('active');
  framePanel.classList.remove('active');
  title.textContent = '기말 학습 대시보드';
  desc.textContent = '박스 기반 레이아웃으로 섹션을 분리해 깔끔하게 구성했습니다.';
}

function showSubject(btn, heading) {
  setActive(btn);
  dashPanel.classList.remove('active');
  framePanel.classList.add('active');
  frame.src = btn.dataset.src;
  title.textContent = heading;
  desc.textContent = '선택 과목만 집중해서 볼 수 있습니다.';
}

function initHandwriteCanvas() {
  const canvas = document.getElementById('memoCanvas');
  const clearBtn = document.getElementById('clearCanvasBtn');
  if (!canvas || !clearBtn) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const prev = ctx.getImageData(0, 0, canvas.width || 1, canvas.height || 1);
    canvas.width = Math.floor(displayWidth * ratio);
    canvas.height = Math.floor(displayHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#0f172a';
    if (prev.width > 1 && prev.height > 1) {
      const temp = document.createElement('canvas');
      temp.width = prev.width;
      temp.height = prev.height;
      temp.getContext('2d').putImageData(prev, 0, 0);
      ctx.drawImage(temp, 0, 0, displayWidth, displayHeight);
    }
  }

  let drawing = false;

  function pointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    const p = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pointFromEvent(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
    canvas.addEventListener(evt, () => {
      drawing = false;
      ctx.closePath();
    });
  });

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  });

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

initHandwriteCanvas();

window.showDashboard = showDashboard;
window.showSubject = showSubject;

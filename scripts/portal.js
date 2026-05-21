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
const ddayEl = document.getElementById('ddayValue');
const goalInput = document.getElementById('goalInput');
const goalSaveBtn = document.getElementById('goalSaveBtn');
const goalValueEl = document.getElementById('goalValue');
const goalMsgEl = document.getElementById('goalMsg');

const FINAL_EXAM_DATE = '2026-06-29';
const GOAL_STORAGE_KEY = 'studymax_personal_goal';
const INK_STORAGE_KEY = 'studymax_ink_snapshot_v2';

function setActive(btn) { document.querySelectorAll('.menu button').forEach((b) => b.classList.remove('active')); btn.classList.add('active'); }
function showDashboard(btn) { setActive(btn); dashPanel.classList.add('active'); framePanel.classList.remove('active'); title.textContent = '기말 학습 대시보드'; desc.textContent = '박스 기반 레이아웃으로 섹션을 분리해 깔끔하게 구성했습니다.'; }
function showSubject(btn, heading) { setActive(btn); dashPanel.classList.remove('active'); framePanel.classList.add('active'); frame.src = btn.dataset.src; title.textContent = heading; desc.textContent = '선택 과목만 집중해서 볼 수 있습니다.'; }
function renderDday() { if (!ddayEl) return; const t = new Date(); const e = new Date(`${FINAL_EXAM_DATE}T00:00:00`); const ms = e - new Date(t.getFullYear(), t.getMonth(), t.getDate()); const d = Math.ceil(ms / 86400000); ddayEl.textContent = d > 0 ? `D-${d}` : d === 0 ? 'D-DAY' : `D+${Math.abs(d)}`; }
function loadGoal() { const saved = localStorage.getItem(GOAL_STORAGE_KEY); if (saved && saved.trim()) { goalValueEl.textContent = saved; goalInput.value = saved; } }
function saveGoal() { const v = goalInput.value.trim(); if (!v) { goalMsgEl.textContent = '목표를 입력해 주세요.'; return; } localStorage.setItem(GOAL_STORAGE_KEY, v); goalValueEl.textContent = v; goalMsgEl.textContent = '개인 목표가 저장되었습니다.'; setTimeout(() => { if (goalMsgEl.textContent === '개인 목표가 저장되었습니다.') goalMsgEl.textContent = ''; }, 1800); }

function initToolbarDrag(toolbar) {
  const grip = document.getElementById('inkGrip');
  if (!grip) return;
  let dragging = false;
  let startX = 0, startY = 0, left = 0, top = 0;

  const move = (e) => {
    if (!dragging) return;
    const nx = left + (e.clientX - startX);
    const ny = top + (e.clientY - startY);
    const maxX = window.innerWidth - toolbar.offsetWidth;
    const maxY = window.innerHeight - toolbar.offsetHeight;
    toolbar.style.left = `${Math.max(0, Math.min(nx, maxX))}px`;
    toolbar.style.top = `${Math.max(0, Math.min(ny, maxY))}px`;
    e.preventDefault();
  };

  const end = () => {
    dragging = false;
    toolbar.classList.remove('dragging');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
  };

  grip.addEventListener('pointerdown', (e) => {
    dragging = true;
    toolbar.classList.add('dragging');
    const rect = toolbar.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    left = rect.left;
    top = rect.top;
    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${top}px`;
    toolbar.style.right = 'auto';
    toolbar.style.bottom = 'auto';
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    e.preventDefault();
  }, { passive: false });
}

function initGlobalInk() {
  const canvas = document.getElementById('inkLayer');
  const toolbar = document.getElementById('inkToolbar');
  const toggleBtn = document.getElementById('inkToggleBtn');
  const penBtn = document.getElementById('inkPenBtn');
  const eraserBtn = document.getElementById('inkEraserBtn');
  const highlighterBtn = document.getElementById('inkHighlighterBtn');
  const clearBtn = document.getElementById('inkClearBtn');
  const saveBtn = document.getElementById('inkSaveBtn');
  const sizeInput = document.getElementById('inkSizeRange');
  const colorInput = document.getElementById('inkColorInput');
  const msg = document.getElementById('inkMsg');
  if (!canvas || !toolbar || !toggleBtn || !penBtn || !eraserBtn || !highlighterBtn || !clearBtn || !saveBtn || !sizeInput || !colorInput || !msg) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let drawing = false;
  let mode = 'pen';
  let penSize = Number(sizeInput.value || 3);
  let penColor = colorInput.value || '#0f172a';

  initToolbarDrag(toolbar);

  function setMsg(text) { msg.textContent = text; if (!text) return; setTimeout(() => { if (msg.textContent === text) msg.textContent = ''; }, 1800); }
  function setTool(next) {
    mode = next;
    penBtn.classList.toggle('active', next === 'pen');
    eraserBtn.classList.toggle('active', next === 'eraser');
    highlighterBtn.classList.toggle('active', next === 'highlighter');
  }

  function toCanvasXY(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function clearInk() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function resizeCanvas() {
    const prev = document.createElement('canvas');
    prev.width = canvas.width || 1;
    prev.height = canvas.height || 1;
    prev.getContext('2d').drawImage(canvas, 0, 0);

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.drawImage(prev, 0, 0, canvas.width, canvas.height);
  }

  function beginStroke(e) {
    if (!document.body.classList.contains('ink-on')) return;
    if (e.target.closest && e.target.closest('#inkToolbar')) return;
    drawing = true;
    const p = toCanvasXY(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);

    if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(10, penSize * 3) * (window.devicePixelRatio || 1);
    } else if (mode === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `${penColor}88`;
      ctx.lineWidth = Math.max(8, penSize * 2.2) * (window.devicePixelRatio || 1);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize * (window.devicePixelRatio || 1);
    }
    e.preventDefault();
  }

  function moveStroke(e) {
    if (!drawing) return;
    const p = toCanvasXY(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    e.preventDefault();
  }

  function endStroke() { if (!drawing) return; drawing = false; ctx.closePath(); }

  function saveInk() {
    try {
      localStorage.setItem(INK_STORAGE_KEY, canvas.toDataURL('image/png'));
      setMsg('손글씨 저장 완료');
    } catch (_) {
      setMsg('저장 실패');
    }
  }

  function loadInk() {
    const data = localStorage.getItem(INK_STORAGE_KEY);
    if (!data) return;
    const img = new Image();
    img.onload = () => {
      clearInk();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = data;
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('ink-on');
    const on = document.body.classList.contains('ink-on');
    toggleBtn.classList.toggle('active', on);
    toggleBtn.textContent = on ? '✍️ 손글씨 모드 ON' : '✍️ 손글씨 모드';
    setMsg(on ? '손글씨 모드 시작' : '손글씨 모드 종료');
  });
  penBtn.addEventListener('click', () => setTool('pen'));
  eraserBtn.addEventListener('click', () => setTool('eraser'));
  highlighterBtn.addEventListener('click', () => setTool('highlighter'));
  sizeInput.addEventListener('input', () => { penSize = Number(sizeInput.value); });
  colorInput.addEventListener('input', () => { penColor = colorInput.value; });
  clearBtn.addEventListener('click', () => { clearInk(); setMsg('전체 지움'); });
  saveBtn.addEventListener('click', saveInk);

  canvas.addEventListener('pointerdown', beginStroke, { passive: false });
  canvas.addEventListener('pointermove', moveStroke, { passive: false });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => canvas.addEventListener(evt, endStroke));

  resizeCanvas();
  loadInk();
  window.addEventListener('resize', resizeCanvas);
}

renderDday();
loadGoal();
if (goalSaveBtn) goalSaveBtn.addEventListener('click', saveGoal);
if (goalInput) goalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveGoal(); });
initGlobalInk();

window.showDashboard = showDashboard;
window.showSubject = showSubject;

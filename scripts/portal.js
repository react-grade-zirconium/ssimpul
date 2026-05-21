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
const INK_STORAGE_KEY = 'studymax_ink_snapshot_v1';

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
function renderDday() {
  if (!ddayEl) return;
  const today = new Date();
  const exam = new Date(`${FINAL_EXAM_DATE}T00:00:00`);
  const ms = exam.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days > 0) ddayEl.textContent = `D-${days}`;
  else if (days === 0) ddayEl.textContent = 'D-DAY';
  else ddayEl.textContent = `D+${Math.abs(days)}`;
}
function loadGoal() {
  const saved = localStorage.getItem(GOAL_STORAGE_KEY);
  if (saved && saved.trim()) {
    goalValueEl.textContent = saved;
    goalInput.value = saved;
  }
}
function saveGoal() {
  const value = goalInput.value.trim();
  if (!value) {
    goalMsgEl.textContent = '목표를 입력해 주세요.';
    return;
  }
  localStorage.setItem(GOAL_STORAGE_KEY, value);
  goalValueEl.textContent = value;
  goalMsgEl.textContent = '개인 목표가 저장되었습니다.';
  setTimeout(() => {
    if (goalMsgEl.textContent === '개인 목표가 저장되었습니다.') goalMsgEl.textContent = '';
  }, 1800);
}

function initGlobalInk() {
  const canvas = document.getElementById('inkLayer');
  const toolbar = document.getElementById('inkToolbar');
  const toggleBtn = document.getElementById('inkToggleBtn');
  const penBtn = document.getElementById('inkPenBtn');
  const eraserBtn = document.getElementById('inkEraserBtn');
  const clearBtn = document.getElementById('inkClearBtn');
  const saveBtn = document.getElementById('inkSaveBtn');
  const msg = document.getElementById('inkMsg');
  if (!canvas || !toolbar || !toggleBtn || !penBtn || !eraserBtn || !clearBtn || !saveBtn || !msg) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let drawing = false;
  let mode = 'pen';

  function setMsg(text) {
    msg.textContent = text;
    if (!text) return;
    setTimeout(() => {
      if (msg.textContent === text) msg.textContent = '';
    }, 1800);
  }

  function setTool(next) {
    mode = next;
    penBtn.classList.toggle('active', next === 'pen');
    eraserBtn.classList.toggle('active', next === 'eraser');
  }

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const prev = document.createElement('canvas');
    prev.width = canvas.width || 1;
    prev.height = canvas.height || 1;
    prev.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.drawImage(prev, 0, 0, prev.width / ratio, prev.height / ratio);
  }

  function pointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function beginStroke(e) {
    if (!document.body.classList.contains('ink-on')) return;
    if (e.target.closest && e.target.closest('#inkToolbar')) return;
    drawing = true;
    const p = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 18;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
    }
    e.preventDefault();
  }

  function moveStroke(e) {
    if (!drawing) return;
    const p = pointFromEvent(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    e.preventDefault();
  }

  function endStroke() {
    if (!drawing) return;
    drawing = false;
    ctx.closePath();
  }

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
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
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
  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    setMsg('전체 지움');
  });
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

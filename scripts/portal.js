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

window.showDashboard = showDashboard;
window.showSubject = showSubject;

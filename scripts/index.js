const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const finalLine = document.getElementById('finalLine');

const FIRST_FULL = '심규원, 최시원의';
const SECOND_FULL = '풀서비스 스터디';
const FINAL_TEXT = '심풀 스터디';

function typeTo(el, text, duration = 900) {
  el.classList.add('typing');
  el.textContent = text;
  el.style.maxWidth = '0px';
  requestAnimationFrame(() => {
    const target = el.scrollWidth;
    el.style.transition = `max-width ${duration}ms steps(${Math.max(text.length, 6)}, end)`;
    el.style.maxWidth = `${target}px`;
  });
}

function freeze(el) {
  el.classList.remove('typing');
  el.style.transition = 'none';
  el.style.maxWidth = 'none';
  el.style.borderRight = 'none';
}

function reduceFirstLineToShim() {
  line1.innerHTML = '<span class="shim-core">심</span><span class="fade-out">규원, 최시원의</span>';
}

function removeServiceFromSecondLine() {
  line2.innerHTML = '<span class="left-keep">풀</span><span class="fade-slide-up">서비스</span><span class="right-keep"> 스터디</span>';
}

function showFinalMergedLine() {
  finalLine.textContent = FINAL_TEXT;
  finalLine.classList.add('show-final');
}

if (finalLine) {
  finalLine.textContent = '';
  finalLine.classList.remove('show-final');
}

typeTo(line1, FIRST_FULL, 900);

setTimeout(() => {
  freeze(line1);
  typeTo(line2, SECOND_FULL, 850);
}, 1100);

setTimeout(() => {
  freeze(line2);
}, 2100);

// line2 등장 후 1.5초 뒤
setTimeout(() => {
  reduceFirstLineToShim();
  removeServiceFromSecondLine();
}, 3600);

// 그로부터 1초 뒤, 심이 아래로 내려와 심풀 스터디로 전환
setTimeout(() => {
  document.querySelector('.hero')?.classList.add('collapse-lines');
  showFinalMergedLine();
}, 4600);

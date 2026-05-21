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
  line1.innerHTML = '<span class="shim-core">심</span><span id="fadeName" class="fade-name">규원, 최시원의</span>';
  requestAnimationFrame(() => {
    document.getElementById('fadeName')?.classList.add('hide');
  });
}

function removeServiceFromSecondLine() {
  line2.innerHTML = '<span class="left-keep">풀</span><span id="fadeService" class="fade-service">서비스</span><span class="right-keep"> 스터디</span>';
  requestAnimationFrame(() => {
    document.getElementById('fadeService')?.classList.add('hide');
  });
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

setTimeout(() => {
  reduceFirstLineToShim();
  removeServiceFromSecondLine();
}, 3600);

setTimeout(() => {
  document.querySelector('.hero')?.classList.add('collapse-lines');
  showFinalMergedLine();
}, 5200);

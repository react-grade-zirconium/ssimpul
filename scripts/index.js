const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const finalLine = document.getElementById('finalLine');
const codeInput = document.getElementById('accessCodeInput');
const codeSaveBtn = document.getElementById('codeSaveBtn');
const codeMsg = document.getElementById('codeMsg');
const startBtn = document.getElementById('startStudyBtn');

const ACCESS_CODE_KEY = 'studymax_access_code';
const ACCESS_USER_KEY = 'studymax_access_user';
const VALID_CODES = {
  'SIM001': '심규원',
  'CHOI001': '최시원',
  'STUDENT-A': '학생A',
  'STUDENT-B': '학생B',
};

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
function freeze(el) { el.classList.remove('typing'); el.style.transition = 'none'; el.style.maxWidth = 'none'; el.style.borderRight = 'none'; }
function reduceFirstLineToShim() { line1.innerHTML = '<span class="shim-core">심</span><span id="fadeName" class="fade-name">규원, 최시원의</span>'; requestAnimationFrame(() => document.getElementById('fadeName')?.classList.add('hide')); }
function removeServiceFromSecondLine() { line2.innerHTML = '<span class="left-keep">풀</span><span id="fadeService" class="fade-service">서비스</span><span class="right-keep"> 스터디</span>'; requestAnimationFrame(() => document.getElementById('fadeService')?.classList.add('hide')); }
function showFinalMergedLine() { finalLine.textContent = FINAL_TEXT; finalLine.classList.add('show-final'); }

function saveCode() {
  const code = codeInput.value.trim().toUpperCase();
  if (!code || !VALID_CODES[code]) {
    codeMsg.textContent = '유효한 코드를 입력해 주세요.';
    return false;
  }
  localStorage.setItem(ACCESS_CODE_KEY, code);
  localStorage.setItem(ACCESS_USER_KEY, VALID_CODES[code]);
  codeMsg.textContent = `${VALID_CODES[code]} 코드 저장 완료`;
  return true;
}

function hasValidCode() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  return Boolean(code && VALID_CODES[code]);
}

function loadCode() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  if (code && VALID_CODES[code]) {
    codeInput.value = code;
    codeMsg.textContent = `${VALID_CODES[code]} 코드가 등록되어 있습니다.`;
  }
}

if (finalLine) { finalLine.textContent = ''; finalLine.classList.remove('show-final'); }

typeTo(line1, FIRST_FULL, 900);
setTimeout(() => { freeze(line1); typeTo(line2, SECOND_FULL, 850); }, 1100);
setTimeout(() => { freeze(line2); }, 2100);
setTimeout(() => { reduceFirstLineToShim(); removeServiceFromSecondLine(); }, 3600);
setTimeout(() => { document.querySelector('.hero')?.classList.add('collapse-lines'); showFinalMergedLine(); }, 5200);

loadCode();
codeSaveBtn?.addEventListener('click', saveCode);
codeInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveCode(); });
startBtn?.addEventListener('click', (e) => {
  if (hasValidCode()) return;
  e.preventDefault();
  codeMsg.textContent = '코드가 없어서 처음 화면에 머무릅니다. 코드를 먼저 저장해 주세요.';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

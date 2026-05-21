const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const finalLine = document.getElementById('finalLine');
const codeInput = document.getElementById('accessCodeInput');
const codeSaveBtn = document.getElementById('codeSaveBtn');
const codeMsg = document.getElementById('codeMsg');
const startBtn = document.getElementById('startStudyBtn');

const ACCESS_CODE_KEY = 'studymax_access_code';
const ACCESS_USER_KEY = 'studymax_access_user';
const DEVICE_ID_KEY = 'studymax_device_id';
const CODE_BIND_MAP_KEY = 'studymax_code_bind_map_v1';

const VALID_CODES = {
  '10201': '학생 10201',
  '10202': '학생 10202',
  '10203': '학생 10203',
  '10204': '학생 10204',
  '10205': '학생 10205',
  '10206': '학생 10206',
  '10207': '학생 10207',
  '10208': '학생 10208',
  '10209': '학생 10209',
  '10210': '학생 10210',
  '10211': '학생 10211',
  '10212': '학생 10212',
  '10213': '학생 10213',
  '10214': '학생 10214',
  '10215': '학생 10215',
  '10216': '학생 10216',
  '10217': '학생 10217',
  '10218': '학생 10218',
  '10219': '학생 10219',
  '10220': '학생 10220',
  '10221': '학생 10221',
  '10222': '학생 10222',
  '10223': '학생 10223',
  '10224': '학생 10224',
  '10225': '학생 10225',
  '10226': '학생 10226',
  '10227': '학생 10227',
  '10228': '학생 10228',
  '10229': '학생 10229',
  '10230': '학생 10230',
  '10231': '학생 10231',
  '10232': '학생 10232',
};

const FIRST_FULL = '심규원, 최시원의';
const SECOND_FULL = '풀서비스 스터디';
const FINAL_TEXT = '심풀 스터디';

function getOrCreateDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const created = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

function getBindMap() {
  try {
    return JSON.parse(localStorage.getItem(CODE_BIND_MAP_KEY) || '{}');
  } catch {
    return {};
  }
}

function setBindMap(map) {
  localStorage.setItem(CODE_BIND_MAP_KEY, JSON.stringify(map));
}

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
  const code = codeInput.value.trim();
  if (!code || !VALID_CODES[code]) {
    codeMsg.textContent = '10201~10232 코드만 사용할 수 있습니다.';
    return false;
  }

  const deviceId = getOrCreateDeviceId();
  const bindMap = getBindMap();
  const boundDevice = bindMap[code];

  if (boundDevice && boundDevice !== deviceId) {
    codeMsg.textContent = '이미 다른 기기에 등록된 코드입니다.';
    return false;
  }

  bindMap[code] = deviceId;
  setBindMap(bindMap);
  localStorage.setItem(ACCESS_CODE_KEY, code);
  localStorage.setItem(ACCESS_USER_KEY, VALID_CODES[code]);
  codeMsg.textContent = `${VALID_CODES[code]} 코드 저장 완료 (이 기기 전용)`;
  return true;
}

function hasValidCodeForThisDevice() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  if (!code || !VALID_CODES[code]) return false;
  const deviceId = getOrCreateDeviceId();
  const bindMap = getBindMap();
  return bindMap[code] === deviceId;
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

getOrCreateDeviceId();
loadCode();
codeSaveBtn?.addEventListener('click', saveCode);
codeInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveCode(); });
startBtn?.addEventListener('click', (e) => {
  if (hasValidCodeForThisDevice()) return;
  e.preventDefault();
  codeMsg.textContent = '이 기기에 등록된 유효 코드가 필요합니다.';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

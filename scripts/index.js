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
const ACCESS_BIND_API = '/api/access-bind';

const VALID_CODES = {
  '26-10201': '학생 26-10201',
  '26-10202': '학생 26-10202',
  '26-10203': '학생 26-10203',
  '26-10204': '학생 26-10204',
  '26-10205': '학생 26-10205',
  '26-10206': '학생 26-10206',
  '26-10207': '학생 26-10207',
  '26-10208': '학생 26-10208',
  '26-10209': '학생 26-10209',
  '26-10210': '학생 26-10210',
  '26-10211': '학생 26-10211',
  '26-10212': '학생 26-10212',
  '26-10213': '학생 26-10213',
  '26-10214': '학생 26-10214',
  '26-10215': '학생 26-10215',
  '26-10216': '학생 26-10216',
  '26-10217': '학생 26-10217',
  '26-10218': '학생 26-10218',
  '26-10219': '학생 26-10219',
  '26-10220': '학생 26-10220',
  '26-10221': '학생 26-10221',
  '26-10222': '학생 26-10222',
  '26-10223': '학생 26-10223',
  '26-10224': '학생 26-10224',
  '26-10225': '학생 26-10225',
  '26-10226': '학생 26-10226',
  '26-10227': '학생 26-10227',
  '26-10228': '학생 26-10228',
  '26-10229': '학생 26-10229',
  '26-10230': '학생 26-10230',
  '26-10231': '학생 26-10231',
  '26-10232': '학생 26-10232',
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

async function bindCodeToDevice(code, deviceId, forceReset = false) {
  const res = await fetch(ACCESS_BIND_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, deviceId, forceReset }),
  });
  let payload = null;
  try {
    payload = await res.json();
  } catch (_) {
    payload = null;
  }
  if (!res.ok) {
    return {
      ok: false,
      reason: payload?.reason || 'BIND_FAILED',
      message: payload?.message || '코드 등록에 실패했습니다.',
    };
  }
  return payload;
}

function getLocalBindMap() {
  try { return JSON.parse(localStorage.getItem(CODE_BIND_MAP_KEY) || '{}'); }
  catch (_) { return {}; }
}

function setLocalBindMap(map) {
  localStorage.setItem(CODE_BIND_MAP_KEY, JSON.stringify(map));
}

function bindCodeToDeviceLocal(code, deviceId, forceReset = false) {
  const map = getLocalBindMap();
  const boundDevice = map[code];
  if (boundDevice && boundDevice !== deviceId && !forceReset) {
    return { ok: false, reason: 'ALREADY_BOUND_OTHER_DEVICE', message: '이미 다른 기기에 등록된 코드입니다.' };
  }
  map[code] = deviceId;
  setLocalBindMap(map);
  return { ok: true, valid: true };
}

async function verifyCodeOnDevice(code, deviceId) {
  const query = new URLSearchParams({ code, deviceId }).toString();
  const res = await fetch(`${ACCESS_BIND_API}?${query}`, { method: 'GET' });
  if (!res.ok) throw new Error('verify_failed');
  return res.json();
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

async function saveCode() {
  const code = codeInput.value.trim();
  if (!code || !VALID_CODES[code]) {
    codeMsg.textContent = '26-10201~26-10232 코드만 사용할 수 있습니다.';
    return false;
  }

  const deviceId = getOrCreateDeviceId();
  const saveWithLocalFallback = () => {
    let localResult = bindCodeToDeviceLocal(code, deviceId, false);
    if (!localResult?.ok && localResult?.reason === 'ALREADY_BOUND_OTHER_DEVICE') {
      const confirmed = window.confirm('기존 등록 기기를 초기화하고, 현재 기기로 다시 등록할까요?');
      if (!confirmed) {
        codeMsg.textContent = '초기화가 취소되었습니다.';
        return false;
      }
      localResult = bindCodeToDeviceLocal(code, deviceId, true);
    }
    if (!localResult?.ok) {
      codeMsg.textContent = localResult?.message || '코드 등록에 실패했습니다.';
      return false;
    }
    localStorage.setItem(ACCESS_CODE_KEY, code);
    localStorage.setItem(ACCESS_USER_KEY, VALID_CODES[code]);
    codeMsg.textContent = `${VALID_CODES[code]} 코드 저장 완료 (로컬 초기화 반영)`;
    return true;
  };

  try {
    let result = await bindCodeToDevice(code, deviceId, false);
    if (!result?.ok && result?.reason === 'ALREADY_BOUND_OTHER_DEVICE') {
      const confirmed = window.confirm('기존 등록 기기를 초기화하고, 현재 기기로 다시 등록할까요?');
      if (!confirmed) {
        codeMsg.textContent = '초기화가 취소되었습니다.';
        return false;
      }
      result = await bindCodeToDevice(code, deviceId, true);
    }
    if (!result?.ok && result?.reason === 'BIND_FAILED') {
      return saveWithLocalFallback();
    }
    if (!result?.ok) {
      codeMsg.textContent = result?.message || '코드 등록에 실패했습니다.';
      return false;
    }
    localStorage.setItem(ACCESS_CODE_KEY, code);
    localStorage.setItem(ACCESS_USER_KEY, VALID_CODES[code]);
    codeMsg.textContent = `${VALID_CODES[code]} 코드 저장 완료 (기기 초기화 반영)`;
    return true;
  } catch (_) {
    return saveWithLocalFallback();
  }
}

async function hasValidCodeForThisDevice() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  if (!code || !VALID_CODES[code]) return false;
  const deviceId = getOrCreateDeviceId();
  try {
    const result = await verifyCodeOnDevice(code, deviceId);
    return Boolean(result?.ok && result?.valid);
  } catch (_) {
    const bindMap = getLocalBindMap();
    return bindMap[code] === deviceId;
  }
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
codeSaveBtn?.addEventListener('click', () => { saveCode(); });
codeInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveCode(); });
startBtn?.addEventListener('click', async (e) => {
  if (await hasValidCodeForThisDevice()) return;
  e.preventDefault();
  codeMsg.textContent = '이 기기에 1:1로 등록된 유효 코드가 필요합니다.';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

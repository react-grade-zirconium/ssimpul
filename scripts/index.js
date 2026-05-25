const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const finalLine = document.getElementById('finalLine');
const classInput = document.getElementById('classInput');
const numberInput = document.getElementById('numberInput');
const codeSaveBtn = document.getElementById('codeSaveBtn');
const codeMsg = document.getElementById('codeMsg');
const startBtn = document.getElementById('startStudyBtn');

const ACCESS_CODE_KEY = 'studymax_access_code';
const ACCESS_USER_KEY = 'studymax_access_user';
const ACCESS_SERVER_CODE_KEY = 'studymax_access_server_code';
const DEVICE_ID_KEY = 'studymax_device_id';
const ACCESS_BIND_API = '/api/access-bind';
const MASTER_CODE = 'simpul';

const CLASS_MIN = 1;
const CLASS_MAX = 8;
const NUMBER_MIN = 1;
const NUMBER_MAX = 35;

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


function parseClassNumberInput() {
  const classNo = Number(classInput?.value ?? '');
  const numberNo = Number(numberInput?.value ?? '');
  if (!Number.isInteger(classNo) || !Number.isInteger(numberNo)) {
    return { ok: false, message: '반/번호를 숫자로 입력해 주세요.' };
  }
  if (classNo < CLASS_MIN || classNo > CLASS_MAX) {
    return { ok: false, message: '반은 1~8 사이만 입력할 수 있습니다.' };
  }
  if (numberNo < NUMBER_MIN || numberNo > NUMBER_MAX) {
    return { ok: false, message: '번호는 1~35 사이만 입력할 수 있습니다.' };
  }
  const code = `${classNo}-${String(numberNo).padStart(2, '0')}`;
  return { ok: true, classNo, numberNo, code, label: `${classNo}반 ${numberNo}번` };
}

function fillInputsFromCode(code) {
  const m = code && code.match(/^(\d+)-(\d{2})$/);
  if (!m) return false;
  const classNo = Number(m[1]);
  const numberNo = Number(m[2]);
  if (classNo < CLASS_MIN || classNo > CLASS_MAX || numberNo < NUMBER_MIN || numberNo > NUMBER_MAX) return false;
  if (classInput) classInput.value = String(classNo);
  if (numberInput) numberInput.value = String(numberNo);
  return true;
}

function buildServerCodeCandidates(classNo, numberNo) {
  const number2 = String(numberNo).padStart(2, '0');
  const class2 = String(classNo).padStart(2, '0');
  const raw = [
    `${classNo}-${number2}`,
    `${classNo}-${numberNo}`,
    `26-10${classNo}${number2}`,
    `26-10${classNo}${numberNo}`,
    `26-10${class2}${number2}`,
    `26-102${number2}`,
  ];
  return [...new Set(raw)];
}

function getStoredServerCode() {
  return localStorage.getItem(ACCESS_SERVER_CODE_KEY) || localStorage.getItem(ACCESS_CODE_KEY);
}


async function saveCode() {
  if ((classInput?.value || '').trim().toLowerCase() === MASTER_CODE) {
    localStorage.setItem(ACCESS_CODE_KEY, MASTER_CODE);
    localStorage.setItem(ACCESS_USER_KEY, '마스터 코드');
    codeMsg.textContent = '마스터 코드 저장 완료';
    return true;
  }
  const parsed = parseClassNumberInput();
  if (!parsed.ok) {
    codeMsg.textContent = parsed.message;
    return false;
  }
  const code = parsed.code;
  const candidates = buildServerCodeCandidates(parsed.classNo, parsed.numberNo);

  const deviceId = getOrCreateDeviceId();
  try {
    let serverCode = candidates[0];
    let result = { ok: false };
    for (const candidate of candidates) {
      serverCode = candidate;
      result = await bindCodeToDevice(serverCode, deviceId, false);
      if (result?.ok || result?.reason === 'ALREADY_BOUND_OTHER_DEVICE') break;
    }
    if (!result?.ok && result?.reason === 'ALREADY_BOUND_OTHER_DEVICE') {
      const confirmed = window.confirm('기존 등록 기기를 초기화하고, 현재 기기로 다시 등록할까요?');
      if (!confirmed) {
        codeMsg.textContent = '초기화가 취소되었습니다.';
        return false;
      }
      result = await bindCodeToDevice(serverCode, deviceId, true);
    }
    if (!result?.ok) {
      const reason = result?.reason || 'UNKNOWN';
      const baseMessage = result?.message || '코드 등록에 실패했습니다.';
      codeMsg.textContent = `${baseMessage} [reason: ${reason}]`;
      return false;
    }
    localStorage.setItem(ACCESS_CODE_KEY, code);
    localStorage.setItem(ACCESS_SERVER_CODE_KEY, serverCode);
    localStorage.setItem(ACCESS_USER_KEY, parsed.label);
    codeMsg.textContent = `${parsed.label} 코드 저장 완료 (기기 초기화 반영)`;
    return true;
  } catch (_) {
    codeMsg.textContent = '서버 연결 실패: 1인 1코드 인증을 위해 서버가 필요합니다.';
    return false;
  }
}

async function hasValidCodeForThisDevice() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  if (code === MASTER_CODE) return true;
  if (!code || !fillInputsFromCode(code)) return false;
  const serverCode = getStoredServerCode();
  const deviceId = getOrCreateDeviceId();
  try {
    const result = await verifyCodeOnDevice(serverCode, deviceId);
    return Boolean(result?.ok && result?.valid);
  } catch (_) {
    return false;
  }
}

function loadCode() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  if (code === MASTER_CODE) {
    if (classInput) classInput.value = code;
    if (numberInput) numberInput.value = '';
    localStorage.removeItem(ACCESS_SERVER_CODE_KEY);
    codeMsg.textContent = '마스터 코드가 등록되어 있습니다.';
    return;
  }
  if (code && fillInputsFromCode(code)) {
    const classNo = Number(classInput?.value || 0);
    const numberNo = Number(numberInput?.value || 0);
    codeMsg.textContent = `${classNo}반 ${numberNo}번 코드가 등록되어 있습니다.`;
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
classInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveCode(); });
numberInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveCode(); });
startBtn?.addEventListener('click', async (e) => {
  if (await hasValidCodeForThisDevice()) return;
  e.preventDefault();
  codeMsg.textContent = '이 기기에 1:1로 등록된 유효 코드가 필요합니다.';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

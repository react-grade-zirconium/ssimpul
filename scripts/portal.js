const title=document.getElementById('title'),desc=document.getElementById('desc');
const dashPanel=document.getElementById('dashPanel'),framePanel=document.getElementById('framePanel'),frame=document.getElementById('frame');
function setActive(btn){document.querySelectorAll('.menu button').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}
function showDashboard(btn){setActive(btn);dashPanel.classList.add('active');framePanel.classList.remove('active');title.textContent='기말 학습 대시보드';desc.textContent='요소를 최소화한 깔끔한 화면입니다.'}
function showSubject(btn,heading){setActive(btn);dashPanel.classList.remove('active');framePanel.classList.add('active');frame.src=btn.dataset.src;title.textContent=heading;desc.textContent='선택 과목만 집중해서 볼 수 있습니다.'}
window.showDashboard=showDashboard;
window.showSubject=showSubject;

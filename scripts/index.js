const line1=document.getElementById('line1');
const line2=document.getElementById('line2');
const seq=[
  {el:line1,start:'심규원, 최시원의',final:'심'},
  {el:line2,start:'풀서비스 스터디',final:'풀 스터디'}
];

function typeTo(el,text,duration=900){
  el.classList.add('typing');
  el.textContent=text;
  el.style.maxWidth='0px';
  requestAnimationFrame(()=>{
    const target=el.scrollWidth;
    el.style.transition=`max-width ${duration}ms steps(${Math.max(text.length,6)}, end)`;
    el.style.maxWidth=target+'px';
  });
}

function freeze(el,text){
  el.classList.remove('typing');
  el.style.transition='none';
  el.textContent=text;
  el.style.maxWidth='none';
  el.style.borderRight='none';
}

typeTo(seq[0].el,seq[0].start,1000);
setTimeout(()=>{freeze(seq[0].el,seq[0].final);typeTo(seq[1].el,seq[1].start,900);},1300);
setTimeout(()=>{freeze(seq[1].el,seq[1].final);},2500);

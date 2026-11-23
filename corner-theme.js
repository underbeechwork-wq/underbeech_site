/* Underbeech: shared corner selection, 40 rules (16 rounded / 24 square). */
(()=>{
'use strict';
// Keep the editor's baseline independent from the published corner selection.
try{if(window.parent!==window&&window.parent.location.origin===location.origin&&window.parent.location.pathname==='/corner-preview.html')return}catch(error){}
if(window.__underbeechCornerTheme)return;
window.__underbeechCornerTheme=true;
const settings={"base":"mixed","rules":[{"s":"a.primary-cta","a":0},{"s":"a.secondary-cta","a":0},{"s":"div.hero-badges > span","a":0},{"s":"div.hero-summary > a","a":0},{"s":"div.hero-summary","a":1},{"s":"img.hero-person","a":1},{"s":"nav.nav > a","a":0},{"s":"a.logo > img","a":1},{"s":"section.easy-strip > article","a":0},{"s":"section.easy-strip","a":0},{"s":"a.inline-link-button","a":0},{"s":"div.trust-panel","a":0},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(1) > img:nth-of-type(1)","a":1},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(2) > img:nth-of-type(1)","a":1},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(3) > img:nth-of-type(1)","a":1},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(6) > img:nth-of-type(1)","a":1},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(5) > img:nth-of-type(1)","a":1},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(4) > img:nth-of-type(1)","a":1},{"s":"#recentWorkRail > a:nth-of-type(1) > div:nth-of-type(1) > figure:nth-of-type(1) > img:nth-of-type(1)","a":1},{"s":"#recentWorkRail > a:nth-of-type(1) > div:nth-of-type(1) > figure:nth-of-type(2) > img:nth-of-type(1)","a":1},{"s":"a.recent-work-card","a":1},{"s":"a.recent-work-all","a":0},{"s":"div.estimate-free-areas > span","a":0},{"s":"div.estimate-policy-grid > article","a":0},{"s":"#serviceSelect","a":1},{"s":"div.estimate > button","a":1},{"s":"div.estimate-empty","a":1},{"s":"textarea.estimate-export-text","a":1},{"s":"figure.about-person-photo > img","a":0},{"s":"a.contact-faq-link","a":0},{"s":"span.maintenance-badge","a":0},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(3) > figcaption:nth-of-type(1)","a":0},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(2) > figcaption:nth-of-type(1)","a":0},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(1) > figcaption:nth-of-type(1)","a":0},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(4) > figcaption:nth-of-type(1)","a":0},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(5) > figcaption:nth-of-type(1)","a":0},{"s":"#service > div:nth-of-type(4) > figure:nth-of-type(6) > figcaption:nth-of-type(1)","a":0},{"s":"div.service-subline","a":0},{"s":"div.subpage-hero-card > a","a":0},{"s":"div.subpage-hero-card","a":0}]};
const css="html.ub-corner-measuring *,html.ub-corner-measuring *::before,html.ub-corner-measuring *::after{transition:none!important}\nhtml.ub-corner-theme *,html.ub-corner-theme *::before,html.ub-corner-theme *::after{border-radius:0!important}\nhtml.ub-corner-theme [data-ub-corner-auto]{border-radius:var(--ub-corner-auto-radius)!important}\nhtml.ub-corner-theme [data-ub-corner-before]::before{border-radius:var(--ub-corner-before-radius)!important}\nhtml.ub-corner-theme [data-ub-corner-after]::after{border-radius:var(--ub-corner-after-radius)!important}\nhtml.ub-corner-theme [data-ub-corner-manual]{border-radius:var(--ub-corner-manual-radius)!important}";
const attrs=['data-ub-corner-auto','data-ub-corner-before','data-ub-corner-after','data-ub-corner-manual'];
let queued=0;
function hasRadius(radius){return (radius||'').split(/[\s/]+/).some(value=>parseFloat(value)>0)}
function keepRounded(width,height){const ratio=width/height;return width>0&&height>0&&((ratio>=.9&&ratio<=1.1)||(height<=80&&ratio>=1.5))}
function apply(){
queued=0;
const root=document.documentElement;
if(!document.body)return;
try{
root.classList.add('ub-corner-measuring');
root.classList.remove('ub-corner-theme');
document.querySelectorAll(attrs.map(name=>'['+name+']').join(',')).forEach(el=>attrs.forEach(name=>el.removeAttribute(name)));
const natural=new WeakMap(),automatic=[];
document.body.querySelectorAll('*').forEach(el=>{
const rect=el.getBoundingClientRect();
if(!rect.width||!rect.height)return;
const style=getComputedStyle(el);
natural.set(el,style.borderRadius);
if(settings.base==='mixed'){
if(hasRadius(style.borderRadius)&&keepRounded(rect.width,rect.height))automatic.push({el,attr:attrs[0],variable:'--ub-corner-auto-radius',radius:style.borderRadius});
['before','after'].forEach(pseudo=>{
const p=getComputedStyle(el,'::'+pseudo);
if(p.content==='none'||p.content==='normal'||!hasRadius(p.borderRadius))return;
if(keepRounded(parseFloat(p.width),parseFloat(p.height)))automatic.push({el,attr:'data-ub-corner-'+pseudo,variable:'--ub-corner-'+pseudo+'-radius',radius:p.borderRadius});
});
}
});
automatic.forEach(({el,attr,variable,radius})=>{el.style.setProperty(variable,radius);el.setAttribute(attr,'')});
settings.rules.forEach(rule=>{
document.querySelectorAll(rule.s).forEach(el=>{
if(!document.body.contains(el))return;
const original=natural.get(el);
el.style.setProperty('--ub-corner-manual-radius',rule.a?(hasRadius(original)?original:'10px'):'0px');
el.setAttribute('data-ub-corner-manual','');
});
});
if(settings.base!=='rounded')root.classList.add('ub-corner-theme');
}catch(error){
root.classList.remove('ub-corner-theme');
console.warn('Corner styling could not be applied.',error);
}finally{root.classList.remove('ub-corner-measuring')}
}
function schedule(){if(!queued)queued=requestAnimationFrame(apply)}
function start(){
const style=document.createElement('style');style.id='underbeech-corner-theme';style.textContent=css;document.head.appendChild(style);
apply();
new MutationObserver(records=>{
if(records.some(record=>record.type==='attributes'||[...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===1)))schedule();
}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('load',schedule,{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

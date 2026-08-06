(function(){
  'use strict';
  var base=location.origin+location.pathname.replace(/\/[^/]*$/,'/');
  function load(n){return fetch(base+'content/'+n+'.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});}
  function q(s,r){return (r||document).querySelector(s);}
  function qa(s,r){return Array.from((r||document).querySelectorAll(s));}

  function style(){
    if(q('#kaizuro-structure-css'))return;
    var s=document.createElement('style');
    s.id='kaizuro-structure-css';
    s.textContent=`
      .cms-created-section{padding:clamp(76px,9vw,132px) var(--pad);border-top:1px solid var(--line)}
      .cms-created-shell{width:min(1180px,100%);margin:0 auto}
      .cms-created-intro{max-width:760px;margin-bottom:clamp(38px,5vw,68px)}
      .cms-created-intro h2{margin:.2em 0 .35em;font-size:clamp(42px,6vw,78px);font-weight:300;line-height:1.02;letter-spacing:-.04em}
      .cms-created-intro>div,.cms-created-card p{color:var(--muted);font-size:clamp(16px,1.35vw,20px);line-height:1.55}
      .cms-four-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
      .cms-created-card{padding:clamp(25px,3vw,38px);border:1px solid var(--line);background:rgba(255,255,255,.025)}
      .cms-created-card h4{margin:0 0 8px;font-size:clamp(18px,2vw,25px)}
      .cms-created-card a,.cms-created-link{display:inline-flex;margin-top:20px;color:inherit;font-weight:700;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:5px}
      #blank-action,#warranty-support{background:#050505;color:#f4f4f2}
      .cms-created-close{display:block;margin-top:38px;font-size:clamp(20px,2vw,30px)}
      @media(max-width:760px){.cms-four-col{grid-template-columns:1fr}.cms-created-section{padding:70px 20px}}
    `;
    document.head.appendChild(s);
  }

  function section(id,cls){
    var s=document.createElement('section');
    s.id=id;
    s.className='cms-created-section '+(cls||'');
    return s;
  }

  function applyFeatureSection(id,d){
    if(!d)return;
    var s=q('#'+id)||section(id,'section-dark');
    s.innerHTML='<div class="cms-created-shell"><div class="cms-created-intro"><p class="eyebrow"></p><h2></h2><div></div></div><div class="cms-four-col"></div><strong class="cms-created-close"></strong></div>';
    q('.eyebrow',s).textContent=d.eyebrow||'';
    q('h2',s).textContent=d.title||'';
    q('.cms-created-intro>div',s).innerHTML=d.body||'';
    var g=q('.cms-four-col',s);
    (d.features||d.items||[]).forEach(function(x){
      var a=document.createElement('article');
      a.className='cms-created-card';
      a.innerHTML='<h4></h4><div></div>';
      q('h4',a).textContent=x.title||'';
      q('div',a).innerHTML=x.body||'';
      g.appendChild(a);
    });
    var close=q('.cms-created-close',s);
    if(d.closing_line)close.textContent=d.closing_line;
    else if(d.contact_label){
      close.innerHTML='<a class="cms-created-link"></a>';
      q('a',close).textContent=d.contact_label;
      q('a',close).href=d.contact_href||'#';
    }
    if(!s.parentNode)q('main').appendChild(s);
  }

  function applyPayment(d){
    var dep=q('#founder .founder-deposit');
    if(!dep||!d)return;
    var intro=q('.deposit-intro',dep);
    if(intro){
      var e=q('.eyebrow',intro),h=q('h3',intro),p=q(':scope>p:not(.eyebrow)',intro);
      if(e)e.textContent=d.eyebrow||'';
      if(h)h.textContent=d.title||'';
      if(p)p.innerHTML=d.body||'';
    }
    qa('.founder-payment-steps li',dep).forEach(function(li,i){
      var num=q('span',li),x=(d.steps||[])[i];
      if(x!=null){li.textContent=x;if(num)li.prepend(num);}
    });
    qa('.founder-payment-card',dep).forEach(function(card,i){
      var x=(d.products||[])[i];
      if(!x)return;
      var title=q('.founder-payment-title',card);
      if(title)title.innerHTML='<span>'+x.model+'</span><small>'+x.rating+'</small>';
      var k=q('.founder-payment-kicker',card);if(k)k.textContent=x.kicker||'';
      var rows=qa('dl>div',card);
      var vals=[['Founder price',(x.price||'')+' '+(x.currency||'')],[x.deposit_label,x.deposit],[x.balance_label,x.balance]];
      rows.forEach(function(r,n){if(vals[n]){var dt=q('dt',r),dd=q('dd',r);if(dt)dt.textContent=vals[n][0]||'';if(dd)dd.textContent=vals[n][1]||'';}});
      var sec=q('.founder-payment-secure',card);if(sec)sec.textContent=x.secure_label||'';
      var a=q('a',card);if(a){a.href=x.checkout_url||'#';var sp=q('span',a);if(sp)sp.textContent=x.button_label||'';}
    });
  }

  function applyPack(d){
    var root=q('#founder .founder-options');
    if(!root||!d)return;
    var choices=qa('.founder-choice',root);
    if(choices[0]){
      var h=q('h3',choices[0]),p=q('.choice-head p',choices[0]);
      if(h)h.textContent=d.cap_heading||'';if(p)p.textContent=d.cap_subheading||'';
      qa('figure',choices[0]).forEach(function(f,i){var x=(d.caps||[])[i];if(!x)return;var im=q('img',f),b=q('figcaption b',f);if(im){im.src=x.image_src;im.alt=x.image_alt;}if(b)b.textContent=x.name;});
    }
    if(choices[1]){
      var h2=q('h3',choices[1]),p2=q('.choice-head p',choices[1]);
      if(h2)h2.textContent=d.pack_heading||'';if(p2)p2.textContent=d.pack_subheading||'';
      qa('figure',choices[1]).forEach(function(f,i){var x=(d.packs||[])[i];if(!x)return;var im=q('img',f),b=q('figcaption b',f);if(im){im.src=x.image_src;im.alt=x.image_alt;}if(b)b.textContent=x.name;});
    }
  }

  function setSelect(sel,label,items){
    var s=q(sel);if(!s)return;
    var lab=s.closest('label');
    if(lab){Array.from(lab.childNodes).filter(function(n){return n.nodeType===3;}).forEach(function(n){n.remove();});lab.prepend(document.createTextNode(label+' '));}
    s.innerHTML='<option value="">Select '+String(label||'option').toLowerCase()+'</option>';
    (items||[]).forEach(function(v){var o=document.createElement('option');o.textContent=v;o.value=v;s.appendChild(o);});
  }

  function applyForm(d){
    var f=q('#founder .founder-form');if(!f||!d)return;
    f.action='mailto:'+d.action_email+'?subject='+encodeURIComponent(d.subject||'Founder 100 allocation');
    f.dataset.cmsHeading=d.heading||'Founder details';
    var fields=qa('input:not([type=checkbox])',f);
    (d.fields||[]).forEach(function(x,i){
      var input=fields[i];if(!input)return;
      input.type=x.type||'text';input.name=x.name||x.label;input.placeholder=x.placeholder||'';input.required=!!x.required;
      var lab=input.closest('label');
      if(lab){Array.from(lab.childNodes).filter(function(n){return n.nodeType===3;}).forEach(function(n){n.remove();});lab.prepend(document.createTextNode(x.label+' '));}
    });
    setSelect('select[name="Preferred rod"]',d.rod_label,d.rod_options);
    setSelect('select[name="Preferred cap"]',d.cap_label,d.cap_options);
    setSelect('select[name="Preferred offshore pack"]',d.pack_label,d.pack_options);
    var ta=q('textarea',f);if(ta){ta.placeholder=d.notes_placeholder||'';var l=ta.closest('label');if(l&&l.firstChild)l.firstChild.textContent=(d.notes_label||'Notes')+' ';}
    var c=q('.form-consent span',f);if(c)c.textContent=d.consent||'';
    var b=q('button[type=submit]',f);if(b)b.textContent=d.submit_label||'';
  }

  function reorder(){
    var m=q('main');if(!m)return;
    var obsolete=q('#rod-comparison');if(obsolete)obsolete.remove();
    var ids=['purpose','story','assault','grip','principles','details','reel','blank-action','proof','specifications','founder','warranty-support','terms','halo','evolution','updates'];
    ids.forEach(function(id){var el=q('#'+id);if(el&&el.parentElement===m&&el.tagName==='SECTION')m.appendChild(el);});
    var shell=q('#founder .founder-shell');
    if(shell){
      var intro=q('.founder-intro',shell),dep=q('.founder-deposit',shell),pack=q('.founder-options',shell),form=q('.founder-form',shell),road=q('.founder-roadmap',shell);
      [intro,dep,pack,form,road].forEach(function(el){if(el&&el.parentElement===shell)shell.appendChild(el);});
    }
    window.scrollTo(0,0);
  }

  style();
  var obsolete=q('#rod-comparison');if(obsolete)obsolete.remove();
  Promise.all([load('blank_action'),load('warranty_support'),load('founder_payment'),load('founder_pack'),load('founder_form')])
    .then(function(d){
      applyFeatureSection('blank-action',d[0]);
      applyFeatureSection('warranty-support',d[1]);
      applyPayment(d[2]);
      applyPack(d[3]);
      applyForm(d[4]);
      reorder();
      window.dispatchEvent(new CustomEvent('kaizuro:structure-ready'));
    })
    .catch(function(e){console.error('[KAIZURO structure]',e);});
})();

/* PROJECT ELITE uses the exact live width and left edge of Design Principles. */
(function(){
  function set(el,name,value){if(el)el.style.setProperty(name,value,'important');}
  function apply(){
    var section=document.querySelector('#assault');
    if(!section)return;
    var copy=section.querySelector('.assault-copy');
    var media=section.querySelector('.full-width-product');
    var reference=document.querySelector('#principles .system-grid');
    var desktop=window.matchMedia('(min-width:1101px)').matches;
    if(desktop){
      var referenceWidth=reference&&reference.getBoundingClientRect().width;
      set(section,'display','grid');
      set(section,'grid-template-columns','minmax(0,5fr) minmax(0,7fr)');
      set(section,'column-gap','clamp(48px,5vw,84px)');
      set(section,'box-sizing','border-box');
      set(section,'width',referenceWidth?referenceWidth+'px':'min(1440px,calc(100% - (var(--site-gutter, var(--pad)) * 2)))');
      set(section,'max-width','none');
      set(section,'height','auto');
      set(section,'min-height','0');
      set(section,'margin-left','auto');
      set(section,'margin-right','auto');
      set(section,'padding-top','40px');
      set(section,'padding-bottom','40px');
      set(section,'align-items','center');
      set(section,'align-content','start');
      set(section,'overflow','hidden');
      set(copy,'grid-column','1');
      set(copy,'grid-row','1');
      set(copy,'box-sizing','border-box');
      set(copy,'width','100%');
      set(copy,'height','auto');
      set(copy,'min-height','0');
      set(copy,'margin','0');
      set(copy,'padding','0');
      set(copy,'justify-content','center');
      set(copy,'align-self','center');
      set(copy,'transform','none');
      set(media,'grid-column','2');
      set(media,'grid-row','1');
      set(media,'position','relative');
      set(media,'inset','auto');
      set(media,'box-sizing','border-box');
      set(media,'width','100%');
      set(media,'max-width','none');
      set(media,'height','auto');
      set(media,'min-height','0');
      set(media,'margin','0');
      set(media,'align-self','center');
      set(media,'aspect-ratio','16 / 9');
      set(media,'transform','none');
    }else{
      ['height','min-height','margin-left','margin-right','padding-top','padding-bottom','align-content','max-width','width'].forEach(function(n){section.style.removeProperty(n);});
      ['height','min-height','margin','padding','justify-content','align-self','transform'].forEach(function(n){if(copy)copy.style.removeProperty(n);});
      ['position','inset','width','max-width','height','min-height','margin','align-self','aspect-ratio','transform'].forEach(function(n){if(media)media.style.removeProperty(n);});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  window.addEventListener('load',apply);
  window.addEventListener('resize',apply);
  window.addEventListener('kaizuro:content-loaded',apply);
  window.addEventListener('kaizuro:structure-ready',apply);
  setTimeout(apply,100);
  setTimeout(apply,500);
  setTimeout(apply,1500);
})();
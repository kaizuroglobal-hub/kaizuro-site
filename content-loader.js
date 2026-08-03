/** Pages CMS runtime content layer. */
(function () {
  "use strict";
  if (location.protocol === "file:") return;
  var base = location.origin + location.pathname.replace(/\/[^/]*$/, "/");

  function load(name) {
    return fetch(base + "content/" + name + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function (e) { console.warn("[CMS] " + name + " not applied", e); return null; });
  }
  function q(sel, root) { try { return (root || document).querySelector(sel); } catch (e) { console.warn("[CMS] Invalid selector", sel); return null; } }
  function qa(sel, root) { try { return Array.from((root || document).querySelectorAll(sel)); } catch (e) { console.warn("[CMS] Invalid selector", sel); return []; } }
  function txt(sel, value, root) { var el = q(sel, root); if (el && value != null) el.textContent = value; }
  function html(sel, value, root) {
    var el = q(sel, root); if (!el || value == null) return;
    var str = String(value);
    var block = /<(?:p|ol|ul|blockquote|h[1-6]|div|table)\b/i.test(str);
    if (el.tagName === "P" && block) {
      var m = str.trim().match(/^<p(?:\s[^>]*)?>([\s\S]*)<\/p>$/i);
      if (m && !/<\/?(?:p|ol|ul|li|blockquote|h[1-6]|div|table)\b/i.test(m[1])) el.innerHTML = m[1];
      else { var d = document.createElement("div"); d.className = (el.className ? el.className + " " : "") + "cms-rich-text"; d.innerHTML = str; el.replaceWith(d); }
    } else el.innerHTML = str;
  }
  function attr(sel, name, value, root) { var el = q(sel, root); if (el && value != null) el.setAttribute(name, value); }
  function lines(sel, values, root) { qa(sel, root).forEach(function (el, i) { if (values[i] != null) el.textContent = values[i]; }); }
  function htmlElement(el,v){if(!el||v==null)return;var old=el.id;el.id="__cms_temp__";html("#__cms_temp__",v);if(document.getElementById("__cms_temp__")){if(old)el.id=old;else el.removeAttribute("id");}}

  function applySite(d) { if (!d) return; if (d.title) document.title = d.title; attr('meta[name="description"]', "content", d.description); attr('meta[property="og:image"]', "content", d.og_image); }
  function applyHero(d) { if (!d) return; var s=q("#purpose"); txt(".eyebrow",d.eyebrow,s); lines("#hero-title span",[d.title_line1,d.title_line2],s); html(".hero-copy>p:not(.eyebrow)",d.description,s); lines(".hero-actions a",[d.cta_discover_label,d.cta_join_label],s); var a=qa(".hero-actions a",s); if(a[0]&&d.cta_discover_href)a[0].href=d.cta_discover_href;if(a[1]&&d.cta_join_href)a[1].href=d.cta_join_href; lines(".hero-status span",[d.status_1,d.status_2],s); attr("picture source","srcset",d.image_mobile_src,s); attr("picture img","src",d.image_desktop_src,s); attr("picture img","alt",d.image_alt,s); }
  function applyStory(d){if(!d)return;var s=q("#story");txt(".eyebrow",d.eyebrow,s);txt("#origin-title",d.title,s);var p=qa(".story-copy>p:not(.eyebrow)",s);if(p[0])htmlElement(p[0],d.body_1);if(p[1])htmlElement(p[1],d.principles_text);attr("img","src",d.image_src,s);attr("img","alt",d.image_alt,s);}
  function applyAssault(d){if(!d)return;var s=q("#assault");txt(".eyebrow",d.eyebrow,s);txt("#assault-title",d.title,s);txt(".section-lead",d.lead,s);html(".assault-copy>p:not(.eyebrow):not(.section-lead)",d.body,s);txt(".assault-copy>strong",d.tagline,s);attr("img","src",d.image_src,s);attr("img","alt",d.image_alt,s);}
  function applyPrinciples(d){if(!d)return;var s=q("#principles");txt(".eyebrow",d.eyebrow,s);lines("#system-title span",[d.title_line1,d.title_line2],s);html(".system-intro",d.intro,s);qa(".principle-row article",s).forEach(function(a,i){var x=d.principles&&d.principles[i];if(!x)return;txt("span",x.number,a);txt("h3",x.title,a);html("p",x.body,a);});}
  function applyEngineering(d){if(!d)return;var s=q("#details");txt(".eyebrow",d.section_eyebrow,s);lines("#guide-title span",[d.section_title_line1,d.section_title_line2],s);html(".story-copy>p:not(.eyebrow)",d.section_body,s);txt(".story-copy>strong",d.section_tagline,s);attr("img","src",d.section_image_src,s);attr("img","alt",d.section_image_alt,s);if(!Array.isArray(d.chapters))return;window.kzChapterData=d.chapters;qa("[data-chapter]").forEach(function(f){var x=d.chapters[Number(f.dataset.chapter)];if(!x)return;txt(".mobile-chapter-copy span",x.eyebrow,f);txt(".mobile-chapter-copy b",x.title,f);html(".mobile-chapter-copy p",x.mobile_text,f);attr("img","src",x.image_src,f);attr("img","alt",x.image_alt,f);});var x=d.chapters[0];if(x){txt("[data-chapter-eyebrow]",x.eyebrow);txt("[data-chapter-title]",x.title);html("[data-chapter-text]",x.text);txt("[data-chapter-index]","01 / "+String(d.chapters.length).padStart(2,"0"));}}
  function applyGrip(d){if(!d)return;var s=q("#grip");txt(".eyebrow",d.eyebrow,s);txt("#grip-title",d.title,s);html(".story-copy>p:not(.eyebrow)",d.body,s);qa(".detail-list span",s).forEach(function(el,i){var x=d.features&&d.features[i];if(!x)return;var b=q("b",el);if(b)b.textContent=x.title;var temp=document.createElement("div");temp.innerHTML=x.body||"";var plain=temp.textContent.trim();Array.from(el.childNodes).filter(function(n){return n!==b;}).forEach(function(n){n.remove();});el.appendChild(document.createTextNode(" "+plain));});attr("img","src",d.image_src,s);attr("img","alt",d.image_alt,s);}
  function applyReel(d){if(!d)return;var s=q("#reel");txt(".eyebrow",d.eyebrow,s);txt("#reel-title",d.title,s);var p=qa(".story-copy>p:not(.eyebrow)",s);if(p[0])htmlElement(p[0],d.body_1);if(p[1])htmlElement(p[1],d.body_2);txt("small",d.note,s);qa(".detail-list span",s).forEach(function(el,i){if(d.features&&d.features[i]!=null)el.textContent=d.features[i];});attr("img","src",d.image_src,s);attr("img","alt",d.image_alt,s);}
  function applyProof(d){if(!d)return;var s=q("#proof");txt(".eyebrow",d.eyebrow,s);txt("#proof-title",d.title,s);html(".proof-grid>div:first-child>p:not(.eyebrow)",d.body,s);var rows=qa(".metric-row",s);if(rows[0]){var sp=q("span",rows[0]);if(sp){sp.innerHTML="<b></b> "+(d.metric_1_body||"");q("b",sp).textContent=d.metric_1_title||"";}txt("strong",d.metric_1_value,rows[0]);}if(rows[1]){var sp2=q("span",rows[1]);if(sp2){sp2.innerHTML="<b></b> "+(d.metric_2_body||"");q("b",sp2).textContent=d.metric_2_title||"";}txt("strong",d.metric_2_value,rows[1]);}txt(".curve-heading",d.curve_heading,s);txt(".proof-disclosure",d.disclosure,s);}
  function applySpecifications(d){if(!d)return;var s=q("#specifications");txt(".eyebrow",d.eyebrow,s);lines("#specifications-title span",[d.title_line1,d.title_line2],s);html(".specifications-summary",d.summary,s);var list=q(".specifications-list",s);if(list&&Array.isArray(d.items)){list.innerHTML="";d.items.forEach(function(x){var div=document.createElement("div"),dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=x.label;dd.textContent=x.value;div.append(dt,dd);list.appendChild(div);});}html(".specifications-note",d.note,s);}
  function applyFounder(d){if(!d)return;var s=q("#founder"),i=q(".founder-intro",s);txt(".eyebrow",d.eyebrow,i);txt(".allocation-counter span",d.allocation_label,i);txt(".allocation-counter b",d.allocation_count,i);txt("#founder-title span",d.title,i);lines(".founder-subhead span",[d.subhead_line1,d.subhead_line2],i);var p=qa(":scope>p:not(.eyebrow)",i);if(p[0])htmlElement(p[0],d.body_1);if(p[1])htmlElement(p[1],d.body_2);txt(".text-link",d.cta_label,i);var dep=q("#founder-deposit",s);txt(".deposit-intro .eyebrow",d.deposit_eyebrow,dep);txt("#deposit-title span",d.deposit_title,dep);html(".deposit-intro>p:not(.eyebrow)",d.deposit_body,dep);var st=qa(".founder-payment-steps li",dep);[d.deposit_step_1,d.deposit_step_2,d.deposit_step_3].forEach(function(v,n){if(st[n]&&v){var num=q("span",st[n]);st[n].textContent=v;if(num)st[n].prepend(num);}});qa(".founder-payment-secure",dep).forEach(function(el){el.textContent=d.payment_secure_label||el.textContent;});var f=q(".founder-form",dep);if(f&&d.form_contact_email)f.action="mailto:"+d.form_contact_email+"?subject=Founder%20100%20allocation";html(".founder-collection>strong",d.closing_line,s);}
  function applyHalo(d){if(!d)return;var s=q("#halo");txt(".eyebrow",d.eyebrow,s);lines("#halo-title span",[d.title_line1,d.title_line2],s);html(".halo-copy>p:not(.eyebrow)",d.body,s);txt(".halo-copy>a",d.cta_label,s);attr(".halo-copy>a","href",d.cta_href,s);attr("img","src",d.image_src,s);attr("img","alt",d.image_alt,s);var u=q("#updates");txt(".eyebrow",d.updates_eyebrow,u);txt("#capture-title",d.updates_title,u);html(".capture-box>p:not(.eyebrow)",d.updates_body,u);txt("button[type='submit']",d.updates_cta_label,u);txt(".capture-box>small",d.updates_privacy_note,u);}
  function applyFooter(d){if(!d)return;var s=q(".site-footer");txt(".footer-brand strong",d.brand_name,s);txt(".footer-brand p",d.brand_tagline,s);txt(".footer-bottom",d.copyright,s);attr('.footer-links a[href^="mailto:"]',"href","mailto:"+d.contact_email,s);}

  function applyAdvanced(d) {
    if (!d || d.enabled === false) return;
    window.KAIZURO_CMS_SETTINGS = d.javascript_settings || {};

    if (Array.isArray(d.css_variables)) {
      d.css_variables.forEach(function (item) {
        if (!item || !item.name) return;
        document.documentElement.style.setProperty(item.name, item.value == null ? "" : String(item.value));
      });
    }

    if (d.custom_css) {
      var style = document.getElementById("kaizuro-cms-custom-css") || document.createElement("style");
      style.id = "kaizuro-cms-custom-css";
      style.textContent = String(d.custom_css);
      if (!style.parentNode) document.head.appendChild(style);
    }

    if (Array.isArray(d.element_rules)) {
      d.element_rules.forEach(function (rule) {
        if (!rule || rule.enabled === false || !rule.selector || !rule.action) return;
        qa(rule.selector).forEach(function (el) {
          var value = rule.value == null ? "" : String(rule.value);
          var key = rule.attribute == null ? "" : String(rule.attribute);
          switch (rule.action) {
            case "text": el.textContent = value; break;
            case "html": el.innerHTML = value; break;
            case "attribute": if (key) el.setAttribute(key, value); break;
            case "remove_attribute": if (key) el.removeAttribute(key); break;
            case "class": el.className = value; break;
            case "add_class": if (value) value.split(/\s+/).forEach(function (c) { if (c) el.classList.add(c); }); break;
            case "remove_class": if (value) value.split(/\s+/).forEach(function (c) { if (c) el.classList.remove(c); }); break;
            case "style": if (key) el.style.setProperty(key, value); break;
            case "visibility":
              if (value === "hidden" || value === "false" || value === "0") { el.hidden = true; el.style.display = "none"; }
              else { el.hidden = false; el.style.removeProperty("display"); }
              break;
            case "remove": el.remove(); break;
          }
        });
      });
    }

    if (d.custom_javascript) {
      try {
        Function("window", "document", "settings", '"use strict";\n' + String(d.custom_javascript))(window, document, window.KAIZURO_CMS_SETTINGS);
      } catch (error) {
        console.error("[CMS] Custom JavaScript failed", error);
      }
    }
  }

  var handlers={site:applySite,hero:applyHero,story:applyStory,assault:applyAssault,principles:applyPrinciples,engineering:applyEngineering,grip:applyGrip,reel:applyReel,proof:applyProof,specifications:applySpecifications,founder:applyFounder,halo:applyHalo,footer:applyFooter};
  Promise.all(Object.keys(handlers).map(function(n){return load(n).then(function(d){if(d)handlers[n](d);});})).then(function(){
    return load("advanced").then(function(d){applyAdvanced(d);window.dispatchEvent(new CustomEvent("kaizuro:content-loaded",{detail:{advanced:d}}));});
  });
})();

/** Pages CMS removed. Static HTML is now the production source of truth. */
(function () {
  "use strict";

  function protectGripDesign() {
    const grip = document.getElementById("grip");
    if (!grip || grip.dataset.publicGripProtected === "true") return;

    grip.dataset.publicGripProtected = "true";
    grip.removeAttribute("aria-labelledby");
    grip.setAttribute("aria-label", "KAIZURO grip benefits");

    const storyCopy = grip.querySelector(".story-copy");
    const handleFigure = grip.querySelector(".sticky-image");

    if (storyCopy) {
      storyCopy.innerHTML = `
        <div class="kaizuro-grip-benefits" role="group" aria-label="KAIZURO grip benefits">
          <div class="kaizuro-grip-benefit">
            <strong>Longer usable leverage</strong>
            <span>Supports changing hand positions through the fight.</span>
          </div>
          <div class="kaizuro-grip-benefit">
            <strong>Indexed orientation</strong>
            <span>Provides a tactile reference without looking at the grip.</span>
          </div>
          <div class="kaizuro-grip-benefit">
            <strong>Controlled transitions</strong>
            <span>Rounded corners retain comfort while preserving the faceted form.</span>
          </div>
        </div>
      `;
    }

    if (handleFigure) handleFigure.remove();

    if (!document.getElementById("kaizuro-public-grip-protection")) {
      const style = document.createElement("style");
      style.id = "kaizuro-public-grip-protection";
      style.textContent = `
        #grip[data-public-grip-protected="true"] {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          grid-template-columns: none !important;
          width: 100% !important;
          min-height: clamp(430px, 45vw, 650px) !important;
          padding: clamp(72px, 8vw, 120px) clamp(28px, 6vw, 92px) !important;
          overflow: hidden !important;
          background: #000 !important;
          box-sizing: border-box !important;
        }

        #grip[data-public-grip-protected="true"] > .story-copy {
          display: block !important;
          width: min(100%, 760px) !important;
          max-width: 760px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          align-self: center !important;
        }

        #grip[data-public-grip-protected="true"] .kaizuro-grip-benefits {
          width: 100%;
          border-top: 1px solid rgba(255,255,255,.22);
        }

        #grip[data-public-grip-protected="true"] .kaizuro-grip-benefit {
          display: grid;
          gap: 8px;
          padding: 26px 0 27px;
          border-bottom: 1px solid rgba(255,255,255,.22);
        }

        #grip[data-public-grip-protected="true"] .kaizuro-grip-benefit strong {
          margin: 0 !important;
          color: rgba(244,244,242,.76) !important;
          font-family: Inter, Arial, sans-serif !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
          letter-spacing: .105em !important;
          text-transform: uppercase !important;
        }

        #grip[data-public-grip-protected="true"] .kaizuro-grip-benefit span {
          color: rgba(244,244,242,.68) !important;
          font-family: Inter, Arial, sans-serif !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: 1.35 !important;
          letter-spacing: .12em !important;
          text-transform: uppercase !important;
        }

        @media (max-width: 1100px) {
          #grip[data-public-grip-protected="true"] {
            display: flex !important;
            width: 100% !important;
            height: auto !important;
            min-height: 480px !important;
            padding: 72px var(--tablet-gutter, 42px) !important;
          }

          #grip[data-public-grip-protected="true"] > .story-copy {
            grid-column: auto !important;
            grid-row: auto !important;
            order: initial !important;
            width: min(100%, 760px) !important;
            padding: 0 !important;
          }
        }

        @media (min-width: 641px) and (max-width: 1100px) and (orientation: portrait) {
          html body main #grip[data-public-grip-protected="true"] {
            display: flex !important;
            grid-template-columns: none !important;
            grid-template-rows: none !important;
            width: calc(100% - (var(--tablet-gutter) * 2)) !important;
            height: auto !important;
            min-height: 560px !important;
            margin-inline: auto !important;
            padding: 74px 0 !important;
            overflow: visible !important;
          }

          html body main #grip[data-public-grip-protected="true"] > .story-copy {
            grid-column: auto !important;
            grid-row: auto !important;
            align-self: center !important;
            width: min(100%, 760px) !important;
            padding: 0 !important;
          }
        }

        @media (max-width: 640px) {
          #grip[data-public-grip-protected="true"] {
            min-height: 390px !important;
            padding: 54px 24px !important;
          }

          #grip[data-public-grip-protected="true"] .kaizuro-grip-benefit {
            gap: 7px;
            padding: 22px 0 23px;
          }

          #grip[data-public-grip-protected="true"] .kaizuro-grip-benefit strong {
            font-size: 14px !important;
            letter-spacing: .09em !important;
          }

          #grip[data-public-grip-protected="true"] .kaizuro-grip-benefit span {
            font-size: 10px !important;
            line-height: 1.45 !important;
            letter-spacing: .105em !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function cleanFounderPositioning() {
    const founder = document.getElementById("founder");
    if (!founder || founder.dataset.priorityMode === "true") return;
    founder.dataset.priorityMode = "true";

    const intro = founder.querySelector(".founder-intro");
    if (intro) {
      const eyebrow = intro.querySelector(".eyebrow");
      const counter = intro.querySelector(".allocation-counter");
      const title = intro.querySelector("h2");
      const subhead = intro.querySelector(".founder-subhead");
      const paragraphs = intro.querySelectorAll(":scope > p:not(.eyebrow)");
      const cta = intro.querySelector(".text-link");

      if (eyebrow) eyebrow.textContent = "Founder 100 Priority Access";
      if (counter) counter.innerHTML = "<span>Founder 100</span><b>100 priority positions planned worldwide</b>";
      if (title) title.innerHTML = "<span>The first 100.</span>";
      if (subhead) subhead.innerHTML = "<span>Register early.</span><span>Access first.</span>";
      if (paragraphs[0]) paragraphs[0].textContent = "Founder 100 is KAIZURO’s planned first production release. Registering your interest places you on the priority list for development updates and first-access information when final validation and manufacturing timing are confirmed.";
      if (paragraphs[1]) paragraphs[1].textContent = "Registration is free and non-binding. No payment is required, no rod is currently allocated, and no production date is being promised at this stage.";
      if (cta) cta.textContent = "Register for Founder 100 priority";
    }

    const collection = founder.querySelector(".founder-collection");
    if (collection) {
      const eyebrow = collection.querySelector(".eyebrow");
      const heading = collection.querySelector("h3");
      const introCopy = collection.querySelector("div > p:not(.eyebrow)");
      const close = collection.querySelector(":scope > strong");
      if (eyebrow) eyebrow.textContent = "Planned Founder 100 benefits";
      if (heading) heading.textContent = "Founder Collection";
      if (introCopy) introCopy.textContent = "The Founder 100 ownership package is planned for the first production release and remains subject to final production confirmation.";
      if (close) close.textContent = "Founder 100 is planned to be limited to the first 100 production positions when ordering officially opens.";
    }

    const roadmap = founder.querySelector(".founder-roadmap");
    if (roadmap) {
      const eyebrow = roadmap.querySelector(".eyebrow");
      const heading = roadmap.querySelector("h3");
      const introCopy = roadmap.querySelector("div > p:not(.eyebrow)");
      const steps = roadmap.querySelectorAll(".production-roadmap li");
      if (eyebrow) eyebrow.textContent = "Path to Founder 100";
      if (heading) heading.textContent = "From interest to first delivery.";
      if (introCopy) introCopy.textContent = "The next steps move from registered interest through validation, production opening and final delivery.";
      if (steps[0]) steps[0].innerHTML = "<span>01</span><strong>Interest registered</strong><p>Your preferred KAIZURO model and contact details are recorded.</p>";
      if (steps[1]) steps[1].innerHTML = "<span>02</span><strong>Design validated</strong><p>Final component, load, recovery and real-world testing is completed.</p>";
      if (steps[2]) steps[2].innerHTML = "<span>03</span><strong>Founder ordering opens</strong><p>Registered customers receive first-access information when production is ready.</p>";
      if (steps[3]) steps[3].innerHTML = "<span>04</span><strong>Manufacturing begins</strong><p>The confirmed first production run enters controlled manufacture.</p>";
      if (steps[4]) steps[4].innerHTML = "<span>05</span><strong>Founder delivery</strong><p>Numbered Founder rods and ownership packages are prepared and dispatched.</p>";
    }

    const terms = document.getElementById("terms");
    if (terms) {
      const eyebrow = terms.querySelector(".eyebrow");
      const heading = terms.querySelector("h2");
      const list = terms.querySelector(".terms-list");
      if (eyebrow) eyebrow.textContent = "Founder 100 Registration";
      if (heading) heading.textContent = "Clear before you register.";
      if (list) {
        list.innerHTML = `
          <details open>
            <summary>Does registering secure a rod?</summary>
            <p>No. Registration records your interest and gives you priority access to updates when Founder 100 ordering opens. It is not a purchase, deposit or guaranteed allocation.</p>
          </details>
          <details>
            <summary>Do I need to pay anything now?</summary>
            <p>No. Registering interest is free and non-binding. KAIZURO will contact registered customers before any payment is requested.</p>
          </details>
          <details>
            <summary>When will production open?</summary>
            <p>Production timing will be confirmed only after final prototype, component, load, recovery and real-world validation is complete.</p>
          </details>
          <details>
            <summary>What happens after I register?</summary>
            <p>You will receive KAIZURO development updates and first-access information for Founder 100 when manufacturing and ordering are ready.</p>
          </details>
        `;
      }
    }

    document.querySelectorAll('a[href="#founder-deposit"]').forEach((link) => {
      if (/secure|allocation|deposit|reserve/i.test(link.textContent)) {
        link.textContent = "Register your interest";
      }
    });
  }

  function updateFounderInterest() {
    const founderDeposit = document.getElementById("founder-deposit");
    if (!founderDeposit || founderDeposit.dataset.interestMode === "true") return;

    founderDeposit.dataset.interestMode = "true";
    founderDeposit.innerHTML = `
      <div class="deposit-intro">
        <p class="eyebrow">Founder access.</p>
        <h3 id="deposit-title"><span>Register your interest.</span></h3>
        <p>
          Choose your preferred KAIZURO rod and submit your details below. No payment is required.
          This is a priority access expression of interest only. Founder 100 members will be contacted
          first when final validation and production timing are confirmed.
        </p>

        <ol class="founder-payment-steps" aria-label="Founder interest process">
          <li><span>1</span>Choose your rod</li>
          <li><span>2</span>Register interest</li>
          <li><span>3</span>Submit details</li>
        </ol>

        <div class="founder-payment-grid founder-interest-grid" aria-label="Founder interest options">
          ${interestCard("PE4-6", "PE4-6", "Register PE4-6 interest")}
          ${interestCard("ASSAULT", "PE6-8", "Register ASSAULT interest", true)}
          ${interestCard("HALO", "PE10-12", "Register HALO interest")}
        </div>
      </div>

      <form
        class="founder-form founder-interest-form"
        action="mailto:info@kaizuro.com?subject=KAIZURO%20Founder%20Interest"
        method="post"
        enctype="text/plain"
      >
        <label>
          Full name
          <input type="text" name="Full name" autocomplete="name" required>
        </label>

        <label>
          Email address
          <input type="email" name="Email" autocomplete="email" required>
        </label>

        <label>
          Country
          <input type="text" name="Country" autocomplete="country-name" required>
        </label>

        <label>
          Preferred model
          <select name="Preferred model" required>
            <option value="">Select your preferred model</option>
            <option>PE4-6</option>
            <option>ASSAULT PE6-8</option>
            <option>HALO PE10-12</option>
          </select>
        </label>

        <label>
          Quantity
          <select name="Quantity" required>
            <option value="">Select quantity</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4+</option>
          </select>
        </label>

        <label>
          Target species
          <select name="Target species">
            <option value="">Select target species</option>
            <option>GT</option>
            <option>Tuna</option>
            <option>Kingfish</option>
            <option>Dogtooth Tuna</option>
            <option>Other large pelagics</option>
          </select>
        </label>

        <label class="form-wide">
          Message
          <textarea name="Message" rows="4" placeholder="Tell us anything else that helps us understand your interest..."></textarea>
        </label>

        <button class="founder-submit form-wide" type="submit">Submit interest</button>

        <p class="founder-interest-note form-wide">
          Expressions of interest are non-binding and do not guarantee final allocation.
          Founder 100 priority members will receive first access when production opens.
        </p>
      </form>
    `;

    founderDeposit.querySelectorAll("[data-interest-model]").forEach((button) => {
      button.addEventListener("click", function () {
        const select = founderDeposit.querySelector('select[name="Preferred model"]');
        if (!select) return;
        select.value = button.dataset.interestModel;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        select.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => select.focus({ preventScroll: true }), 450);
      });
    });

    if (!document.getElementById("kaizuro-founder-interest-style")) {
      const style = document.createElement("style");
      style.id = "kaizuro-founder-interest-style";
      style.textContent = `
        #founder-deposit[data-interest-mode="true"] .founder-interest-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }

        #founder-deposit[data-interest-mode="true"] .founder-payment-card__visual {
          display: none !important;
        }

        #founder-deposit[data-interest-mode="true"] .founder-payment-card__content {
          display: flex !important;
          flex-direction: column !important;
          min-height: 330px;
        }

        #founder-deposit[data-interest-mode="true"] .founder-payment-card[data-lead-model="true"] {
          border-color: rgba(255,255,255,.5);
        }

        #founder-deposit[data-interest-mode="true"] .founder-payment-card dl {
          display: grid;
          grid-template-rows: none !important;
          gap: 0;
          margin: 0 0 24px;
        }

        #founder-deposit[data-interest-mode="true"] .founder-payment-card dl > div {
          min-height: 54px;
          padding: 14px 0;
        }

        #founder-deposit[data-interest-mode="true"] .founder-payment-card dt {
          margin: 0;
          color: rgba(255,255,255,.76);
          font-size: 12px;
          letter-spacing: .02em;
          text-transform: none;
        }

        #founder-deposit[data-interest-mode="true"] .founder-payment-button--graphene {
          margin-top: auto;
          cursor: pointer;
        }

        #founder-deposit[data-interest-mode="true"] .founder-form::before {
          content: "Interest details" !important;
        }

        #founder-deposit[data-interest-mode="true"] .founder-interest-note {
          margin: -4px 0 0;
          color: rgba(255,255,255,.52);
          font-size: 11px;
          line-height: 1.55;
        }

        @media (max-width: 1000px) {
          #founder-deposit[data-interest-mode="true"] .founder-interest-grid {
            grid-template-columns: 1fr !important;
          }

          #founder-deposit[data-interest-mode="true"] .founder-payment-card__content {
            min-height: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function interestCard(name, pe, buttonText, isLead = false) {
    const model = name === "PE4-6" ? "PE4-6" : `${name} ${pe}`;
    const title = name === "PE4-6"
      ? `<span>PE4-6</span>`
      : `<span>${name}</span><small>${pe}</small>`;

    return `
      <article class="founder-payment-card"${isLead ? ' data-lead-model="true"' : ""}>
        <div class="founder-payment-card__content">
          <h4 class="founder-payment-title">${title}</h4>
          <p class="founder-payment-kicker">Founder Interest</p>
          <dl>
            <div><dt>Priority access open</dt></div>
            <div><dt>No payment required</dt></div>
            <div><dt>Register your preference</dt></div>
          </dl>
          <button
            type="button"
            class="founder-payment-button founder-payment-button--graphene"
            data-interest-model="${model}"
          >
            <span>${buttonText}</span><span aria-hidden="true">→</span>
          </button>
        </div>
      </article>
    `;
  }

  protectGripDesign();
  cleanFounderPositioning();
  updateFounderInterest();

  window.setTimeout(function () {
    protectGripDesign();
    cleanFounderPositioning();
    updateFounderInterest();
    window.dispatchEvent(new CustomEvent("kaizuro:content-loaded", { detail: { cms: false } }));
  }, 0);
})();

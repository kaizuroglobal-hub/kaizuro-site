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

  function updateFounderInterest() {
    const founderDeposit = document.getElementById("founder-deposit");
    if (!founderDeposit || founderDeposit.dataset.interestMode === "true") return;

    founderDeposit.dataset.interestMode = "true";
    founderDeposit.innerHTML = `
      <div class="deposit-intro">
        <p class="eyebrow">Founder access.</p>
        <h3 id="deposit-title"><span>Register your interest.</span></h3>
        <p>
          Choose your preferred rod and submit your details below. No payment is required.
          This is a priority access expression of interest only. Founder 100 members will be
          contacted first when final validation and production timing are confirmed.
        </p>

        <ol class="founder-payment-steps" aria-label="Founder interest process">
          <li><span>1</span>Choose your rod</li>
          <li><span>2</span>Register interest</li>
          <li><span>3</span>Submit details</li>
        </ol>

        <div class="founder-payment-grid founder-interest-grid" aria-label="Founder interest options">
          ${interestCard("PE4-6", "PE4-6", "Register PE4-6 interest")}
          ${interestCard("ASSAULT", "PE6-8", "Register ASSAULT interest")}
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

        #founder-deposit[data-interest-mode="true"] .founder-payment-card__content {
          display: flex !important;
          flex-direction: column !important;
          min-height: 360px;
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

  function interestCard(name, pe, buttonText) {
    const model = name === "PE4-6" ? "PE4-6" : `${name} ${pe}`;
    const title = name === "PE4-6"
      ? `<span>PE4-6</span>`
      : `<span>${name}</span><small>${pe}</small>`;

    return `
      <article class="founder-payment-card">
        <div class="founder-payment-card__visual" aria-hidden="true"></div>
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
  updateFounderInterest();

  window.setTimeout(function () {
    protectGripDesign();
    updateFounderInterest();
    window.dispatchEvent(new CustomEvent("kaizuro:content-loaded", { detail: { cms: false } }));
  }, 0);
})();

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

  protectGripDesign();

  window.setTimeout(function () {
    protectGripDesign();
    window.dispatchEvent(new CustomEvent("kaizuro:content-loaded", { detail: { cms: false } }));
  }, 0);
})();

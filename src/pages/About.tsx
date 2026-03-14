import React, { useEffect } from "react";
import { Layout } from "../components/Layout";
import { useDisguise } from "../hooks/useDisguise";

type AboutProps = {
  isDark: boolean;
  onToggleTheme: (nextDark: boolean) => void;
};

export default function AboutPage({ isDark, onToggleTheme }: AboutProps) {
  const baseIcon =
    (document.querySelector('link[rel*="icon"]') as HTMLLinkElement | null)?.href ||
    "/img/gams-g.png";
  useDisguise("About - LearningArcade", baseIcon);

  useEffect(() => {
    const existing = document.querySelector("script[data-about-secrets='true']");
    if (existing) return;

    const loadSecrets = () => {
      const present = document.querySelector("script[data-about-secrets='true']");
      if (present) return;
      const script = document.createElement("script");
      script.src = "/assets/about-secrets.js";
      script.defer = true;
      script.dataset.aboutSecrets = "true";
      document.body.appendChild(script);
      window.removeEventListener("keydown", loadSecrets);
      window.removeEventListener("click", loadSecrets);
      window.removeEventListener("pointerdown", loadSecrets);
    };

    window.addEventListener("keydown", loadSecrets, { once: true });
    window.addEventListener("click", loadSecrets, { once: true });
    window.addEventListener("pointerdown", loadSecrets, { once: true });
  }, []);

  return (
    <Layout
      title="About"
      subtitle="Why LearningArcade exists and how it works"
      showControls
      isDark={isDark}
      onToggleTheme={onToggleTheme}
    >
      <div className="grid gap-6">
        <section className="glass-panel px-6 py-5">
          <h3 className="section-title">What is LearningArcade?</h3>
          <p className="mt-3 text-sm text-textSecondary">
            LearningArcade is a curated collection of games you can play in
            school-friendly environments. It focuses on quick access, clean
            navigation, and a mix of educational and classic titles.
          </p>
          <p className="mt-2 text-sm text-textSecondary">
            Instead of chasing the most heavyweight, internet-dependent setups,
            the goal is to keep the experience smooth, even when connectivity is
            limited.
          </p>
        </section>

        <section className="glass-panel px-6 py-5">
          <h3 className="section-title">Why choose LearningArcade?</h3>
          <ul className="mt-3 list-disc pl-5 text-sm text-textSecondary">
            <li>Simple design: focus on games, not clutter.</li>
            <li>Unique selection: a mix you won't find in every collection.</li>
            <li>Easy to use: fast loading and clear categories.</li>
            <li>Dark mode: easier on the eyes for long sessions.</li>
          </ul>
        </section>

        <section className="glass-panel px-6 py-5">
          <h3 className="section-title">How does it work?</h3>
          <p className="mt-3 text-sm text-textSecondary">
            Games usually rely on online resources, which can be blocked or slow
            in school networks. LearningArcade keeps things lightweight by
            bundling assets and streamlining how games are loaded.
          </p>
        </section>

        <section className="glass-panel px-6 py-5">
          <h3 className="section-title">Additional notes</h3>
          <ul className="mt-3 list-disc pl-5 text-sm text-textSecondary">
            <li>Recommended game: Drive Mad is a must-try.</li>
            <li>Updates land regularly with fresh picks.</li>
            <li>
              Quality matters: every game here is handpicked for fun and
              stability.
            </li>
            <li>Ruffle makes Flash classics playable in modern browsers.</li>
            <li>
              Mine, all mine: LearningArcade is{" "}
              <span title="*I'm great*" id="mine">
                mine
              </span>
              , the project, not the games.
            </li>
          </ul>
        </section>

        <section className="glass-panel px-6 py-5">
          <h3 className="section-title">Credits</h3>
          <ul className="mt-3 list-disc pl-5 text-sm text-textSecondary">
            <li>Forked by w00pxrr</li>
            <li>Original creator: mountain658</li>
            <li>Thanks to Jacob Kern and Alec Ponce for contributions.</li>
          </ul>
          <div className="mt-4 text-sm text-textSecondary">
            <p>This site uses Ruffle to emulate Flash content.</p>
            <input
              type="password"
              onInput={(event) => {
                const target = event.currentTarget;
                const value = target.value;
                target.value = "";
                const fn = (window as unknown as { keyComboActive?: (key: string) => void })
                  .keyComboActive;
                if (fn) fn(value);
              }}
              className="mt-3 w-full rounded-xl border border-panelBorder bg-[var(--gams-bg)] px-4 py-3 text-sm text-textSecondary"
              placeholder="Enter passcode"
            />
          </div>
        </section>
      </div>
    </Layout>
  );
}

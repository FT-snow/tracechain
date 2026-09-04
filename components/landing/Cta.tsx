import Reveal from "./Reveal";

export default function Cta() {
  return (
    <section id="cta" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-5 py-32 text-center md:px-8">
        <Reveal>
          <h2 className="text-5xl font-bold text-text-primary md:text-6xl">
            Start
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
            Submit a wallet address and get a court-ready report in minutes.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="/trace" className="btn-primary px-7 py-3.5">
              Trace
            </a>
            <a href="/trace" className="btn-ghost px-7 py-3.5">
              View the trace
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

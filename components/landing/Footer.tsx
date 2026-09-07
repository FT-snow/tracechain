import Reveal from "./Reveal";

const productLinks = ["Trace", "Live Watch", "Reports", "Correlations", "Heatmap"];
const resourcesLinks = ["Docs", "Blockchain basics", "API", "Chain status", "GitHub"];
const companyLinks = ["About", "Contact", "Careers", "Privacy", "Terms"];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Reveal className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <a href="#" className="text-lg font-bold tracking-tight text-text-primary">
              TraceChain
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              Real-time identification of fraud-linked crypto exchanges for law-enforcement teams.
            </p>
          </div>

          <div>
            <div className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-muted">Product</div>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l}>
                  <a href="#" className="text-[15px] text-text-secondary transition-colors hover:text-text-primary">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-muted">Resources</div>
            <ul className="space-y-2.5">
              {resourcesLinks.map((l) => (
                <li key={l}>
                  <a href="#" className="text-[15px] text-text-secondary transition-colors hover:text-text-primary">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-muted">Company</div>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l}>
                  <a href="#" className="text-[15px] text-text-secondary transition-colors hover:text-text-primary">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="mono text-xs text-text-muted">
            © {new Date().getFullYear()} TraceChain · For law-enforcement use
          </p>
          <p className="mono text-xs text-text-muted">
            BTC · ETH · BSC · USDT-TRC20
          </p>
        </div>
      </Reveal>
    </footer>
  );
}

export function Footer() {
  return (
    <footer style={{ background: "#070F20" }} className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.pabsec.org/frontend/img/logo@2x_en.gif"
              alt="PABSEC"
              className="h-7 w-auto object-contain opacity-70"
            />
            <div className="text-white/40 text-xs leading-tight">
              Parliamentary Assembly of the<br />Black Sea Economic Cooperation
            </div>
          </div>
          <p className="text-white/25 text-xs text-center sm:text-right">
            © {new Date().getFullYear()} PABSEC. All rights reserved.<br />
            <a
              href="https://www.pabsec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
            >
              www.pabsec.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

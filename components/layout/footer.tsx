export function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-center">
        <p>
          © {new Date().getFullYear()} PABSEC – Parliamentary Assembly of the Black Sea Economic
          Cooperation. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import logo from "../assets/logo/logo.webp";

export const Navbar = () => {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 bg-[#F9F8F6]/85 backdrop-blur-md border-b-2 border-[#121212]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
          <div className="flex flex-col leading-none">
           <img src={logo} alt="TrendyPrompts Logo" className="w-64 h-auto" />
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {!isAdmin ? (
            <Link
              to="/admin"
              data-testid="nav-admin-link"
              className="hidden sm:inline-flex pp-chip"
            >
              Admin
            </Link>
          ) : (
            <Link to="/" data-testid="nav-back-home" className="pp-chip">
              ← Back to library
            </Link>
          )}
          {/*
            NOTE: there is no real "submit your own prompt" feature/backend
            yet (the original build, no user auth, public read-only +
            admin curation). The original button linked out to emergent.sh,
            which made no sense for a published app — replaced here with a
            mailto link as a safe default. Swap href for a real submission
            form/route if you build that feature later.
          */}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdb1Pf4bCBVU3E6aexpgPySB9XSo2SzK8o4PZjs4IPIuYmWsA/viewform?usp=header"
            data-testid="nav-cta"
            className="inline-flex items-center gap-2 bg-[#121212] text-white font-semibold border-2 border-[#121212] rounded-full px-4 py-2 pp-shadow-sm pp-press hover:bg-[#fe6416] hover:text-[#121212] transition-colors text-sm"
          >
            Drop a prompt
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

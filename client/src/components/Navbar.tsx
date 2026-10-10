import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, LogOut, Menu, X, Sparkles, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../lib/auth';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    // Small delay so the animation is visible before navigating away
    await new Promise((res) => setTimeout(res, 600));
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
    setSigningOut(false);
  };

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-border shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-obsidian min-h-[44px]">
            <div className="rounded-xl bg-rose-50 p-2 text-rose-500">
              <Heart className="h-5 w-5 fill-rose-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base sm:text-lg tracking-tight leading-none">
                WeddingPlatform<span className="text-gold-600">.lk</span>
              </span>
              <span className="text-[10px] text-slate-400 font-sans tracking-wide">
                Sri Lanka's Luxury Invites
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors min-h-[44px] inline-flex items-center ${
                isCurrent('/') ? 'text-gold-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Templates
            </Link>

            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors min-h-[44px] inline-flex items-center ${
                isCurrent('/contact') ? 'text-gold-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-1.5 ${
                    isCurrent('/dashboard') ? 'text-gold-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`text-sm font-semibold transition-colors min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl ${
                      isCurrent('/admin')
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/70 border border-amber-200'
                    }`}
                  >
                    <Shield className="h-4 w-4 text-gold-600" />
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">
                    {user?.brideName} & {user?.groomName}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={signingOut}
                    className={`p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center
                      ${signingOut
                        ? 'text-rose-500 bg-rose-50 scale-90'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    aria-label="Logout"
                  >
                    <LogOut className={`h-4 w-4 ${signingOut ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-900 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-2xs min-h-[44px] inline-flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition-colors min-h-[44px] inline-flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Actions Header (Always visible buttons on phone) */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800 min-h-[44px] flex items-center shadow-2xs"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 min-h-[44px] flex items-center shadow-2xs"
              >
                Log In
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in fade-in duration-150">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-sand-100 min-h-[44px]"
          >
            Explore Templates
          </Link>

          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-sand-100 min-h-[44px]"
          >
            Contact Details
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gold-600 bg-sand-50 min-h-[44px]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Couple Dashboard
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 min-h-[44px]"
                >
                  <Shield className="h-4 w-4 text-gold-600" />
                  Admin Panel
                </Link>
              )}
              <div className="pt-2 border-t border-slate-100">
                <div className="px-3 py-2 text-xs text-slate-500">
                  Signed in as: <strong className="text-slate-800">{user?.brideName} & {user?.groomName}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={signingOut}
                  className={`relative flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium min-h-[44px] overflow-hidden transition-all duration-200
                    ${signingOut
                      ? 'bg-rose-50 text-rose-600 scale-[0.97]'
                      : 'text-rose-600 hover:bg-rose-50 active:scale-[0.97]'
                    }`}
                >
                  {/* Ripple background on active */}
                  {signingOut && (
                    <span className="absolute inset-0 bg-rose-100 animate-pulse rounded-xl" />
                  )}
                  <LogOut className={`relative h-4 w-4 transition-transform ${signingOut ? 'animate-spin' : ''}`} />
                  <span className="relative">
                    {signingOut ? 'Signing out…' : 'Sign Out'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-sand-50 min-h-[44px]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-charcoal shadow-xs min-h-[44px]"
              >
                <Sparkles className="h-4 w-4 text-gold-400" />
                Create Wedding Invitation
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

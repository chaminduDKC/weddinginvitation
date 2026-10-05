import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ClipboardList, Users, Layers, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/auth';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin/templates', icon: Layers, label: 'Templates' },
    { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  const getPageTitle = () => {
    if (location.pathname.includes('/admin/templates')) return 'Template Management';
    if (location.pathname.includes('/admin/orders')) return 'Orders Management';
    if (location.pathname.includes('/admin/users')) return 'User Management';
    return 'Admin Panel';
  };

  const userName = user?.brideName 
    ? `${user.brideName}${user.groomName ? ` & ${user.groomName}` : ''}`
    : user?.email || 'Admin';

  const userInitial = user?.brideName?.[0] || user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <div className="flex h-dvh bg-bg overflow-hidden">
      {/* Mobile Drawer Backdrop & Drawer */}
      <div 
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
          onClick={() => setMobileMenuOpen(false)} 
        />
        <div 
          className={`fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-2xl transition-transform duration-300 ease-in-out z-10 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-indigo-50 p-1.5">
                <Heart className="h-5 w-5 text-accent" />
              </div>
              <span className="text-lg font-bold text-text-main">Wedding Admin</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile in Drawer */}
          <div className="p-4 border-b border-border bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-main truncate">{userName}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-1 flex-col px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Navigation</p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-accent/10 text-accent font-semibold'
                        : 'text-text-secondary hover:bg-slate-50 hover:text-text-main'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5 shrink-0" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Drawer Footer with Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors min-h-[44px]"
            >
              <LogOut className="mr-3 h-5 w-5 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-surface border-r border-border z-20">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
          <div className="rounded-lg bg-indigo-50 p-1.5 mr-2.5">
            <Heart className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xl font-bold text-text-main">Wedding Admin</span>
        </div>
        
        <div className="p-4 border-b border-border bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-main truncate">{userName}</p>
              <p className="text-[11px] text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col px-4 py-4 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Menu</p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text-secondary hover:bg-slate-50 hover:text-text-main'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 shrink-0" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64 overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 sm:h-16 shrink-0 items-center gap-x-3 border-b border-border bg-surface px-3 sm:px-6 lg:px-8 justify-between shadow-2xs z-10">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <Heart className="h-5 w-5 text-accent shrink-0" />
              <span className="font-bold text-sm text-text-main truncate max-w-[160px] sm:max-w-none">
                {getPageTitle()}
              </span>
            </div>
            <span className="hidden md:block font-bold text-lg text-slate-900">
              {getPageTitle()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-text-main">
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                ADMIN
              </span>
              <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (Visible only on mobile) */}
        <nav 
          aria-label="Mobile Bottom Navigation" 
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around h-16 px-4 shadow-lg pb-safe"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                    isActive
                      ? 'text-accent font-semibold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span className="text-[11px] font-medium tracking-tight">{link.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Menu className="h-5 w-5 mb-0.5" />
            <span className="text-[11px] font-medium tracking-tight">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};


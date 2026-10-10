import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, ArrowRight, ShieldCheck, Smartphone, Users, Languages, Check, Clock } from 'lucide-react';
import { fetchTemplates, fetchUserOrders } from '../lib/api';
import { CatalogSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../lib/auth';

export const HomePage: React.FC = () => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['public-templates'],
    queryFn: fetchTemplates,
  });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: userOrders } = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
    enabled: isAuthenticated,
  });

  const handleSelectTemplate = (templateId: string) => {
    if (!isAuthenticated) {
      navigate('/register');
    } else {
      navigate(`/upload-slip/${templateId}`);
    }
  };

  return (
    <div className="min-h-screen-dvh flex flex-col bg-sand-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-100 border border-gold-400/30 text-gold-600 text-xs font-semibold">
            Sri Lanka's Modern Wedding Invitation Platform
          </div>

          <h1 className="text-fluid-display font-serif font-bold text-obsidian tracking-tight max-w-3xl mx-auto leading-tight">
            Cinematic Digital Wedding Invitations for Your Special Day
          </h1>

          <p className="text-fluid-body text-slate-600 max-w-xl mx-auto leading-relaxed">
            Stunning full-screen interactive invitations with romantic background animations, Google Maps navigation, RSVP, and seamless WhatsApp guest sharing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="#templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm shadow-xs transition-colors min-h-[44px]"
            >
              Browse Invitation Designs
              <ArrowRight className="h-4 w-4" />
            </a>
            {/* <Link
              to="/preview/eternal-noir"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm shadow-2xs transition-colors min-h-[44px]"
            >
              <Eye className="h-4 w-4 text-gold-600" />
              Live Full-Screen Sample
            </Link> */}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-2xs transition-colors min-h-[44px]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Value Badges */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-sand-50 rounded-xl border border-slate-100">
              <Smartphone className="h-5 w-5 text-gold-600 mb-1.5" />
              <h4 className="text-xs font-bold text-obsidian">Mobile & WhatsApp First</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Optimized for phones & in-app browsers</p>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-slate-100">
              <Users className="h-5 w-5 text-gold-600 mb-1.5" />
              <h4 className="text-xs font-bold text-obsidian">Guest Management</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Bulk paste & track sent invites</p>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-slate-100">
              <Languages className="h-5 w-5 text-gold-600 mb-1.5" />
              <h4 className="text-xs font-bold text-obsidian">Bilingual Invitations</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Sinhala & English invitations</p>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-slate-100">
              <ShieldCheck className="h-5 w-5 text-gold-600 mb-1.5" />
              <h4 className="text-xs font-bold text-obsidian">Secure & Unguessable</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Private personalized token links</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Catalog */}
      <section id="templates" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">Handcrafted Catalog</span>
          <h2 className="text-fluid-h1 font-serif font-bold text-obsidian">
            Select Your Wedding Invitation Template
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            All designs include RSVP collection, countdown clock, photo archive, and instant WhatsApp links.
          </p>
        </div>

        {isLoading ? (
          <CatalogSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {templates?.map((tpl) => {
              const matchingOrders = isAuthenticated
                ? userOrders?.filter((o) => (o.templateId === tpl.id || o.template?.key === tpl.key)) || []
                : [];
              const isApproved = matchingOrders.some((o) => o.status === 'APPROVED');
              const isPending = !isApproved && matchingOrders.some((o) => o.status === 'PENDING');
              const isBought = isApproved;

              return (
                <div
                  key={tpl.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-card transition-all flex flex-col justify-between"
                >
                  {/* Image Thumbnail with Overlay Preview Button */}
                  <div className="relative aspect-4/5 overflow-hidden bg-slate-100">
                    <img
                      src={tpl.thumbnailUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
                      alt={tpl.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {isApproved && (
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Purchased</span>
                      </div>
                    )}
                    {isPending && (
                      <div className="absolute top-3 left-3 bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Pending Approval</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xs font-semibold text-white bg-black/40 px-2.5 py-1 rounded-full">
                        {isApproved ? 'Owned Theme' : isPending ? 'Pending Approval' : `Rs. ${tpl.priceLkr.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                    {/* Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              tpl.key === 'modern-minimalist'
                                ? 'bg-stone-100 text-stone-700 border-stone-200'
                                : tpl.key === 'tropical-bliss'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : tpl.key === 'classic-floral'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : tpl.key === 'royal-vintage'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            {tpl.key === 'modern-minimalist' && 'Basic Tier'}
                            {tpl.key === 'tropical-bliss' && 'Standard Tier'}
                            {tpl.key === 'classic-floral' && 'Deluxe Tier'}
                            {tpl.key === 'royal-vintage' && 'Premium Tier'}
                            {tpl.key === 'eternal-noir' && 'Ultra-Luxury Tier'}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-serif font-bold text-obsidian group-hover:text-gold-600 transition-colors">
                          {tpl.name}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {tpl.description || 'Full-page luxury digital wedding invitation template.'}
                        </p>

                        <div className="pt-1 text-[11px] text-slate-500 font-medium">
                          {tpl.key === 'modern-minimalist' && '✓ Essential Details • Maps • Clean Countdown'}
                          {tpl.key === 'tropical-bliss' && '✓ Island Itinerary • Dress Code • Acoustic Audio'}
                          {tpl.key === 'classic-floral' && '✓ Love Story • Photo Gallery • Romantic Audio'}
                          {tpl.key === 'royal-vintage' && '✓ Wax Monogram Seal • Bridal Entourage • Banquet Schedule'}
                          {tpl.key === 'eternal-noir' && '✓ Full Luxury Suite • Celestial Lotus Seal • Photo Archive'}
                        </div>
                      </div>

                      {/* Actions (Customize & Preview + Sample) */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        to={`/customize/${tpl.key}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
                      >
                        {isPending ? (
                          <>
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            <span>Pending Approval • Customize</span>
                          </>
                        ) : (
                          <>
                            <span>{isBought ? 'Customize Details' : 'Customize & Preview'}</span>
                          </>
                        )}
                      </Link>
                     
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8 px-4 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-4">
          <Link to="/contact" className="text-slate-500 hover:text-gold-600 font-medium transition-colors">
            Contact & Support
          </Link>
          <span>•</span>
          <Link to="/" className="text-slate-500 hover:text-gold-600 font-medium transition-colors">
            Wedding Templates
          </Link>
        </div>
        <p>© {new Date().getFullYear()} WeddingPlatform.lk. Handcrafted for Sri Lankan Weddings.</p>
      </footer>
    </div>
  );
};

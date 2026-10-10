import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Code2,
  Sparkles,
  ExternalLink,
  Heart,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { fetchContactDetails } from '../lib/api';
import LOGOCODELOOM from '../../public/codeloom.jpeg'

export const ContactPage: React.FC = () => {
  const { data: contact, isLoading, error } = useQuery({
    queryKey: ['contact-details'],
    queryFn: fetchContactDetails,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="min-h-screen-dvh bg-sand-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* Header Breadcrumb & Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200/60 border border-gold-400/30 text-gold-700 text-xs font-semibold tracking-wide uppercase">
            <Heart className="h-3.5 w-3.5 fill-gold-600 text-gold-600" />
            <span>Concierge & Support</span>
          </div>

          <h1 className="text-fluid-h1 font-serif font-bold text-obsidian tracking-tight">
            Get in Touch With Us
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {isLoading
              ? 'Loading contact details...'
              : contact?.description ||
                'Have questions about our templates, custom invitations, or order approval? We are here to help you every step of the way.'}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white/70 rounded-2xl border border-slate-200" />
            ))}
          </div>
        )}

        {/* Error Fallback */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-center">
            Unable to load live contact details. Please try again later or reach us directly.
          </div>
        )}

        {/* Main Contact Channels */}
        {contact && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone Support */}
            

            {/* WhatsApp Concierge */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-obsidian">WhatsApp Concierge</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quick message & slip confirmation</p>
                </div>
                <p className="font-mono font-semibold text-sm text-obsidian pt-1">
                  {contact.whatsapp || contact.phone}
                </p>
              </div>

              <a
                href={
                  contact.socialLinks?.whatsapp ||
                  `https://wa.me/${(contact.whatsapp || contact.phone).replace(/[^0-9]/g, '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors min-h-[44px]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Email Support */}
            
          </div>
        )}

        {/* Operating Hours & Location Strip */}
        {contact && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-sand-100 flex items-center justify-center text-gold-600 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Operating Hours
                </span>
                <p className="text-xs sm:text-sm font-semibold text-obsidian mt-0.5">
                  {contact.businessHours || 'Monday – Saturday: 9:00 AM – 7:00 PM (IST)'}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-sand-100 flex items-center justify-center text-gold-600 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Location & Operations
                </span>
                <p className="text-xs sm:text-sm font-semibold text-obsidian mt-0.5">
                  {contact.address || 'Colombo, Sri Lanka'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Developed By Highlight Card */}
        {contact?.developedBy && (
          <div className="bg-gradient-to-br from-white via-sand-50/60 to-sand-100/40 rounded-2xl border border-gold-300/40 p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-gold-400 flex items-center justify-center shrink-0 shadow-xs">
                  <img src={LOGOCODELOOM} className='w-12 h-12' />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase font-bold text-gold-600 tracking-wider">
                      Development & Engineering
                    </span>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-gold-100 text-gold-800 font-semibold">
                      Creator
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-obsidian mt-0.5">
                    {contact.developedBy.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {contact.developedBy.role}
                  </p>
                </div>
              </div>

              {/* {contact.developedBy.website && (
                <a
                  href={contact.developedBy.website}
                  
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto min-h-[44px]"
                >
                  <span>Visit Developer</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gold-400" />
                </a>
              )} */}
            </div>

            {contact.developedBy.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {contact.developedBy.description}
              </p>
            )}
          </div>
        )}

        {/* Support Notice / Concierge Card */}
        {contact?.supportNotice && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {contact.supportNotice}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 min-h-[40px] transition-colors"
            >
              <span>Explore Templates</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border pt-8 text-center text-xs text-slate-400 space-y-1">
        <p>© {new Date().getFullYear()} {contact?.companyName || 'WeddingPlatform.lk'}. All rights reserved.</p>
        <p>Handcrafted for Sri Lankan Weddings.</p>
      </footer>
    </div>
  );
};
export default ContactPage;

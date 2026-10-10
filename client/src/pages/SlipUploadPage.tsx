import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  Building2,
  AlertCircle,
  FileCheck,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { fetchTemplate, submitOrder, saveInvitation, fetchBankDetails } from '../lib/api';
import { compressPaymentSlip, CompressionResult } from '../lib/compress';

export const SlipUploadPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId,
  });

  const { data: bankDetails, isLoading: bankDetailsLoading } = useQuery({
    queryKey: ['bank-details'],
    queryFn: fetchBankDetails,
  });

  const [compressing, setCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Read draft customization
  const draftCustomization = (() => {
    try {
      const saved = localStorage.getItem('wedding_preview_customization');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setCompressing(true);
    setCompressProgress(10);

    try {
      const result = await compressPaymentSlip(file, (p) => setCompressProgress(Math.round(p)));
      setCompressedResult(result);
    } catch (err: any) {
      setError('Could not process this image. Please select another image.');
    } finally {
      setCompressing(false);
      setCompressProgress(100);
    }
  };

  const handleUploadSubmit = async () => {
    if (!compressedResult || !templateId) return;

    setUploading(true);
    setUploadProgress(10);
    setError('');

    try {
      await submitOrder(templateId, compressedResult.file, (progress) => {
        setUploadProgress(progress);
      });

      await queryClient.invalidateQueries({ queryKey: ['user-orders'] });

      // Also persist the customized invitation details so they appear after admin approval
      if (draftCustomization) {
        try {
          await saveInvitation({
            templateId,
            venue: draftCustomization.venue || 'Grand Ballroom, Colombo',
            eventDate: draftCustomization.eventDate || new Date().toISOString(),
            heroImageUrl: draftCustomization.heroImageUrl || undefined,
            galleryImages: draftCustomization.galleryImages || undefined,
            storyText: draftCustomization.storyText || undefined,
            mapUrl: draftCustomization.mapUrl || undefined,
            brideName: draftCustomization.brideName || undefined,
            groomName: draftCustomization.groomName || undefined,
          });
        } catch (saveErr) {
          console.error('Failed to sync invitation customization:', saveErr);
        }
      }

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to upload payment slip. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen-dvh bg-sand-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-obsidian transition-colors min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Template Catalog
        </Link>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-fluid-h1 font-serif font-bold text-obsidian tracking-tight">
            Confirm Template Purchase
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Transfer the package fee and upload your bank deposit or online transfer slip.
          </p>
        </div>

        {/* Template Overview Card */}
        {template && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase text-gold-600 tracking-wider">Selected Package</span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-obsidian mt-0.5">{template.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Full interactive invitation + guest management access</p>
            </div>
            <div className="text-right">
              <span className="text-lg sm:text-xl font-bold text-obsidian">Rs. {template.priceLkr.toLocaleString()}</span>
              <span className="block text-[11px] text-slate-400">One-time payment</span>
            </div>
          </div>
        )}

       

        {/* Bank Account Instructions */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-obsidian">
            <Building2 className="h-5 w-5 text-gold-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Bank Transfer Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {bankDetails?.accounts && bankDetails.accounts.length > 0 ? (
              bankDetails.accounts.map((acc, idx) => (
                <div key={idx} className="p-3 bg-sand-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {acc.label || (idx === 0 ? 'Primary Bank' : 'Alternative Bank')}
                  </span>
                  <p className="font-semibold text-obsidian mt-0.5">{acc.bankName}</p>
                  <span className="text-[11px] text-slate-400 font-medium block mt-2">Account Number</span>
                  <p className="font-mono font-bold text-obsidian text-sm">{acc.accountNumber}</p>
                  {acc.accountName && (
                    <>
                      <span className="text-[11px] text-slate-400 font-medium block mt-2">Account Name</span>
                      <p className="font-semibold text-obsidian">{acc.accountName}</p>
                    </>
                  )}
                  {acc.branch && (
                    <>
                      <span className="text-[11px] text-slate-400 font-medium block mt-2">Branch</span>
                      <p className="font-semibold text-obsidian">{acc.branch}</p>
                    </>
                  )}
                </div>
              ))
            ) : bankDetailsLoading ? (
              <div className="col-span-full py-4 text-center text-xs text-slate-400 animate-pulse">
                Loading bank transfer details...
              </div>
            ) : (
              <div className="col-span-full py-4 text-center text-xs text-slate-400">
                No bank accounts available at this time.
              </div>
            )}
          </div>

          {bankDetails?.note && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{bankDetails.note}</span>
            </div>
          )}
        </div>

        {/* Upload Form Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-obsidian">Upload Payment Receipt</h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* File Picker / Drag Drop area */}
          {!compressedResult ? (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-gold-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-sand-50/40 min-h-[160px]">
                <UploadCloud className="h-10 w-10 text-gold-600 mb-2" />
                <span className="text-sm font-semibold text-obsidian">
                  Tap to select payment slip or screenshot
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Choose from Photos, Files, or take a picture (JPG, PNG, WebP)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={compressing}
                />
              </label>

              {/* Mobile friendly explicit buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-sand-50/60 hover:bg-sand-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors min-h-[44px]">
                  <ImageIcon className="h-4 w-4 text-gold-600" />
                  <span>Choose from Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={compressing}
                  />
                </label>

                <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-sand-50/60 hover:bg-sand-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors min-h-[44px]">
                  <Camera className="h-4 w-4 text-gold-600" />
                  <span>Take with Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={compressing}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview and Stats */}
              <div className="p-4 bg-sand-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={compressedResult.previewUrl}
                  alt="Payment Slip Preview"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-xl bg-white border border-slate-200 shrink-0"
                />
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <FileCheck className="h-3.5 w-3.5" />
                    Receipt Optimized
                  </div>
                  <h4 className="text-sm font-bold text-obsidian">{compressedResult.file.name}</h4>
                  <p className="text-xs text-slate-500">
                    Original: <strong className="text-slate-700">{compressedResult.originalSizeMb} MB</strong> → Compressed:{' '}
                    <strong className="text-emerald-700">{compressedResult.compressedSizeMb} MB</strong>
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                    <label className="font-semibold text-gold-600 hover:text-gold-700 cursor-pointer">
                      Choose different photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-300">•</span>
                    <label className="font-semibold text-gold-600 hover:text-gold-700 cursor-pointer flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-gold-600" />
                      Take photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compression Progress */}
          {compressing && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Compressing photo for fast upload...</span>
                <span>{compressProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gold-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${compressProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Transmitting slip to server...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-charcoal h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          {compressedResult && !uploading && (
            <button
              onClick={handleUploadSubmit}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-black text-white py-3.5 px-4 text-sm font-semibold shadow-xs transition-colors min-h-[44px]"
            >
              <CheckCircle2 className="h-4 w-4 text-gold-400" />
              Submit Payment Slip for Verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

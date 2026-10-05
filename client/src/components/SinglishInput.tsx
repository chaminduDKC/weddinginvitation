import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { singlishToSinhala, containsSinhala } from '../lib/singlishConverter';

interface SinglishInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isSinhalaMode: boolean;
  placeholder?: string;
  required?: boolean;
  isTextarea?: boolean;
  rows?: number;
  helperText?: string;
  icon?: React.ReactNode;
}

/**
 * An intelligent Input / Textarea component that supports real-time
 * Singlish (Romanized Sinhala) to Sinhala Unicode transliteration.
 */
export const SinglishInput: React.FC<SinglishInputProps> = ({
  id,
  label,
  value,
  onChange,
  isSinhalaMode,
  placeholder,
  required = false,
  isTextarea = false,
  rows = 3,
  helperText,
  icon,
}) => {
  // Local toggle to allow user to temporarily turn off Singlish typing in this input
  const [singlishActive, setSinglishActive] = useState(true);
  const [justConverted, setJustConverted] = useState(false);

  // Checks if current field has pending unconverted English characters
  const hasUnconvertedEnglish =
    isSinhalaMode &&
    singlishActive &&
    Boolean(value && /[a-zA-Z]/.test(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const rawVal = e.target.value;

    if (!isSinhalaMode || !singlishActive) {
      onChange(rawVal);
      return;
    }

    // If the change includes a word delimiter (space, comma, punctuation, newline),
    // convert the completed word immediately to Sinhala!
    const endsWithDelimiter = /[\s,.:;!?'"()\[\]\n]$/.test(rawVal);
    const pastedMultiple = rawVal.length - value.length > 2;

    if (endsWithDelimiter || pastedMultiple) {
      const converted = singlishToSinhala(rawVal);
      onChange(converted);
    } else {
      // While typing the active word, allow typing and convert on delimiter or blur
      onChange(rawVal);
    }
  };

  const handleBlur = () => {
    if (isSinhalaMode && singlishActive && value) {
      const converted = singlishToSinhala(value);
      if (converted !== value) {
        onChange(converted);
      }
    }
  };

  const handleManualConvert = () => {
    if (value) {
      const converted = singlishToSinhala(value);
      onChange(converted);
      setJustConverted(true);
      setTimeout(() => setJustConverted(false), 1500);
    }
  };

  // Preview what the current input will look like when converted
  const previewText = hasUnconvertedEnglish ? singlishToSinhala(value) : null;

  return (
    <div className="space-y-1.5">
      {/* Label and Singlish Indicator */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        {isSinhalaMode && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSinglishActive(!singlishActive)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                singlishActive
                  ? 'bg-amber-100/90 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:text-slate-700'
              }`}
              title={
                singlishActive
                  ? 'Singlish auto-conversion is ON (converts to Sinhala). Click to toggle OFF.'
                  : 'Singlish auto-conversion is OFF. Click to toggle ON.'
              }
            >
              <Sparkles className="h-2.5 w-2.5" />
              <span>{singlishActive ? 'Singlish: ON' : 'English: Raw'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Field Container */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        {isTextarea ? (
          <textarea
            id={id}
            rows={rows}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-xl border border-slate-300 p-3 text-base sm:text-sm focus:border-gold-500 focus:outline-none min-h-[44px] leading-relaxed ${
              icon ? 'pl-9' : ''
            } ${isSinhalaMode ? 'font-sinhala text-[15px]' : ''}`}
          />
        ) : (
          <input
            id={id}
            type="text"
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-xl border border-slate-300 py-2.5 pr-10 text-base sm:text-sm focus:border-gold-500 focus:outline-none min-h-[44px] ${
              icon ? 'pl-9' : 'px-3.5'
            } ${isSinhalaMode ? 'font-sinhala text-[15px]' : ''}`}
          />
        )}

        {/* Quick Convert Button on input right side */}
        {isSinhalaMode && hasUnconvertedEnglish && !isTextarea && (
          <button
            type="button"
            onClick={handleManualConvert}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            title="Convert to Sinhala immediately"
          >
            {justConverted ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span className="font-sinhala text-xs">සිං</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Live Transliteration Preview (Shown while typing English in Sinhala mode) */}
      {previewText && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/70 border border-amber-100 text-[11px] text-amber-900">
          <span className="text-amber-600 font-medium">සිංහල:</span>
          <span className="font-sinhala font-semibold">{previewText}</span>
          <span className="text-slate-400 text-[10px] ml-auto">
            (Press Space or leave box to apply)
          </span>
        </div>
      )}

      {/* Optional Helper Text */}
      {helperText && (
        <span className="text-[11px] text-slate-400 block pt-0.5">{helperText}</span>
      )}
    </div>
  );
};

export default SinglishInput;

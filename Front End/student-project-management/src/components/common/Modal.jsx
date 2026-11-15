import React, { useEffect } from 'react';
import { X, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  badge,
  type
}) => {
  const lowerTitle = (title || '').toLowerCase();
  const isNoticeModal =
    type === 'notice' ||
    type === 'error' ||
    type === 'success' ||
    badge !== undefined ||
    lowerTitle.includes('error') ||
    lowerTitle.includes('failed') ||
    lowerTitle.includes('success') ||
    lowerTitle.includes('notice') ||
    lowerTitle.includes('api response');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      if (!isNoticeModal) {
        document.body.style.overflow = 'hidden';
      }
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isNoticeModal]);

  if (!isOpen) return null;

  const isSuccess = lowerTitle.includes('success') && !lowerTitle.includes('error') && !lowerTitle.includes('failed');

  if (isNoticeModal) {
    const badgeText = badge || (isSuccess ? 'SUCCESS RESPONSE' : 'API RESPONSE');
    const displayTitle = title || (isSuccess ? 'Operation Successful' : 'Validation Failed');

    return (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto max-w-2xl w-[calc(100%-2rem)] sm:w-full font-sans animate-scale-up">
        {/* Professional Full-Width Glassmorphic Toast Card - Top Centered */}
        <div
          className={`relative transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md text-left shadow-2xl shadow-slate-900/15 transition-all w-full border border-l-4 ${
            isSuccess
              ? 'border-emerald-200/90 border-l-emerald-500 shadow-emerald-500/10'
              : 'border-rose-200/90 border-l-rose-500 shadow-rose-500/10'
          } p-5 sm:p-6 font-sans z-10`}
        >
          {/* Top Header Row: Icon, Title/Badge, and OK/Close Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            {/* Left Status Icon & Title */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                  isSuccess
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 ring-4 ring-emerald-500/10'
                    : 'bg-rose-50 border-rose-100 text-rose-600 ring-4 ring-rose-500/10'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>

              <div className="min-w-0 font-sans">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5 font-sans mb-0.5 ${
                    isSuccess
                      ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-700'
                      : 'bg-rose-50 border border-rose-200/80 text-rose-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {badgeText}
                </span>

                <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight font-sans truncate">
                  {displayTitle}
                </h4>
              </div>
            </div>

            {/* Right Action Buttons: Gradient OK Pill Button & Close X */}
            <div className="flex items-center gap-2 shrink-0 font-sans">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-1.5 font-black text-xs rounded-full shadow-md transition-all cursor-pointer font-sans uppercase tracking-wider active:scale-95 ${
                  isSuccess
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-600/25'
                    : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/25'
                }`}
              >
                OK
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full-Width Body: Message & Validation Errors Details Block */}
          <div
            className={`mt-3 w-full font-sans text-xs sm:text-sm [&_.flex.justify-end]:hidden [&_div]:w-full ${
              isSuccess
                ? '[&_p]:text-emerald-700 [&_p]:font-semibold'
                : '[&_p]:text-rose-600 [&_p]:font-semibold'
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Standard Form Modal (for dialogs like Change Password)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all w-full ${maxWidth} border border-gray-100 animate-scale-up z-10`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

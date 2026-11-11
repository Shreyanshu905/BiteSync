import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { QrCode, CheckCircle2, AlertOctagon, KeyRound, RefreshCw, X } from 'lucide-react';

const ScannerCamera = ({ initialToken, onCollectedSuccess, onClose }) => {
  const [manualToken, setManualToken] = useState(initialToken || '');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // If an initial token was provided, auto-fill it
    if (initialToken) {
      setManualToken(initialToken);
    }

    // Initialize html5-qrcode scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        handleVerification({ qrData: decodedText });
      },
      (error) => {
        // Ignore frame scan errors
      }
    );

    scannerRef.current = scanner;

    return () => {
      try {
        scanner.clear();
      } catch (err) {
        // cleanup error
      }
    };
  }, [initialToken]);

  const handleVerification = async (payload) => {
    if (loading) return;
    setLoading(true);
    setErrorBanner(null);
    setVerificationResult(null);

    try {
      const res = await api.post('/orders/verify-pickup', payload);
      if (res.data.success) {
        setVerificationResult(res.data.data);
        toast.success(res.data.message);

        // Celebration confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (onCollectedSuccess) {
          onCollectedSuccess(res.data.data);
        }
      }
    } catch (err) {
      const resp = err.response?.data;
      const errorMsg = resp?.message || 'Verification failed. Invalid token or QR.';
      setErrorBanner({
        message: errorMsg,
        isDuplicate: resp?.isDuplicate || false,
        data: resp?.data,
      });
      toast.error(errorMsg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast.error('Please enter a pickup token');
      return;
    }
    handleVerification({ pickupToken: manualToken.trim().toUpperCase() });
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden max-w-lg w-full mx-auto">
      {/* Header */}
      <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-brand-400" />
          <h3 className="font-bold text-sm">Canteen QR & Token Verification</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Error / Duplicate Scan Banner */}
        {errorBanner && (
          <div
            className={`p-4 rounded-2xl border text-sm flex items-start gap-3 animate-in shake duration-200 ${
              errorBanner.isDuplicate
                ? 'bg-red-50 border-red-300 text-red-900 ring-2 ring-red-200'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{errorBanner.message}</p>
              {errorBanner.data && (
                <p className="text-xs mt-1 text-red-700">
                  Student: {errorBanner.data.student?.name} • Room: {errorBanner.data.hostelDetails?.roomNumber}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Collected Card */}
        {verificationResult && (
          <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 space-y-2 animate-in zoom-in-95">
            <div className="flex items-center gap-2 font-black text-base text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>COLLECTED & VERIFIED SUCCESSFULLY!</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
              <p className="font-bold text-stone-900">
                Order #{verificationResult.orderNumber} (Token: {verificationResult.pickupToken})
              </p>
              <p className="text-stone-700">
                Student: <span className="font-semibold">{verificationResult.student?.name}</span> ({verificationResult.student?.studentId})
              </p>
              <p className="text-stone-700">
                Hostel: {verificationResult.hostelDetails?.hostelName} - {verificationResult.hostelDetails?.roomNumber}
              </p>
              <div className="pt-2 border-t border-emerald-200 mt-2 font-medium">
                Items: {verificationResult.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* HTML5 Camera QR Scanner Target */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Camera QR Code Scanner
          </p>
          <div
            id="qr-reader-container"
            className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50"
          ></div>
        </div>

        {/* Fallback Manual Token Input */}
        <div className="pt-4 border-t border-stone-100">
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-stone-400" />
              Manual Token Fallback
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. TK-7A9B"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={loading || !manualToken.trim()}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Verify & Handover'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScannerCamera;


import React from 'react';
import { Link } from 'react-router-dom';
import ScannerCamera from '../../components/kitchen/ScannerCamera';
import { ArrowLeft, ShieldCheck, QrCode } from 'lucide-react';

const KitchenScannerPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/kitchen/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Kitchen Queue
        </Link>
        <span className="text-xs font-bold text-stone-500">
          Counter Handover Terminal
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Scan Student QR Pass 📷
        </h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Point the camera at the student's mobile screen or enter their 4-character pickup token.
        </p>
      </div>

      <ScannerCamera />
    </div>
  );
};

export default KitchenScannerPage;

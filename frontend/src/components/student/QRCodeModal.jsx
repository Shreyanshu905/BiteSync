import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-100 text-center relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Pickup Pass
        </div>

        <h3 className="text-xl font-extrabold text-stone-900">
          Order #{order.orderNumber}
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Present this at the canteen counter for collection
        </p>

        {/* Pickup Token Card */}
        <div className="my-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Counter Pickup Token
          </p>
          <div className="text-3xl font-mono font-black text-stone-900 tracking-widest mt-0.5">
            {order.pickupToken}
          </div>
          <p className="text-[10px] text-amber-700 mt-1">
            Slot: {order.slotDisplay?.startTime} – {order.slotDisplay?.endTime} ({order.slotDisplay?.mealPeriod})
          </p>
        </div>

        {/* Scannable QR Code */}
        <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-stone-200 inline-block shadow-inner mx-auto my-1">
          <QRCodeSVG
            value={order.qrCodeData || order.pickupToken}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="mt-4 text-xs text-stone-500 space-y-1">
          <p className="font-medium text-stone-800">
            {order.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
          </p>
          <p className="text-[11px] text-stone-400">
            Each QR code is cryptographically signed and can only be collected once.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;

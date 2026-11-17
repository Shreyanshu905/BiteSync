const crypto = require('crypto');

const generateOrderNumber = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `BS-${randomNum}`;
};

const generatePickupToken = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous 0, 1, I, O
  let token = '';
  for (let i = 0; i < 4; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TK-${token}`;
};

const generateQRPayload = (orderId, orderNumber, pickupToken) => {
  const secret = process.env.QR_SECRET || 'bitesync-qr-secret-key-2026';
  const data = `${orderId}:${orderNumber}:${pickupToken}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 12);
  
  return JSON.stringify({
    orderId,
    orderNumber,
    pickupToken,
    sig: signature,
  });
};

const verifyQRPayload = (qrString) => {
  try {
    const parsed = typeof qrString === 'string' ? JSON.parse(qrString) : qrString;
    const { orderId, orderNumber, pickupToken, sig } = parsed;
    if (!orderId || !orderNumber || !pickupToken || !sig) {
      return { valid: false, message: 'Malformed QR code payload.' };
    }
    const secret = process.env.QR_SECRET || 'bitesync-qr-secret-key-2026';
    const data = `${orderId}:${orderNumber}:${pickupToken}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 12);
    
    if (sig !== expectedSig) {
      return { valid: false, message: 'Invalid or tampered QR code signature.' };
    }
    return { valid: true, payload: parsed };
  } catch (err) {
    return { valid: false, message: 'Failed to decode QR code data.' };
  }
};

module.exports = {
  generateOrderNumber,
  generatePickupToken,
  generateQRPayload,
  verifyQRPayload,
};


const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const {
  generateOrderNumber,
  generatePickupToken,
  generateQRPayload,
  verifyQRPayload,
} = require('../utils/tokenGenerator');

test('Token Generator creates valid format orderNumber and pickupToken', () => {
  const orderNumber = generateOrderNumber();
  assert.match(orderNumber, /^BS-\d{5}$/, 'Order number should match BS-XXXXX');

  const token = generatePickupToken();
  assert.match(token, /^TK-[2-9A-Z]{4}$/, 'Pickup token should match TK-XXXX');
});

test('QR Payload Signing and Verification', () => {
  const orderId = '654321098765432109876543';
  const orderNumber = 'BS-12345';
  const pickupToken = 'TK-ABCD';

  const qrString = generateQRPayload(orderId, orderNumber, pickupToken);
  assert.ok(typeof qrString === 'string', 'QR payload should be a string');

  const result = verifyQRPayload(qrString);
  assert.equal(result.valid, true, 'Verification should succeed for valid signed payload');
  assert.equal(result.payload.orderId, orderId);
  assert.equal(result.payload.orderNumber, orderNumber);
  assert.equal(result.payload.pickupToken, pickupToken);

  // Test tampered payload
  const tamperedPayload = JSON.stringify({
    orderId,
    orderNumber,
    pickupToken,
    sig: 'fake_signature_abc',
  });
  const tamperedResult = verifyQRPayload(tamperedPayload);
  assert.equal(tamperedResult.valid, false, 'Tampered QR code signature must fail verification');
});


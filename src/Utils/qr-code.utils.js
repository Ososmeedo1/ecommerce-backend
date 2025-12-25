import QRCode from 'qrcode';

export const makeQrCode = async (data) => {
  const qr = await QRCode.toDataURL([JSON.stringify(data)], {
    errorCorrectionLevel: "H"
  }); 
  return qr; 
}
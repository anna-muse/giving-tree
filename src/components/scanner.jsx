import { useEffect, useRef, useState } from 'react';
import { Scanner as CameraScanner } from '@yudiel/react-qr-scanner';

export function extractCode(text) { /* keep your existing function */ }

export default function Scanner({ onScan }) {
  const onScanRef = useRef(onScan);
  const last = useRef({ code: '', time: 0 });
  const [error, setError] = useState('');

  useEffect(() => { onScanRef.current = onScan; });

  function handleScan(detected) {
    const code = extractCode(detected[0]?.rawValue ?? '');
    const now = Date.now();
    if (!code || (code === last.current.code && now - last.current.time < 3000)) return; // ignore repeats
    last.current = { code, time: now };
    onScanRef.current(code);
  }

  return (
    <>
      {error && <p className="scan-error">{error}</p>}
      <CameraScanner
        formats={['qr_code']}
        constraints={{ facingMode: 'environment' }}
        scanDelay={300}
        components={{ torch: true, finder: true }}
        onScan={handleScan}
        onError={() => setError('Could not open the camera. Check that camera access is allowed for this site.')}
      />
    </>
  );
}
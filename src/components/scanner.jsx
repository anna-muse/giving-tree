import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

// A tag QR holds a link like https://site/?t=3f9a1c01. Pull out the code.
export function extractCode(text) {
  try {
    const code = new URL(text).searchParams.get('t');
    if (code) return code.trim().toLowerCase();
  } catch { /* not a URL */ }
  const raw = text.trim().toLowerCase();
  return /^[0-9a-f]{8}$/.test(raw) ? raw : null;
}

export default function Scanner({ onScan }) {
  const videoRef = useRef(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState('');

  useEffect(() => { onScanRef.current = onScan; });

  useEffect(() => {
    let active = true;
    const last = { code: '', time: 0 };
    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const code = extractCode(result.data);
        const now = Date.now();
        if (!code || (code === last.code && now - last.time < 3000)) return; // ignore repeats
        last.code = code;
        last.time = now;
        onScanRef.current(code);
      },
      { returnDetailedScanResult: true, preferredCamera: 'environment', highlightScanRegion: true, maxScansPerSecond: 5 }
    );
    scanner.start().catch(() => {
      if (active) setError('Could not open the camera. Check that camera access is allowed for this site.');
    });
    return () => { active = false; scanner.destroy(); };
  }, []);

  return (
    <>
      {error && <p className="scan-error">{error}</p>}
      <video ref={videoRef} className="scanner-video" muted playsInline />
    </>
  );
}

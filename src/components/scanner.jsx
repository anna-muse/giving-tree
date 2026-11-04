import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const ELEMENT_ID = 'qr-reader'; // Html5Qrcode draws its video into the element with this id (one scanner at a time)

// A tag QR holds a link like https://site/?t=g26a1b2c3d4&n=3-1B
//   t = the gift's ID (what the backend uses), n = the tag number (display only).
export function parseScan(text) {
  try {
    const params = new URL(text).searchParams;
    const code = params.get('t')?.trim().toLowerCase();
    if (code) return { code, tag: params.get('n')?.trim() || null };
  } catch { /* not a URL */ }
  const raw = text.trim().toLowerCase();
  return /^(g\d{2})?[0-9a-f]{8}$/.test(raw) ? { code: raw, tag: null } : null;
}

// Start and stop run one at a time. In development React mounts, unmounts and remounts
// components, and Html5Qrcode can't cope with start and stop calls that overlap.
let queue = Promise.resolve();
const enqueue = (task) => { queue = queue.then(task); }; // tasks handle their own errors

// Calls onScan(code, tag) for each new code. `tag` is null when the QR has no tag number.
export default function Scanner({ onScan }) {
  const onScanRef = useRef(onScan);
  const [error, setError] = useState('');

  useEffect(() => { onScanRef.current = onScan; });

  useEffect(() => {
    let active = true;
    let scanner = null;
    const last = { code: '', time: 0 };

    // The library calls this on every frame that contains a code, so ignore repeats.
    const handleDecode = (text) => {
      const scan = parseScan(text);
      const now = Date.now();
      if (!scan || (scan.code === last.code && now - last.time < 3000)) return;
      last.code = scan.code;
      last.time = now;
      onScanRef.current(scan.code, scan.tag);
    };

    enqueue(async () => {
      if (!active) return; // unmounted before its turn
      try {
        scanner = new Html5Qrcode(ELEMENT_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        // No qrbox: the whole frame is scanned, so there's no box to line the code up with.
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10 },
          handleDecode,
          () => {} // runs for every frame with no code in view; nothing to do
        );
      } catch {
        scanner = null;
        if (active) setError('Could not open the camera. Check that camera access is allowed for this site.');
      }
    });

    return () => {
      active = false;
      enqueue(async () => {
        if (!scanner) return;
        try {
          await scanner.stop();
          scanner.clear();
        } catch { /* already stopped */ }
      });
    };
  }, []);

  return (
    <>
      {error && <p className="scan-error">{error}</p>}
      <div id={ELEMENT_ID} className="scanner" />
    </>
  );
}
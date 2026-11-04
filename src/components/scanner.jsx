import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const ELEMENT_ID = 'qr-reader'; // Html5Qrcode draws its video into the element with this id (one scanner at a time)

// A tag QR holds a link like https://site/?t=g26a1b2c3d4. Pull out the tag ID.
export function extractTagId(text) {
  try {
    const tagId = new URL(text).searchParams.get('t');
    if (tagId) return tagId.trim().toLowerCase();
  } catch { /* not a URL */ }
  const raw = text.trim().toLowerCase();
  return /^(g\d{2})?[0-9a-f]{8}$/.test(raw) ? raw : null;
}

// Start and stop run one at a time. In development React mounts, unmounts and remounts
// components, and Html5Qrcode can't cope with start and stop calls that overlap.
let queue = Promise.resolve();
const enqueue = (task) => { queue = queue.then(task); }; // tasks handle their own errors

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
      const tagId = extractTagId(text);
      const now = Date.now();
      if (!tagId || (tagId === last.code && now - last.time < 3000)) return;
      last.code = tagId;
      last.time = now;
      onScanRef.current(tagId);
    };

    enqueue(async () => {
      if (!active) return; // unmounted before its turn
      try {
        scanner = new Html5Qrcode(ELEMENT_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (width, height) => {
              const side = Math.max(50, Math.floor(Math.min(width, height) * 0.7)); // the library rejects boxes under 50px
              return { width: side, height: side };
            },
          },
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
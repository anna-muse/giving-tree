import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const BUILD = 'scanner-2026-11-04-debug';
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

// Covers the box with the video: centers it and scales it up evenly until it fills the height.
// A CSS transform doesn't change the sizes the library measures, so decoding is unaffected.
function fitVideo(box) {
  const video = box?.querySelector('video');
  if (!video || !video.clientHeight) return;
  const scale = Math.max(1, box.clientHeight / video.clientHeight);
  Object.assign(video.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) scale(${scale})`,
  });
}

// Calls onScan(code, tag) for each new code. `tag` is null when the QR has no tag number.
// Calls onUnrecognized(text) when a QR code is read but isn't a tag link.
// Pass `fill` to make the video cover its box (the full-screen scanner). It is scaled up evenly,
// never stretched, so the decoder still sees the camera's true shape.
export default function Scanner({ onScan, onUnrecognized, fill = false }) {
  const onScanRef = useRef(onScan);
  const onUnrecognizedRef = useRef(onUnrecognized);
  const [error, setError] = useState('');
  const debugRef = useRef(null);
  // ?debug shows a live readout over the camera. ?zxing turns off the browser's built-in detector.
  const params = new URLSearchParams(window.location.search);
  const debug = params.has('debug');
  const forceZxing = params.has('zxing');

  useEffect(() => {
    onScanRef.current = onScan;
    onUnrecognizedRef.current = onUnrecognized;
  });

  useEffect(() => {
    let active = true;
    let scanner = null;
    let fit = null;
    const last = { code: '', time: 0 };
    const stats = { frames: 0, decoded: 0, last: '' };

    // The library calls this on every frame that contains a code, so ignore repeats.
    const handleDecode = (text) => {
      stats.decoded += 1;
      stats.last = `read: ${text.slice(0, 50)}`;
      const scan = parseScan(text);
      const key = scan ? scan.code : text;
      const now = Date.now();
      if (key === last.code && now - last.time < 3000) return;
      last.code = key;
      last.time = now;
      if (scan) onScanRef.current(scan.code, scan.tag);
      else onUnrecognizedRef.current?.(text);
    };

    let debugTimer = null;
    if (debug) {
      debugTimer = setInterval(() => {
        const box = document.getElementById(ELEMENT_ID);
        const video = box?.querySelector('video');
        if (!debugRef.current) return;
        debugRef.current.textContent = [
          BUILD,
          `BarcodeDetector: ${'BarcodeDetector' in window}${forceZxing ? ' (turned off)' : ''}`,
          `video ${video?.videoWidth}x${video?.videoHeight}, shown ${video?.clientWidth}x${video?.clientHeight}`,
          `box ${box?.clientWidth}x${box?.clientHeight}`,
          `frames without a code: ${stats.frames}`,
          `codes read: ${stats.decoded}`,
          stats.last,
        ].join('\n');
      }, 500);
    }

    enqueue(async () => {
      if (!active) return; // unmounted before its turn
      try {
        scanner = new Html5Qrcode(ELEMENT_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
          useBarCodeDetectorIfSupported: !forceZxing,
        });
        // No qrbox: the whole frame is scanned, so there's no box to line the code up with.
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10 },
          handleDecode,
          (message) => {
            // Runs for every frame with no code in view. Only counted for the debug readout.
            stats.frames += 1;
            if (stats.decoded === 0) stats.last = String(message).slice(0, 60);
          }
        );
        if (fill) {
          const box = document.getElementById(ELEMENT_ID);
          fit = () => fitVideo(box);
          const video = box?.querySelector('video');
          video?.addEventListener('loadedmetadata', fit);
          video?.addEventListener('playing', fit);
          window.addEventListener('resize', fit);
          fit();
        }
      } catch {
        scanner = null;
        if (active) setError('Could not open the camera. Check that camera access is allowed for this site.');
      }
    });

    return () => {
      active = false;
      clearInterval(debugTimer);
      if (fit) window.removeEventListener('resize', fit);
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
      {debug && <pre ref={debugRef} className="scan-debug" />}
    </>
  );
}
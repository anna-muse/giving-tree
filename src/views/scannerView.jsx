import { useEffect } from 'react';
import Scanner from '../components/scanner.jsx';

// Full-screen camera with a running list of scanned tag numbers underneath.
//   tags   - the scanned tags, each with an `id` and a `tagNumber`
//   flash  - a short notice to show, as { text, type } where type is 'success', 'info' or 'error'
//   onScan - called as onScan(tagId, tagNumber) for each new tag the camera sees
//   onUnrecognized - called with the text of a QR code that isn't a tag link
//   onDone - called when "Done Scanning" is tapped
export default function ScannerView({ tags, flash, onScan, onUnrecognized, onDone }) {
  // Stop the page behind the scanner from scrolling while it's open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  return (
    <div className="scan-screen">
      <Scanner onScan={onScan} onUnrecognized={onUnrecognized} fill />
      <div className="scan-panel">
        <div className="scan-header">
          <strong>{tags.length} {tags.length === 1 ? 'tag' : 'tags'} scanned</strong>
          {flash && <span className={`scan-flash ${flash.type}`}>{flash.text}</span>}
        </div>
        <ul className="scan-list">
          {[...tags].reverse().map((tag) => <li key={tag.id}>{tag.tagNumber}</li>)}
        </ul>
        <button type="button" className="primary" onClick={onDone}>
          Done Scanning
        </button>
      </div>
    </div>
  );
}
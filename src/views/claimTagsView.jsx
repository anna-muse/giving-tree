import { useEffect, useRef, useState } from 'react';
import { claimTags, getTag } from '../api.js';
import { Field } from '../components/field.jsx';
import ScannerView from './scannerView.jsx';
import { useStoredState } from '../useStoredState.js';

// A scanned tag starts out as { id, tagNumber, pending: true } and is replaced by the
// full gift from the backend once its details arrive.
const isPending = (tag) => tag.pending === true;

const blankDonor = { firstName: '', lastName: '', phone: '' };
const text = (value) => (value ?? '').trim();

export default function ClaimTagsView() {
  const [storedDonor, setDonor] = useStoredState('donor', blankDonor);
  const donor = { ...blankDonor, ...storedDonor }; // fills in any field an older saved copy is missing
  const [tags, setTags] = useStoredState('pending-tags', []);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState(null);     // short notice shown inside the scanner
  const [message, setMessage] = useState(null); // notice shown on the main page
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const inFlight = useRef(new Set()); // ids whose details are being fetched

  const setField = (field) => (value) => setDonor((d) => ({ ...d, [field]: value }));
  const ready = tags.filter((tag) => !isPending(tag));
  const loading = tags.some(isPending);

  // Called for each new tag the scanner sees. Its details are fetched in the background.
  function addScanned(tagId, tagNumber) {
    const label = tagNumber ?? tagId;
    if (tags.some((tag) => tag.id === tagId)) {
      setFlash({ text: `Already scanned ${label}`, type: 'info' });
      return;
    }
    navigator.vibrate?.(60);
    setTags((list) =>
      list.some((t) => t.id === tagId) ? list : [...list, { id: tagId, tagNumber: label, pending: true }]
    );
    setFlash({ text: `Added ${label}`, type: 'success' });
  }

  // Scanning a tag with the phone's camera app opens this page with ?t=<id>&n=<tag number>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagId = params.get('t')?.trim().toLowerCase();
    if (!tagId) return;
    window.history.replaceState(null, '', `${window.location.pathname}?page=take`);
    const tagNumber = params.get('n')?.trim() || tagId;
    setTags((list) =>
      list.some((t) => t.id === tagId) ? list : [...list, { id: tagId, tagNumber, pending: true }]
    );
  }, []);

  // Fetch details for each new tag in the background, even while the scanner is open.
  useEffect(() => {
    // A tag that can't be used is dropped, and the person is told right away.
    const drop = (tagId, text) => {
      setTags((list) => list.filter((t) => t.id !== tagId));
      setMessage((m) => ({ text: m ? `${m.text} ${text}` : text, type: 'error' }));
      setFlash({ text, type: 'error' });
    };

    tags.filter(isPending).forEach(({ id: tagId, tagNumber }) => {
      if (inFlight.current.has(tagId)) return; // already on its way
      inFlight.current.add(tagId);

      getTag(tagId)
        .then((gift) => {
          if (gift.status !== 'Needed') {
            drop(tagId, `Tag ${gift.tagNumber} has already been taken.`);
          } else {
            setTags((list) => list.map((t) => (t.id === tagId ? gift : t)));
          }
        })
        .catch((err) => drop(tagId, `Tag ${tagNumber}: ${err.message}`))
        .finally(() => inFlight.current.delete(tagId));
    });
  }, [tags]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), flash.type === 'error' ? 4000 : 2000);
    return () => clearTimeout(timer);
  }, [flash]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (ready.length === 0) {
      setMessage({ text: 'Scan at least one tag first.', type: 'error' });
      return;
    }
    setBusy(true);
    try {
      const response = await claimTags({
        donor: { firstName: text(donor.firstName), lastName: text(donor.lastName), phone: text(donor.phone) },
        codes: ready.map((tag) => tag.id),
      });
      setResult(response);
      setTags([]);
      setScanning(false);
      setMessage(null);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="card">
        <h1>Thank you!</h1>
        {result.claimed.length > 0 && (
          <>
            <p>You’re signed up for {result.claimed.length} {result.claimed.length === 1 ? 'gift' : 'gifts'}:</p>
            <ul>{result.claimed.map((c) => <li key={c.id}>Tag {c.tagNumber}</li>)}</ul>
            <p>Please bring each gift back with its tag attached.</p>
          </>
        )}
        {result.failed.length > 0 && (
          <p className="notice error">
            Someone else took these before you submitted: {result.failed.map((f) => f.tagNumber).join(', ')}.
          </p>
        )}
        <button type="button" onClick={() => setResult(null)}>Take more tags</button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>Take a Giving Tree Tag</h1>

        <fieldset>
          <legend>Your Info</legend>
          <Field label="First Name:" required value={donor.firstName} onChange={setField('firstName')} autoComplete="given-name" />
          <Field label="Last Name:" required value={donor.lastName} onChange={setField('lastName')} autoComplete="family-name" />
          <Field label="Phone:" type="tel" required value={donor.phone} onChange={setField('phone')} autoComplete="tel" />
        </fieldset>

        <fieldset>
          <legend>Your Tags ({ready.length})</legend>
          {ready.length === 0 && !loading && <p>No tags yet. Tap Scan Tags to add some.</p>}
          {loading && <p className="notice info">Loading tag details…</p>}
          {ready.map((tag) => (
            <div className="tag-card" key={tag.id}>
              <div>
                <strong>{tag.tagNumber}</strong>
                <p>Age: {tag.recipientAge} | Gender: {tag.recipientGender}</p>
                <p>{tag.item}</p>
              </div>
              <button type="button" onClick={() => setTags((list) => list.filter((x) => x.id !== tag.id))}>
                Remove
              </button>
            </div>
          ))}

          {message && <p className={`notice ${message.type}`}>{message.text}</p>}

          <button
            type="button"
            onClick={() => { setFlash(null); setMessage(null); setScanning(true); }}
          >
            Scan Tags
          </button>
        </fieldset>

        <button type="submit" disabled={busy || loading}>
          {busy ? 'Submitting…' : `Claim ${ready.length} ${ready.length === 1 ? 'tag' : 'tags'}`}
        </button>
      </form>

      {scanning && (
        <ScannerView
          tags={tags}
          flash={flash}
          onScan={addScanned}
          onUnrecognized={(text) => setFlash({ text: `Not a tag QR code: ${text.slice(0, 40)}`, type: 'error' })}
          onDone={() => setScanning(false)}
        />
      )}
    </>
  );
}
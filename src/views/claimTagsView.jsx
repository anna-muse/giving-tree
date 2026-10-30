import { useEffect, useState } from 'react';
import { claimTags, lookupTag } from '../api.js';
import { Field } from '../components/field.jsx';
import Scanner from '../components/scanner.jsx';
import { useStoredState } from '../useStoredState.js';

export default function ClaimTagsView() {
  const [donor, setDonor] = useStoredState('donor', { name: '', phone: '', email: '' });
  const [tags, setTags] = useStoredState('pending-tags', []);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (field) => (value) => setDonor((d) => ({ ...d, [field]: value }));

  async function claimTag(code) {
    if (tags.some((t) => t.code === code)) {
      setMessage({ text: 'You already scanned that tag.', type: 'info' });
      return;
    }
    try {
      const gift = await lookupTag(code);
      if (gift.status !== 'Needed') {
        setMessage({ text: `Tag ${gift.tag} has already been taken.`, type: 'error' });
        return;
      }
      const entry = { code: gift.code, tag: gift.tag, ageGender: gift.ageGender, item: gift.item };
      setTags((list) => (list.some((t) => t.code === entry.code) ? list : [...list, entry]));
      setMessage({ text: `Added tag ${gift.tag}.`, type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  // Scanning a tag with the phone's camera app opens this page with ?t=<code>
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('t');
    if (code) {
      claimTag(code.trim().toLowerCase());
      window.history.replaceState(null, '', `${window.location.pathname}?page=take`);
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (tags.length === 0) {
      setMessage({ text: 'Scan at least one tag first.', type: 'error' });
      return;
    }
    setBusy(true);
    try {
      const response = await claimTags({
        donor: { name: donor.name.trim(), phone: donor.phone.trim(), email: donor.email.trim() },
        codes: tags.map((t) => t.code),
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
            <ul>{result.claimed.map((c) => <li key={c.code}>Tag {c.tag}</li>)}</ul>
            <p>Please bring each gift back with its tag attached.</p>
          </>
        )}
        {result.failed.length > 0 && (
          <p className="notice error">
            Someone else took these before you submitted: {result.failed.map((f) => f.tag).join(', ')}.
          </p>
        )}
        <button type="button" onClick={() => setResult(null)}>Take more tags</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Take a Giving Tree Tag</h1>

      <fieldset>
        <legend>Your Info</legend>
        <Field label="Name:" required value={donor.name} onChange={setField('name')} autoComplete="name" />
        <Field label="Phone:" type="tel" value={donor.phone} onChange={setField('phone')} autoComplete="tel" />
        <Field label="Email:" type="email" required value={donor.email} onChange={setField('email')} autoComplete="email" />
      </fieldset>

      <fieldset>
        <legend>Your Tags ({tags.length})</legend>
        {tags.length === 0 && <p>No tags yet. Scan a tag to add it.</p>}
        {tags.map((t) => (
          <div className="tag-card" key={t.code}>
            <div>
              <strong>{t.tag}</strong>
              <p>{t.ageGender}</p>
              <p>{t.item}</p>
            </div>
            <button type="button" onClick={() => setTags((list) => list.filter((x) => x.code !== t.code))}>
              Remove
            </button>
          </div>
        ))}

        {message && <p className={`notice ${message.type}`}>{message.text}</p>}

        {scanning && <Scanner onScan={claimTag} />}
        <button type="button" onClick={() => setScanning((s) => !s)}>
          {scanning ? 'Close camera' : 'Scan a tag'}
        </button>
      </fieldset>

      <button type="submit" disabled={busy}>
        {busy ? 'Submitting…' : `Submit (${tags.length} ${tags.length === 1 ? 'tag' : 'tags'})`}
      </button>
    </form>
  );
}

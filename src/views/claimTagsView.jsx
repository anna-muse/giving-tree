import { useEffect, useState } from 'react';
import { claimTags, getTag } from '../api.js';
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

  async function claimTag(tagId) {
    if (tags.some((tag) => tag.id === tagId)) {
      setMessage({ text: 'You already scanned that tag.', type: 'info' });
      return;
    }
    try {
      const gift = await getTag(tagId);
      if (gift.status !== 'Needed') {
        setMessage({ text: `Tag ${gift.tagNumber} has already been taken.`, type: 'error' });
        return;
      }
      
      setTags((list) => (list.some((t) => t.id === gift.id) ? list : [...list, gift]));
      setMessage({ text: `Added tag ${gift.tagNumber}.`, type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  // Scanning a tag with the phone's camera app opens this page with ?t=<code>
  useEffect(() => {
    const tagId = new URLSearchParams(window.location.search).get('t');
    if (tagId) {
      claimTag(tagId.trim().toLowerCase());
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
        codes: tags.map((tag) => tag.id),
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
    <form onSubmit={handleSubmit}>
      <h1>Take a Giving Tree Tag</h1>

      <fieldset>
        <legend>Your Info</legend>
        <Field label="First Name:" required value={donor.firstName} onChange={setField('firstName')} autoComplete="name" />
        <Field label="Last Name:" required value={donor.lastName} onChange={setField('lastName')} autoComplete="family-name" />
        <Field label="Phone:" type="tel" value={donor.phone} onChange={setField('phone')} autoComplete="tel" />
      </fieldset>

      <fieldset>
        <legend>Your Tags ({tags.length})</legend>
        {tags.length === 0 && <p>No tags yet. Scan a tag to add it.</p>}
        {tags.map((tag) => (
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

        {scanning && <Scanner qrCodeSuccessCallback={claimTag} />}
        <button type="button" onClick={() => setScanning((s) => !s)}>
          {scanning ? 'Close camera' : 'Scan a tag'}
        </button>
      </fieldset>

      <button type="submit" disabled={busy}>
        {busy ? 'Submitting…' : `Claim ${tags.length} ${tags.length === 1 ? 'tag' : 'tags'}`}
      </button>
    </form>
  );
}

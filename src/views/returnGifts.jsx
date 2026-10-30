import { useRef, useState } from 'react';
import { receiveTag, undoReceive } from './api.js';
import { Field } from './components.jsx';
import DemoNote from './DemoNote.jsx';
import Scanner from './src/components/scanner.jsx';
import { useStoredState } from './src/useStoredState.js';

const BANNERS = {
  received: ['success', 'Received ✓'],
  unclaimed: ['warning', 'Received, but this tag was never claimed'],
  already: ['warning', 'Already received'],
  undone: ['info', 'Undone'],
  error: ['error', 'Problem'],
};

const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';

export default function ReturnGifts() {
  const [volunteer, setVolunteer] = useStoredState('volunteer', { name: '', passcode: '' });
  const [latest, setLatest] = useState(null);
  const [manual, setManual] = useState('');
  const busyRef = useRef(false);

  const setField = (field) => (value) => setVolunteer((v) => ({ ...v, [field]: value }));
  const ready = volunteer.name.trim() !== '' && volunteer.passcode.trim() !== '';
  const credentials = () => ({ passcode: volunteer.passcode.trim(), volunteer: volunteer.name.trim() });

  async function check(ref) {
    if (busyRef.current || !ref.trim()) return; // one scan at a time
    busyRef.current = true;
    try {
      const response = await receiveTag({ ...credentials(), ref });
      setLatest(response);
      navigator.vibrate?.(response.outcome === 'received' ? 80 : [80, 60, 80]);
    } catch (err) {
      setLatest({ outcome: 'error', error: err.message });
      navigator.vibrate?.(300);
    } finally {
      busyRef.current = false;
    }
  }

  async function undo() {
    try {
      const response = await undoReceive({ ...credentials(), ref: latest.gift.code });
      setLatest({ outcome: 'undone', ...response });
    } catch (err) {
      setLatest({ outcome: 'error', error: err.message });
    }
  }

  const [tone, title] = latest ? BANNERS[latest.outcome] : [];

  return (
    <div className="card">
      <h1>Volunteer Check-In</h1>
      <DemoNote />

      <fieldset>
        <legend>Volunteer</legend>
        <Field label="Your name:" required value={volunteer.name} onChange={setField('name')} autoComplete="name" />
        <Field label="Passcode:" type="password" required value={volunteer.passcode} onChange={setField('passcode')} autoComplete="off" />
      </fieldset>

      {!ready && <p className="notice info">Enter your name and the passcode to start scanning.</p>}

      {ready && (
        <>
          <Scanner onScan={check} />

          {latest && (
            <div className={`result ${tone}`}>
              <strong>{title}</strong>
              {latest.gift && (
                <>
                  <p className="big">{latest.gift.tag}</p>
                  <p>{latest.gift.ageGender}</p>
                  <p>{latest.gift.item}</p>
                  <p>Wrapping: {latest.gift.wrapped ? 'Yes' : 'No'} · Delivery: {latest.gift.delivery ? 'Yes' : 'No'}</p>
                </>
              )}
              {latest.outcome === 'already' && (
                <p>Received {formatTime(latest.receivedAt)} by {latest.receivedBy}</p>
              )}
              {latest.error && <p>{latest.error}</p>}
              {(latest.outcome === 'received' || latest.outcome === 'unclaimed') && (
                <button type="button" onClick={undo}>Undo</button>
              )}
            </div>
          )}

          {latest?.total != null && (
            <p className="counter">Received {latest.receivedCount} of {latest.total}</p>
          )}

          <fieldset>
            <legend>Can’t scan?</legend>
            <Field
              label="Type the tag number:"
              value={manual}
              onChange={setManual}
              autoComplete="off"
            />
            <button type="button" onClick={() => { check(manual); setManual(''); }}>Check in</button>
          </fieldset>
        </>
      )}
    </div>
  );
}

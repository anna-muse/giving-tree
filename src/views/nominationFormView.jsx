import { useEffect, useRef, useState } from 'react';
import { submitNomination } from '../api.js';

import { Recipient } from '../entities/recipient.js';
import { NominationForm } from '../entities/nominationForm.js';

import { Field } from '../components/field.jsx';
import { FamilyInfo } from '../components/nominationForm/familyInfo.jsx';
import { RecipientInfo } from '../components/nominationForm/recipientInfo.jsx';
import { NominatorInfo } from '../components/nominationForm/nominatorInfo.jsx';

const MAX_RECIPIENTS = 15;

export default function NominationFormView() {
  const [form, setFormValue] = useState(new NominationForm());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', show: false });
  const toastTimer = useRef();

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const updateForm = (section) => {
    return (updatedEntity) => {
        switch (section) {
            case 'nominator':
                setFormValue((currentFormState) => {
                  const updatedForm = currentFormState.duplicate();
                  updatedForm.nominator = updatedEntity;
                  return updatedForm;
                });
                break;
            case 'family':
                setFormValue((currentFormState) => {
                  const updatedForm = currentFormState.duplicate();
                  updatedForm.family = updatedEntity;
                  return updatedForm;
                });
                break;
            case 'recipient':
                setFormValue((currentFormState) => {
                    const updatedForm = currentFormState.duplicate();
                    const recipient = updatedForm.recipients.find((r) => r.id === updatedEntity.id);                    
                    recipient.fromExternalForm(updatedEntity);
                    return updatedForm;
                })
                break;
            default:
                console.error(`Unknown section: ${section}`);
        }
    }
  }

  function showToast(message, type) {
    clearTimeout(toastTimer.current);
    setToast({ message, type, show: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 6000);
  }

  const addRecipient = () => {
    setFormValue((currentFormState) => {
        const updatedForm = currentFormState.duplicate();
        updatedForm.recipients.push(new Recipient());
        return updatedForm;
    })
  };
   
  const removeRecipient = (recipientId) => {
    setFormValue((currentFormState) => {
        const updatedForm = currentFormState.duplicate();
        updatedForm.recipients = updatedForm.recipients.filter((recipient) => recipient.id !== recipientId);
        return updatedForm;
    })
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true); // disables the button so a double tap can't submit twice
    try {
      await submitNomination({ form: form.toExternalForm() });
      setFormValue(() => new NominationForm());
      showToast('Thank you! Your nomination was submitted.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not submit. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`} role="status" aria-live="polite">
        {toast.message}
      </div>

      <form onSubmit={handleSubmit}>
        <h1>828 Giving Tree Nomination Form</h1>

        <NominatorInfo nominator={form.nominator} onChange={updateForm('nominator')} />
        <FamilyInfo family={form.family} onChange={updateForm('family')} />

        {form.recipients.map((recipient, index) => (
          <RecipientInfo
            key={recipient.id}
            recipient={recipient}
            canRemove={index > 0}
            onChange={updateForm('recipient')}
            onRemove={() => removeRecipient(recipient.id)}
          />
        ))}

        {form.recipients.length < MAX_RECIPIENTS && (
          <div className="add-buttons-container">
            <button type="button" onClick={() => addRecipient()}>Add a Recipient</button>
          </div>
        )}

        {/* Honeypot: invisible to people, bots fill it in */}
        <p className="honeypot" aria-hidden="true">
          <label>
            Leave this empty
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => set('website')(e.target.value)}
            />
          </label>
        </p>

        <button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit'}</button>
      </form>
    </>
  );
}
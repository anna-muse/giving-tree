import { API_URL } from './config.js';
 
const form = document.getElementById('nomination-form');
const toast = document.getElementById('toast');
const recipientsEl = document.getElementById('recipients');
const template = document.getElementById('recipient-template');
const otherFamily = document.getElementById('other-family');
const organizationSection = document.getElementById('organization-section');
 
let recipientCounter = 0; // only ever goes up, so radio group names never collide
let toastTimer;
 
// Hidden sections are also disabled, so their required fields don't block submit.
function setSection(el, show) {
  el.hidden = !show;
  el.disabled = !show;
}
 
function syncSections() {
  setSection(otherFamily, form.nominationFor.value === 'OTHER');
  setSection(organizationSection, form.connected.value === 'CONNECTED');
}
 
function addRecipient(kind) {
  const node = template.content.firstElementChild.cloneNode(true);
  const id = ++recipientCounter;
  node.querySelector('legend').textContent = kind === 'CHILD' ? 'Child Info' : 'Other Family Member Info';
  node.querySelectorAll('input[type=radio]').forEach((r) => { r.name = `gender-${id}`; });
  const remove = node.querySelector('.remove');
  remove.hidden = recipientsEl.children.length === 0; // the first one can't be removed
  remove.addEventListener('click', () => node.remove());
  recipientsEl.append(node);
}
 
function resetRecipients() {
  recipientsEl.replaceChildren();
  addRecipient('CHILD');
}
 
function buildPayload() {
  const data = new FormData(form); // disabled (hidden) fields are left out automatically
  const v = (name) => (data.get(name) ?? '').toString().trim();
  return {
    website: v('website'),
    nominator: {
      firstName: v('nominatorFirstName'), lastName: v('nominatorLastName'),
      phone: v('nominatorPhone'), email: v('nominatorEmail'), address: v('nominatorAddress'),
    },
    nominationFor: v('nominationFor'),
    family: {
      firstName: v('familyFirstName'), lastName: v('familyLastName'),
      phone: v('familyPhone'), email: v('familyEmail'), address: v('familyAddress'),
    },
    campus: v('campus'),
    connected: v('connected'),
    organization: v('organization'),
    wrapped: v('wrapped'),
    delivered: v('delivered'),
    recipients: [...recipientsEl.querySelectorAll('.recipient')].map((el) => {
      const get = (field) => el.querySelector(`[data-field="${field}"]`).value.trim();
      return {
        name: get('name'), age: get('age'),
        gender: el.querySelector('input[type=radio]:checked')?.value ?? '',
        want: get('want'), need: get('need'), clothing: get('clothing'), joy: get('joy'),
      };
    }),
  };
}
 
function showToast(message, type) {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 6000);
}
 
form.addEventListener('change', syncSections);
document.getElementById('add-child').addEventListener('click', () => addRecipient('CHILD'));
document.getElementById('add-other').addEventListener('click', () => addRecipient('OTHER'));
 
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  button.disabled = true; // prevents double-tap duplicates
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids a CORS preflight
      body: JSON.stringify(buildPayload()),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || 'Submission failed.');
    form.reset();
    syncSections();
    resetRecipients();
    showToast('Thank you! Your nomination was submitted.', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Could not submit. Please try again.', 'error');
  } finally {
    button.disabled = false;
  }
});
 
syncSections();
resetRecipients();
const MAX_RECIPIENTS = 15;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.website) return respond({ ok: true }); // honeypot: bots fill this in

    const error = validate(data);
    if (error) return respond({ ok: false, error });

    lock.waitLock(30000); // one submission at a time, so indexes never collide
    new FormProcessor(data).process();
    return respond({ ok: true });
  } catch (err) {
    console.error(err);
    return respond({ ok: false, error: 'Something went wrong. Please try again.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function validate(d) {
  const has = (v) => typeof v === 'string' && v.trim() !== '';
  const n = d.nominator || {};
  if (!has(n.firstName) || !has(n.lastName) || !has(n.email)) return 'Please enter your name and email.';
  if (!['SELF', 'OTHER'].includes(d.nominationFor)) return 'Please choose who you are nominating.';
  if (d.nominationFor === 'OTHER' && (!has(d.family?.firstName) || !has(d.family?.lastName))) {
    return "Please enter the family's first and last name.";
  }
  if (!['WILMINGTON', 'SOUTH', 'NONE'].includes(d.campus)) return 'Please choose a campus.';
  if (!['CONNECTED', 'NOT CONNECTED'].includes(d.connected)) return 'Please answer the outreach ministry question.';
  if (d.connected === 'CONNECTED' && !has(d.organization)) return 'Please enter the organization.';
  if (!['WRAPPED', 'UNWRAPPED'].includes(d.wrapped)) return 'Please choose a wrapping option.';
  if (!['DELIVERY', 'PICK UP'].includes(d.delivered)) return 'Please choose delivery or pick up.';
  if (!Array.isArray(d.recipients) || d.recipients.length < 1 || d.recipients.length > MAX_RECIPIENTS) {
    return `Please add between 1 and ${MAX_RECIPIENTS} people.`;
  }
  for (const r of d.recipients) {
    if (!has(r.name) || !has(r.age) || !['M', 'F'].includes(r.gender)) {
      return 'Each person needs a name, age, and gender.';
    }
  }
  return null;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run by hand from the editor only. Not reachable from the web.
function emptySpreadsheet() {
  new GiftsSheet().clear();
  new RecipientsSheet().clear();
  new FamiliesSheet().clear();
  new NominatorsSheet().clear();
}
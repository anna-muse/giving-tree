// Stops a submitted value like "=IMPORTDATA(...)" from running as a formula in the sheet.
function clean(value) {
  const s = String(value ?? '').trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

class FormProcessor {
  constructor(data) {
    this.data = data;
    this.nominatorsSheet = new NominatorsSheet();
    this.familiesSheet = new FamiliesSheet();
    this.recipientsSheet = new RecipientsSheet();
    this.giftsSheet = new GiftsSheet();
  }

  process() {
    const nominator = this.addNominator();
    const family = this.addFamily(nominator);
    this.data.recipients.forEach((recipient, i) => this.addRecipient(recipient, i, family));
  }

  addNominator() {
    const n = this.data.nominator;
    const nominator = new Nominator();
    nominator.firstName = clean(n.firstName);
    nominator.lastName = clean(n.lastName);
    nominator.phone = clean(n.phone);
    nominator.email = clean(n.email);
    nominator.address = clean(n.address);
    nominator.createdBy = this._getCreatedBy();

    const row = nominator.toSpreadsheetObject();
    this.nominatorsSheet.addRow(row);
    return row;
  }

  addFamily(nominatorRow) {
    const contact = this.data.nominationFor === 'SELF' ? this.data.nominator : this.data.family;
    const family = new Family();
    family.firstName = clean(contact.firstName);
    family.lastName = clean(contact.lastName);
    family.phone = clean(contact.phone);
    family.email = clean(contact.email);
    family.address = clean(contact.address);
    family.campus = this.data.campus;
    family.wrapped = this.data.wrapped === 'WRAPPED';
    family.delivery = this.data.delivered === 'DELIVERY';
    family.organization = this.data.connected === 'CONNECTED' ? clean(this.data.organization) : '';
    family.nominatorId = nominatorRow.ID;
    family.createdBy = this._getCreatedBy();

    const row = family.toSpreadsheetObject();
    this.familiesSheet.addRow(row);
    return row;
  }

  addRecipient(r, i, familyRow) {
    const recipient = new Recipient(i);
    recipient.name = clean(r.name);
    recipient.age = clean(r.age);
    recipient.gender = r.gender;
    recipient.familyId = familyRow.ID;
    recipient.createdBy = this._getCreatedBy();

    const row = recipient.toSpreadsheetObject();
    this.recipientsSheet.addRow(row);

    // Same behavior as before: only filled-in prompts become gifts, tagged A, B, C, D in order.
    [r.want, r.need, r.clothing, r.joy]
      .map(clean)
      .filter(Boolean)
      .forEach((item, n) => {
        const gift = new Gift(familyRow, row, n);
        gift.status = 'Needed';
        gift.item = item;
        gift.recipientId = row.ID;
        gift.createdBy = this._getCreatedBy();
        this.giftsSheet.addRow(gift.toSpreadsheetObject());
      });
  }

  _getCreatedBy() {
    const n = this.data.nominator;
    return clean(`${n.firstName} ${n.lastName} (${n.email})`);
  }
}
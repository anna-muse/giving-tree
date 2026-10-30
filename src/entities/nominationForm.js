import { Recipient } from './recipient.js';
import { Family } from './family.js';
import { Nominator } from './nominator.js';

export class NominationForm {
    constructor() {
        this.nominator = new Nominator();
        this.family = new Family();
        this.recipients = [new Recipient()];
    }

    duplicate() {
        const newForm = new NominationForm();
        newForm.nominator = this.nominator.duplicate();
        newForm.family = this.family.duplicate();
        newForm.recipients = this.recipients.map((recipient) => recipient.duplicate());
        return newForm;
    }

    toExternalForm() {
        console.log('this', {
            nominator: this.nominator.toExternalForm(),
            family: this.family.toExternalForm(),
            recipients: this.recipients.map((recipient) => recipient.toExternalForm()),
        });
        return {
            nominator: this.nominator.toExternalForm(),
            family: this.family.toExternalForm(),
            recipients: this.recipients.map((recipient) => recipient.toExternalForm()),
        };
    }
}
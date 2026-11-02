export class Donor {
    constructor() {
        this.firstName = 'Amy';
        this.lastName = 'Donor';
        this.phone = '1234567890';
    }

    duplicate() {
        const newDonor = new Donor();
        newDonor.firstName = this.firstName;
        newDonor.lastName = this.lastName;
        newDonor.phone = this.phone;
        return newDonor;
    }

    fromExternalForm(externalForm) {
        if (externalForm.firstName !== undefined) { this.firstName = externalForm.firstName; }
        if (externalForm.lastName !== undefined) { this.lastName = externalForm.lastName; }
        if (externalForm.phone !== undefined) { this.phone = externalForm.phone; }
        return this;
    }

    toExternalForm() {
        return {
            firstName: this.firstName.trim(),
            lastName: this.lastName.trim(),
            phone: this.phone.trim(),
        };
    }
}
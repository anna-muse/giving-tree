export class Family {
    constructor() {
        this.firstName = 'John';
        this.lastName = 'Doe';
        this.phone = '1234567890';
        this.email = 'john.doe@example.com';
        this.address = '123 Main St, Anytown, USA';
        this.connected = 'CONNECTED';
        this.campus = 'SOUTH';
        this.organization = 'Tides';
        this.pickupDate = '';
    }

    duplicate() {
        const newFamily = new Family();
        newFamily.firstName = this.firstName;
        newFamily.lastName = this.lastName;
        newFamily.phone = this.phone;
        newFamily.email = this.email;
        newFamily.address = this.address;
        newFamily.campus = this.campus;
        newFamily.connected = this.connected;
        newFamily.organization = this.organization;
        newFamily.pickupDate = this.pickupDate;
        return newFamily;
    }

    fromExternalForm(externalForm) {
        if (externalForm.firstName !== undefined) this.firstName = externalForm.firstName;
        if (externalForm.lastName !== undefined) this.lastName = externalForm.lastName;
        if (externalForm.phone !== undefined) this.phone = externalForm.phone;
        if (externalForm.email !== undefined) this.email = externalForm.email;
        if (externalForm.address !== undefined) this.address = externalForm.address;
        if (externalForm.campus !== undefined) this.campus = externalForm.campus;
        if (externalForm.connected !== undefined) this.connected = externalForm.connected;
        if (externalForm.organization !== undefined) this.organization = externalForm.organization;
        if (externalForm.pickupDate !== undefined) this.pickupDate = externalForm.pickupDate;
    }

    toExternalForm() {
        return {
            firstName: this.firstName.trim(),
            lastName: this.lastName.trim(),
            phone: this.phone.trim(),
            email: this.email.trim(),
            address: this.address.trim(),
            campus: this.campus.trim(),
            connected: this.connected.trim(),
            organization: this.organization.trim(),
            pickupDate: this.pickupDate.trim(),
        };
    }
}
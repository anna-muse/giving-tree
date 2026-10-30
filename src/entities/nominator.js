export class Nominator {
    constructor() {
        this.firstName = '';
        this.lastName = '';
    }

    duplicate() {
        const newNominator = new Nominator();
        newNominator.firstName = this.firstName;
        newNominator.lastName = this.lastName;
        return newNominator;
    }

    fromExternalForm(externalForm) {
        if (externalForm.firstName !== undefined) this.firstName = externalForm.firstName;
        if (externalForm.lastName !== undefined) this.lastName = externalForm.lastName;
    }

    toExternalForm() {
        return {
            firstName: this.firstName.trim(),
            lastName: this.lastName.trim(),
        };
    }
}
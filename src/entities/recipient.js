export class Recipient {
    constructor() {
        this.id = crypto.randomUUID();
        this.name = '';
        this.age = '';
        this.gender = '';
        this.want = '';
        this.need = '';
        this.clothing = '';
    }

    duplicate() {
        const newRecipient = new Recipient();
        newRecipient.id = this.id;
        newRecipient.name = this.name;
        newRecipient.age = this.age;
        newRecipient.gender = this.gender;
        newRecipient.want = this.want;
        newRecipient.need = this.need;
        newRecipient.clothing = this.clothing;
        return newRecipient;
    }

    fromExternalForm(externalData) {
        if (externalData.id !== undefined) { this.id = externalData.id; }
        if (externalData.name !== undefined) { this.name = externalData.name.trim(); }
        if (externalData.age !== undefined) { this.age = externalData.age.trim(); }
        if (externalData.gender !== undefined) { this.gender = externalData.gender.trim(); }
        if (externalData.want !== undefined) { this.want = externalData.want.trim(); }
        if (externalData.need !== undefined) { this.need = externalData.need.trim(); }
        if (externalData.clothing !== undefined) { this.clothing = externalData.clothing.trim(); }
    }

    toExternalForm() {
        return {
            name: this.name.trim(),
            age: this.age.trim(),
            gender: this.gender.trim(),
            want: this.want.trim(),
            need: this.need.trim(),
            clothing: this.clothing.trim(),
        };
    }
}
export class Recipient {
    constructor() {
        this.id = crypto.randomUUID();
        this.name = 'Noah';
        this.age = '4';
        this.gender = 'M';
        this.want = 'Ball';
        this.need = 'Box';
        this.clothing = 'Pants';
        this.joy = 'Toy';
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
        newRecipient.joy = this.joy;
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
        if (externalData.joy !== undefined) { this.joy = externalData.joy.trim(); }
    }

    toExternalForm() {
        return {
            name: this.name.trim(),
            age: this.age.trim(),
            gender: this.gender.trim(),
            want: this.want.trim(),
            need: this.need.trim(),
            clothing: this.clothing.trim(),
            joy: this.joy.trim(),
        };
    }
}
export class Gift {
    constructor() {
        this.id = '';
        this.item = '';
        this.tagNumber = '';
        this.recipientAge = '';
        this.recipientGender = '';
        this.status = '';
    }

    duplicate() {
        const newGift = new Gift();
        newGift.id = this.id;
        newGift.item = this.item;
        newGift.tagNumber = this.tagNumber;
        newGift.recipientAge = this.recipientAge;
        newGift.recipientGender = this.recipientGender;
        newGift.status = this.status;
        return newGift;
    }

    fromExternalForm(externalForm) {
        if (externalForm.id !== undefined) { this.id = externalForm.id; }
        if (externalForm.item !== undefined) { this.item = externalForm.item; }
        if (externalForm.tagNumber !== undefined) { this.tagNumber = externalForm.tagNumber; }
        if (externalForm.recipientAge !== undefined) { this.recipientAge = externalForm.recipientAge; }
        if (externalForm.recipientGender !== undefined) { this.recipientGender = externalForm.recipientGender; }
        if (externalForm.status !== undefined) { this.status = externalForm.status; }
        return this;
    }

    toExternalForm() {
        return {
            id: this.id,
            item: this.item,
            tagNumber: this.tagNumber,
            recipientAge: this.recipientAge,
            recipientGender: this.recipientGender,
            status: this.status,
        };
    }
}
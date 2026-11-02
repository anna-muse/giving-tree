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
        if (externalForm['ID'] !== undefined) this.id = externalForm['ID'];
        if (externalForm['Item'] !== undefined) this.item = externalForm['Item'];
        if (externalForm['Tag Number'] !== undefined) this.tagNumber = externalForm['Tag Number'];
        if (externalForm['Recipient Age'] !== undefined) this.recipientAge = externalForm['Recipient Age'];
        if (externalForm['Recipient Gender'] !== undefined) this.recipientGender = externalForm['Recipient Gender'];
        if (externalForm['Status'] !== undefined) this.status = externalForm['Status'];
        return this;
    }

    toExternalForm() {
        return {
            'ID': this.id,
            'Item': this.item,
            'Tag Number': this.tagNumber,
            'Recipient Age': this.recipientAge,
            'Recipient Gender': this.recipientGender,
            'Status': this.status,
        };
    }
}
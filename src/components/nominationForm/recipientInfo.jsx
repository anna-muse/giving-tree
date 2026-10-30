import { Field } from '../field.jsx';
import { RadioGroup } from '../radioGroup.jsx';

export function RecipientInfo({ recipient, canRemove, onChange, onRemove }) {
  const updateRecipientField = (field) => {
    return (newValue) => {
      const updatedRecipient = recipient.duplicate();
      updatedRecipient[field] = newValue;
      onChange(updatedRecipient);
    };
  }

  return (
    <fieldset>
      <legend>Recipient Info</legend>
      <Field label="Name:" required value={recipient.name} onChange={updateRecipientField('name')} />
      <Field label="Age:" required value={recipient.age} onChange={updateRecipientField('age')} />
      <RadioGroup
        label="Gender:"
        required
        name={`gender-${recipient.id}`}
        options={[{ value: 'M', label: 'M' }, { value: 'F', label: 'F' }]}
        value={recipient.gender}
        onChange={updateRecipientField('gender')}
      />
      <Field label="What is something they want?" value={recipient.want} onChange={updateRecipientField('want')} />
      <Field label="What is something they need?" value={recipient.need} onChange={updateRecipientField('need')} />
      <Field label="What is something they would wear?" hint="Please include sizes!" value={recipient.clothing} onChange={updateRecipientField('clothing')} />
      <Field label="What would bring them joy?" value={recipient.joy} onChange={updateRecipientField('joy')} />
      {canRemove && <button type="button" className="remove" onClick={onRemove}>Remove</button>}
    </fieldset>
  );
}
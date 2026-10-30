import { Field } from '../field.jsx';

export function NominatorInfo({ nominator, onChange }) {
  const updateNominatorField = (field) => {
    return (newValue) => {
      const updatedNominator = nominator.duplicate();
      updatedNominator[field] = newValue;
      onChange(updatedNominator);
    };
  }

  return (
    <>
      <fieldset>
        <legend>Your Info</legend>

        <Field label="First Name:" required value={nominator.firstName} onChange={updateNominatorField('firstName')} />
        <Field label="Last Name:" required value={nominator.lastName} onChange={updateNominatorField('lastName')} />
      </fieldset>
    </>
  );
}

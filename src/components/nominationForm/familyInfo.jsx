import { Field } from '../field.jsx';
import { RadioGroup } from '../radioGroup.jsx';

export function FamilyInfo({ family, onChange }) {
  const updateFamilyField = (field) => {
    return (newValue) => {
      const updatedFamily = family.duplicate();
      updatedFamily[field] = newValue;
      onChange(updatedFamily);
    };
  }

  return (
    <>
      <fieldset>
        <legend>Family Info</legend>

        <Field label="First Name:" required value={family.firstName} onChange={updateFamilyField('firstName')} />
        <Field label="Last Name:" required value={family.lastName} onChange={updateFamilyField('lastName')} />
        <Field label="Phone:" type="tel" value={family.phone} onChange={updateFamilyField('phone')} />
        <Field label="Email:" type="email" value={family.email} onChange={updateFamilyField('email')} />
        <Field label="Address:" multiline value={family.address} onChange={updateFamilyField('address')} />

        <RadioGroup
            label="Which campus is the family connected with?"
            required
            name="campus"
            options={[
              { value: 'WILMINGTON', label: 'Wilmington' },
              { value: 'SOUTH', label: 'South' },
              { value: 'NONE', label: 'None' },
            ]}
            value={family.campus}
            onChange={updateFamilyField('campus')}
          />

          <RadioGroup
            label="Is the family connected with any outreach ministries?"
            hint="Tides, HopeLife, 828 Champions Club, etc."
            required
            name="connected"
            options={[
              { value: 'CONNECTED', label: 'Yes' },
              { value: 'NOT CONNECTED', label: 'No' },
            ]}
            value={family.connected}
            onChange={updateFamilyField('connected')}
          />

          {family.connected === 'CONNECTED' && (
            <Field
              label="Which organization is the family connected to?"
              required
              value={family.organization}
              onChange={updateFamilyField('organization')}
            />
          )}

          <RadioGroup
            label="Preferred pick up date"
            required
            name="pickupDate"
            options={[
              { value: new Date('2026-12-12T09:00:00').toISOString(), label: 'Saturday, December 12 from 9:00-11:00 AM' },
              { value: new Date('2026-12-13T12:30:00').toISOString(), label: 'Sunday, December 13 from 12:30-1:30 PM' },
            ]}
            value={family.pickupDate}
            onChange={updateFamilyField('pickupDate')}
          />
      </fieldset>
    </>
  );
}

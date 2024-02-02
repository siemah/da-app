import {
  IoBusiness,
  IoMailOutline,
  IoPhonePortraitOutline,
} from 'react-icons/io5';
import { FormEvent, forwardRef } from 'react';
import { Client } from '@/types/data';
import FormInput from './form-input';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ClientFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  data: Client | null | undefined;
  disabled: boolean;
  className?: string | undefined;
}
const ClientForm = forwardRef<HTMLFormElement, ClientFormProps>(
  ({ data, disabled, className, onSubmit }, ref) => {
    return (
      <form onSubmit={onSubmit} ref={ref} className={className}>
        <FormInput
          name="name"
          defaultValue={data?.name}
          label="Client name"
          Icon={IoBusiness}
        />
        <FormInput
          name="phone_number"
          label="Phone number"
          Icon={IoPhonePortraitOutline}
          defaultValue={data?.phone_number}
        />
        <FormInput
          name="email"
          label="Email"
          Icon={IoMailOutline}
          defaultValue={data?.email}
        />
        <Button
          variant="default"
          className="rounded-lg w-fit px-14 py-2 h-9 bg-blue-500 hover:bg-blue-400 focus-visible:ring-blue-500"
          type="submit"
          disabled={disabled}
        >
          Save
        </Button>
      </form>
    );
  },
);

export default ClientForm;

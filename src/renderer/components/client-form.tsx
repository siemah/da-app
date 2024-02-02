import {
  IoBusiness,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { FormEvent, MouseEvent, forwardRef } from 'react';
import { Client } from '@/types/data';
import FormInput from './form-input';
import { Button } from './ui/button';

interface ClientFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  // eslint-disable-next-line react/require-default-props
  onDelete?: (event: MouseEvent<HTMLButtonElement>) => void;
  data: Client | null | undefined;
  disabled: boolean;
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined;
}
const ClientForm = forwardRef<HTMLFormElement, ClientFormProps>(
  ({ data, disabled, className, onSubmit, onDelete }, ref) => {
    return (
      <form onSubmit={onSubmit} ref={ref} className={className}>
        {data?.id !== undefined && (
          <input name="id" type="hidden" defaultValue={data?.id} />
        )}
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
        <div className="flex gap-4">
          <Button
            variant="default"
            className="rounded-lg w-fit px-14 py-2 h-9 bg-blue-500 hover:bg-blue-400 focus-visible:ring-blue-500"
            type="submit"
            disabled={disabled}
          >
            Save
          </Button>
          {data?.id !== undefined && (
            <Button
              variant="destructive"
              className="rounded-lg w-fit py-2 h-9"
              type="button"
              onClick={onDelete}
            >
              <IoTrashOutline className="h-6 w-6" />
            </Button>
          )}
        </div>
      </form>
    );
  },
);

export default ClientForm;

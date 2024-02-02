import React from 'react';
import { Label } from '@/renderer/components/ui/label';
import { Input, InputProps } from '@/renderer/components/ui/input';

interface FormInputProps extends InputProps {
  label: string;
  Icon?: React.JSX.ElementType;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      name,
      defaultValue,
      Icon,
      className = '',
      type,
      placeholder,
      onChange,
    },
    ref,
  ) => {
    return (
      <div>
        <Label htmlFor={id || name} className="text-white text-base font-light">
          {label}
        </Label>
        <div className="group/parent min-w-full flex flex-row gap-2 max-w-52 border-b border-slate-300 has-[:focus]:border-white items-center">
          {Icon !== undefined && (
            <div className="flex items-center justify-center text-slate-300 group-focus-within/parent:text-white">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <Input
            id={id || name}
            placeholder={placeholder}
            className={`flex-1 font-light border-0 rounded-none text-white bg-transparent !placeholder-slate-300 text-lg pl-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:!outline-none ${className}`}
            name={name}
            ref={ref}
            type={type}
            onChange={onChange}
            defaultValue={defaultValue}
          />
        </div>
      </div>
    );
  },
);

export default FormInput;

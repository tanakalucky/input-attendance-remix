import * as React from 'react';

import { cn } from '~/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const inputStyles = {
  base: 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
  file: 'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  states:
    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={ariaInvalid}
        className={cn(
          inputStyles.base,
          inputStyles.file,
          inputStyles.states,
          ariaInvalid && 'border-destructive',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };

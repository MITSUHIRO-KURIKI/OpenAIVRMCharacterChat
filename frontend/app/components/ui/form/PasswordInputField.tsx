'use client';

// react
import {
  useState,
  type ReactElement,
  type ComponentPropsWithoutRef,
} from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
import { Input } from '@/app/components/ui/shadcn/input';
// icons
import { Eye, EyeOff } from 'lucide-react';

// type
type PasswordInputFieldProps = ComponentPropsWithoutRef<typeof Input>;

export function PasswordInputField({className, ...props}:PasswordInputFieldProps): ReactElement {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='relative'> 
      <Input {...props}
             type      = {showPassword ? 'text' : 'password'}
             className = {cn('pr-8', className)} />
      <Button variant   = 'ghost'
              size      = 'fit'
              type      = 'button'
              className = {cn(
                'absolute inset-y-0 right-0 flex items-center px-2',
                'bg-transpant hover:bg-transpant',
                'text-muted-foreground hover:text-accent-foreground',
              )}
              tabIndex  = {-1}
              onClick   = {() => setShowPassword((prev) => !prev)}>
        {showPassword ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
};
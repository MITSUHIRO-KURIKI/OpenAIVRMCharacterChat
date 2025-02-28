// react
import { type ReactElement } from 'react';
// include
import { PasswordChangeForm } from './PasswordChangeForm';


// PasswordChangeContent
export function PasswordChangeContent(): ReactElement {
  return (
    <div className = 'mx-auto max-w-md pt-4'>
      <PasswordChangeForm />
    </div>
  );
};
// react
import { type ReactElement } from 'react';
// include
import { AccountDeleteForm } from './AccountDeleteForm';


// AccountDeleteContent
export function AccountDeleteContent(): ReactElement {
  return (
    <div className = 'mx-auto max-w-md pt-4'>
      <AccountDeleteForm />
    </div>
  );
};
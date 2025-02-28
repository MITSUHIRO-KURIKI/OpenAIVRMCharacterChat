// react
import { type ReactElement } from 'react';
// icons
import { Loader2 } from 'lucide-react';

export function Loader(): ReactElement {
  return (
    <div className='inset-0 flex items-center justify-center'>
      <Loader2 className='size-8 animate-spin' />
    </div>
  );
};
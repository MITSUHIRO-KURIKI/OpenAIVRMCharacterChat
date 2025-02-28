'use client';

import Link from 'next/link';

export default function Error() {
  return (
    <div className='flex h-screen w-screen select-none flex-col items-center justify-center'>
      <p className='mb-3 text-center text-7xl font-bold text-primary/80'>500</p>
      <p className='text-center text-xl font-semibold text-primary/80'>Server Error</p>
      <p className='mt-4 text-center text-base text-primary/50'>Please wait for a while before accessing.</p>
      <Link href='/'
            className='mt-6 rounded-md bg-primary/60 px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90'>
        Return to top pag
      </Link>
    </div>
  );
};
// react
import React, { FC, ReactElement } from 'react';
// shadcn
import { Toaster } from "@/app/components/ui/shadcn/sonner"


// ToastProvider
export const ToastProvider: FC = (): ReactElement => {
  return (<Toaster
    dir           = 'auto'
    expand        = {false}
    visibleToasts = {3}
    richColors    = {true}
    position      = 'bottom-right'/>
  );
};
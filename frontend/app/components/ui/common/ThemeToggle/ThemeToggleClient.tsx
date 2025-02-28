'use client';

// react
import { type ReactElement } from 'react';
// shadcn
import { Label } from '@/app/components/ui/shadcn/label';
import { ToggleGroup, ToggleGroupItem } from '@/app/components/ui/shadcn/toggle-group'
// icons
import { Moon, Sun, Computer } from 'lucide-react';
// lib
import { useTheme } from 'next-themes';


// ThemeToggleClient
export function ThemeToggleClient(): ReactElement {

  const { theme, setTheme } = useTheme();

  return (
    <>
      <Label htmlFor='ThemeToggle' className='sr-only'>Toggle theme</Label>
      <ToggleGroup type      = 'single'
                   id        = 'ThemeToggle'
                   className = 'rounded-full border px-2'
                   size      = 'xs'
                   value     = {theme}
                   onValueChange = {(value) => setTheme(value)}>
        <ToggleGroupItem className  = 'rounded-full'
                         value      = 'dark'
                         aria-label = 'Toggle dark'>
          <Moon className='size-4' />
        </ToggleGroupItem>
        <ToggleGroupItem className  = 'rounded-full'
                         value      = 'system'
                         aria-label = 'Toggle system'>
          <Computer className='size-4' />
        </ToggleGroupItem>
        <ToggleGroupItem className  = 'rounded-full'
                         value      = 'light'
                         aria-label = 'Toggle light'>
          <Sun className='size-4' />
        </ToggleGroupItem>
      </ToggleGroup>
    </>
  );
};
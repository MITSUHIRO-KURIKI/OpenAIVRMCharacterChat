// react
import {
  forwardRef,
  type ReactElement,
  type ElementRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
// next
import Link from 'next/link';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  NavigationMenu as ShadcnNavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/app/components/ui/shadcn/navigation-menu';
// include
import { NavigationItems } from '../data';

// type
type MenuLinkItemProps = ComponentPropsWithoutRef<typeof Link> & {
  title?:          string;
  children?:       ReactNode;
  classNameTitle?: string;
};

// NavigationMenu ▽
export function NavigationMenu(): ReactElement {
  return (
    <ShadcnNavigationMenu>
      <NavigationMenuList>
        { NavigationItems.Navbar.map((item) => {
          // include SubCategories
          if (item.sub && item.sub.length > 0) {
            return (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuTrigger
                  className={cn(
                    'p-2 text-xs font-light text-foreground',
                    'bg-transparent hover:bg-transparent [&>svg]:text-sidebar-accent-foreground',)}>
                  {item.icon && <item.icon className='mr-2 size-4' />}{item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className={cn(
                    'grid grid-cols-1 gap-3 p-4',
                    'w-[400px] max-h-[60vh] overflow-y-auto',
                    'md:w-[500px] md:grid-cols-2',
                    'lg:w-[600px] lg:grid-cols-3',)}>
                    {item.sub.map((subItem) => (
                      <MenuLinkItem key   = {subItem.key}
                                    title = {subItem.label ?? ''}
                                    href  = {subItem.href  ?? '#'} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          };
          // No SubCategories
          return (
            <NavigationMenuItem key={item.key}>
              <Link href={item.href ?? '#'} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'p-2 text-xs font-light text-foreground',
                    'bg-transparent [&>svg]:text-sidebar-accent-foreground',)}>
                  {item.icon && <item.icon className='mr-2 size-4' />}{item.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </ShadcnNavigationMenu>
  );
};
// NavigationMenu △

// MenuLinkItem ▽
const MenuLinkItem = forwardRef<ElementRef<typeof Link>, MenuLinkItemProps>(({ className, classNameTitle, title, ...props }, ref) => (
    <li>
      <NavigationMenuLink asChild>
        <Link ref={ref}
              className={cn(
                'block select-none space-y-1 rounded-md leading-none no-underline outline-none transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground',
                className,)}
              {...props}>
          <div className={cn(
            'p-3 text-xs text-foreground font-light leading-none',
            'hover:font-medium',
            classNameTitle,)}>
            {title}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  ),
);
MenuLinkItem.displayName = 'MenuLinkItem';
// MenuLinkItem △
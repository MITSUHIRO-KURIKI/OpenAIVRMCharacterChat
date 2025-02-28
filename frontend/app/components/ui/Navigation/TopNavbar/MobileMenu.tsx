// https://github.com/shadcn-ui/ui/discussions/1790#discussioncomment-7348150
'use client';

// next
import Link from 'next/link';
// react
import {
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
} from 'react';
// shadcn/ui
import { cn } from '@/app/components/lib/shadcn';
import { Button } from '@/app/components/ui/shadcn/button';
// icons
import {
  Menu,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
// hooks
import { useMobileMenu } from '../hooks';
// components
import { ThemeToggle, Loader } from '@/app/components/ui/common';
// include
import { MobileMenuBase } from '../MobileMenuBase';
import { AccountSettingsModal } from '../AccountSettingsModal';
import { AccountMenuItems, NavigationItems } from '../data';

// type
type MobileMenuProps = {
  setIsTopNavBarVisible: Dispatch<SetStateAction<boolean>>;
};
type SubCategoryListProps = {
  menuName:    string | null;
  onItemClick: () => void;
};

// MobileMenu ▽
export function MobileMenu({ setIsTopNavBarVisible }: MobileMenuProps): ReactElement {

  // useMobileMenu
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSubMenuOpen,
    subMenuName,
    isAccountModalOpen,
    setIsAccountModalOpen,
    overlayActive,
    setOverlayActive,
    handleMenuClick,
    handleGoBack,
    handleOpenAccountModal,
  } = useMobileMenu();

  // accountMenu (ログイン中かで切り替え)
  const accountMenuItems = AccountMenuItems();

  return (
    <>
      <Button variant   = 'ghost'
              size      = 'icon'
              className = 'md:hidden [&_svg]:size-6'
              onClick   = {() => setIsMobileMenuOpen(true)}>
        <Menu />
        <span className='sr-only'>Toggle menu</span>
      </Button>

      <MobileMenuBase isMobileMenuOpen      = {isMobileMenuOpen}
                      setIsMobileMenuOpen   = {setIsMobileMenuOpen}
                      overlayActive         = {overlayActive}
                      setIsTopNavBarVisible = {setIsTopNavBarVisible}>

        {/* メインカテゴリ画面 */}
        <div className={cn(
          'absolute top-0 left-0 size-full transition-transform',
          'duration-500', "ease-[cubic-bezier(0.32,0.72,0,1)]",
          !isSubMenuOpen ? 'translate-x-0' : '-translate-x-full',)}>
          <div>
            <ul className='w-full space-y-2 pr-8'>
              {/* サイドバーなし */}
              { NavigationItems.Navbar.map((item) => (
                <li key={item.key} className='w-full'>
                  {item.sub && item.sub.length > 0 ? (
                    // include SubCategories
                    <Button variant   = 'link'
                            size      = 'fit'
                            className = {cn(
                              'w-full h-8 justify-start rounded',
                              'text-sm font-normal text-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                            onClick={(e) => handleMenuClick(e, item.key)}>
                      {item.icon && <item.icon />}{item.label}
                      <ChevronRight className='text-foreground' />
                    </Button>
                  ) : (
                    // No SubCategorie
                    <Link href      = {item.href ?? '#'}
                          className = {cn(
                            'gap-2 flex w-full h-8 justify-start items-center rounded',
                            'text-sm font-normal text-foreground select-none [&>svg]:text-sidebar-accent-foreground',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                          onClick={() => setIsMobileMenuOpen(false)} >
                      {item.icon && <item.icon />}{item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className={cn(
              'mt-6 mb-2 mr-8 ml-0',
              'h-[1px] w-auto rounded-full bg-border',)} />

            {/* accountMenuItems */}
            <div className='w-full space-y-2 pr-8'>
              {accountMenuItems.map((item, idx) => {
                if (item.type === 'loading') {
                  return <div key={`${item.key}-${idx}`}><Loader /></div>;
                } else if (item.type === 'divided') {
                  return <div key={`${item.key}-${idx}`} className={cn('my-2','h-[1px] w-full rounded-full bg-border',)} />;
                } else if (item.key === 'settings') {
                  return (
                    <Button variant   = 'link'
                            size      = 'fit'
                            key       = {item.key}
                            onClick   = {handleOpenAccountModal}
                            className = {cn(
                              'w-full h-8 justify-start rounded',
                              'text-sm font-normal text-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}>
                      {item.icon && <item.icon />}{item.label}
                    </Button>
                  );
                } else if (item.type === 'action' && item.onClick) {
                  return (
                    <Button variant   = 'link'
                            size      = 'fit'
                            key       = {item.key}
                            onClick   = {()=>{
                              setOverlayActive(true);
                              item.onClick?.();
                            }}
                            className = {cn(
                              'w-full h-8 justify-start rounded',
                              'text-sm font-normal text-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}>
                      {item.icon && <item.icon />}{item.label}
                    </Button>
                  );
                };
                return (
                  <Link key       = {item.key}
                        href      = {item.href ?? '#'}
                        className = {cn(
                          'flex gap-2 w-full h-8 justify-start items-center rounded',
                          'text-sm font-normal text-foreground select-none',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          '[&>svg]:text-foreground hover:[&>svg]:text-sidebar-accent-foreground',)}
                        onClick={() => setIsMobileMenuOpen(false)} >
                    {item.icon && <item.icon />}{item.label}
                  </Link>
                );
              })}

              {/* ThemeToggle */}
              <div className = {cn(
                'relative flex justify-between cursor-default select-none items-center gap-2 ',
                'text-xs font-light text-foreground text-left',
                'outline-none',
              )}>
                <span>Appearance</span>
                <ThemeToggle />
              </div>

            </div>
          </div>
        </div>

        {/* サブカテゴリ画面 */}
        <div className={cn(
          'absolute top-0 left-0 size-full transition-transform',
          'duration-500', "ease-[cubic-bezier(0.32,0.72,0,1)]",
          isSubMenuOpen ? 'translate-x-0' : 'translate-x-full',)} >
          <Button variant   ='ghost'
                  size      = 'xs'
                  className = {cn(
                    'justify-start rounded',
                    'text-xs text-foreground/60',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    '[&>svg]:text-foreground/60 hover:[&>svg]:text-sidebar-accent-foreground',)}
                  onClick = {(e: MouseEvent<HTMLElement>,) => handleGoBack(e)}>
            <ChevronLeft />back
          </Button>
          <div className='space-y-4 pt-4'>
              <SubCategoryList menuName    = {subMenuName}
                               onItemClick = {() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      </MobileMenuBase>

      {/* アカウント設定 モーダル */}
      <AccountSettingsModal open         = {isAccountModalOpen}
                            onOpenChange = {setIsAccountModalOpen} />
    </>
  );
};
// MobileMenu △

// SubCategoryList ▽
function SubCategoryList({ menuName, onItemClick }: SubCategoryListProps): ReactElement {

  if (!menuName) return <></>;

  const item = NavigationItems.Navbar.find((cat) => cat.key === menuName);
  if (!item?.sub) return <></>;

  return (
    <div>
      <div className={cn(
        'flex gap-2 mb-2 justify-start items-center',
        'text-xs font-light text-foreground select-none',
        '[&>svg]:text-foreground',)}>
        {item?.label}
      </div>
      <ul className='ml-2 w-full space-y-2 pr-8'>
        {item.sub.map((subItem) => (
          <li key={subItem.key}>
            <div className='flex w-full items-center justify-between'>
              <Link href      = {subItem.href ?? '#'}
                    className = {cn(
                      'flex gap-2 w-full h-8 justify-start items-center rounded',
                      'text-sm font-normal text-foreground select-none',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',)}
                    onClick={onItemClick} >
                {subItem.icon && <subItem.icon className='size-4' />}{subItem.label ?? ''}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
// SubCategoryList △
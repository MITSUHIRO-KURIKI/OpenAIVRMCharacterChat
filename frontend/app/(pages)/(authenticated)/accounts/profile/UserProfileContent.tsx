'use client';

// react
import { type ReactElement } from 'react';
// include
import { UserProfileEditForm } from './UserProfileEditForm';
// type
import type { UserProfileResponseData } from '@/features/api/user_properties';


// UserProfileContent
export function UserProfileContent({ userProfileData }: {userProfileData: UserProfileResponseData}): ReactElement {
  return (
    <div className = 'mx-auto max-w-md pt-4'>
      <UserProfileEditForm userProfileData={userProfileData}/>
    </div>
  )
};
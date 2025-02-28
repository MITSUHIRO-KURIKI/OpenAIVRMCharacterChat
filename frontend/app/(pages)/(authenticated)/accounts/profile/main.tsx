'use client';

// react
import { useEffect, useState, type ReactElement } from 'react';
// features
import {
  getUserProfile,
  type UserProfileResponseData,
} from '@/features/api/user_properties';
// import
import Loading from '@/app/loading';
// include
import { UserProfileContent } from './UserProfileContent';


// ProfilePage
export function ProfilePage(): ReactElement {
  const [data, setData]       = useState<UserProfileResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getUserProfile()
      .then((res) => {
        if (!isMounted) return;
        if (!res.ok || !res.data) {
          setData(null);
        } else {
          setData(res.data);
        };
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // ローディング中
  if (loading) return <Loading />;
  // データ未取得
  if (!data) {
    return <p className='select-none text-xs font-thin text-muted-foreground'>情報が取得できませんでした</p>;
  };
  return (
    <UserProfileContent userProfileData={data} />
  );
};
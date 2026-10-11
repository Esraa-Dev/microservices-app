'use client';

import TopHeader from './TopHeader';
import MainNav from './MainNav';
import { useUser } from '@/hooks/useUser';

export default function Header() {
  const { user, isLoading } = useUser();
console.log('Header user:', user);
  return (
    <header>
      <TopHeader user={user} isLoading={isLoading} />

      <MainNav user={user} isLoading={isLoading} />
    </header>
  );
}

'use client';

import { useState, useEffect } from 'react';

export function useUserRole() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
    }
  }, []);

  return userRole;
}

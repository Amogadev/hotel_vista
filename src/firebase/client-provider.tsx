
'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/lib/firebase';

const { app, auth, firestore } = initializeFirebase();

export default function FirebaseClientProvider({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <FirebaseProvider
      app={app}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

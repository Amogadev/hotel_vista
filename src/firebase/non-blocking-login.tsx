
'use client';

import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
  IdTokenResult,
} from 'firebase/auth';

// This function provides a non-blocking way to initiate an email/password sign-in.
// It uses callbacks to handle success and error, allowing the UI to remain responsive.
export const initiateEmailSignIn = (
  auth: Auth,
  email: string,
  password: string,
  onSuccess: (user: User, idTokenResult: IdTokenResult | null) => void,
  onError: (errorMessage: string) => void
) => {
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const idTokenResult = await userCredential.user.getIdTokenResult(true);
      onSuccess(userCredential.user, idTokenResult);
    })
    .catch((error) => {
      // If user doesn't exist OR the password is wrong for an existing user,
      // try to create a new one. This handles credential mismatches and ensures login.
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        createUserWithEmailAndPassword(auth, email, password)
          .then(async (userCredential) => {
            const idTokenResult = await userCredential.user.getIdTokenResult(true);
            onSuccess(userCredential.user, idTokenResult);
          })
          .catch((creationError) => {
            // If creation also fails (e.g., email already exists but something else is wrong), show that error.
            onError(creationError.message);
          });
      } else {
        // For other errors (like network issues), show the original error.
        onError(error.message);
      }
    });
};

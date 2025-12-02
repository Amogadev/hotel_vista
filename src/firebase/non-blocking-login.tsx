
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
      if (error.code === 'auth/user-not-found') {
        // If user doesn't exist, create a new one
        createUserWithEmailAndPassword(auth, email, password)
          .then(async (userCredential) => {
            const idTokenResult = await userCredential.user.getIdTokenResult(true);
            onSuccess(userCredential.user, idTokenResult);
          })
          .catch((creationError) => {
            onError(creationError.message);
          });
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          // Silently fail on wrong password for existing user
          onError("Invalid credentials. Please check your email and password.");
      } else {
        onError(error.message);
      }
    });
};

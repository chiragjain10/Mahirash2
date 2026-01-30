import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../components/firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    // Don't manually set user - let onAuthStateChanged handle it
    // This ensures the user object has all Firebase properties (metadata, etc.)
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    // Don't manually set user - let onAuthStateChanged handle it
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // Don't manually set user - let onAuthStateChanged handle it
    return result;
  };

  const logout = () => signOut(auth);

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, loginWithGoogle, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
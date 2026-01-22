import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../components/firebase';

const AdminAuthContext = createContext();
const ADMIN_EMAIL = 'admin@perfume.com';

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setAdminUser(user);
      } else {
        // Don't sign out regular users - let AuthContext handle them
        // Only set adminUser to null if it's not an admin
        setAdminUser(null);
      }
      setAdminLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminLogin = async (email, password) => {
    if (email !== ADMIN_EMAIL) {
      return { success: false, message: 'You are not authorized to access the admin panel.' };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Admin account not found.';
      }
      return { success: false, message };
    }
  };

  const adminLogout = async () => {
    await signOut(auth);
    setAdminUser(null);
  };

  const isAdmin = () => !!adminUser;

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminLoading,
        adminLogin,
        adminLogout,
        isAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { auth, firebaseReady } from "./firebase";
import { createUserDoc, subscribeUserDoc } from "./cloud";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(firebaseReady);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (!firebaseReady) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setEmailVerified(u ? u.emailVerified : false);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setUserDoc(null);
      return;
    }
    return subscribeUserDoc(user.uid, (doc) => {
      if (!doc) {
        createUserDoc(user.uid, { name: user.displayName || "", email: user.email || "" });
        return;
      }
      setUserDoc(doc);
    });
  }, [user]);

  async function signUp(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await createUserDoc(cred.user.uid, { name, email });
    await sendEmailVerification(cred.user);
    return cred.user;
  }

  async function signIn(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function signOutUser() {
    await signOut(auth);
  }

  async function resendVerification() {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  }

  async function refreshEmailVerified() {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    setEmailVerified(verified);
    return verified;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        emailVerified,
        signUp,
        signIn,
        signOutUser,
        resendVerification,
        refreshEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

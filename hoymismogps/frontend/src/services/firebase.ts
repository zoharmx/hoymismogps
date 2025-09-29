
// Firebase client configuration for HoyMismoGPS
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

import { environment } from '../config/environment';

const firebaseConfig = environment.FIREBASE;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore real-time listeners
export const subscribeToVehicles = (organizationId: string, callback: (vehicles: any[]) => void) => {
  const q = query(
    collection(db, 'vehicles'),
    where('organizationId', '==', organizationId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(vehicles);
  });
};

export const subscribeToAlerts = (organizationId: string, callback: (alerts: any[]) => void) => {
  const q = query(
    collection(db, 'alerts'),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(alerts);
  });
};

export default app;

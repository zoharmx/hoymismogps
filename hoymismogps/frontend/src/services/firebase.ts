
// Firebase client configuration for HoyMismoGPS
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getDatabase, ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

import { environment } from '../config/environment';

const firebaseConfig = environment.FIREBASE;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

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

// Realtime Database listeners
export const subscribeToVehicles = (organizationId: string, callback: (vehicles: Record<string, unknown>[]) => void) => {
  const vehiclesRef = ref(db, 'vehicles');
  const q = query(vehiclesRef, orderByChild('organizationId'), equalTo(organizationId));

  return onValue(q, (snapshot) => {
    const vehicles: Record<string, unknown>[] = [];
    snapshot.forEach((childSnapshot) => {
      vehicles.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(vehicles);
  });
};

export const subscribeToAlerts = (organizationId: string, callback: (alerts: Record<string, unknown>[]) => void) => {
  const alertsRef = ref(db, 'alerts');
  const q = query(alertsRef, orderByChild('organizationId'), equalTo(organizationId));

  return onValue(q, (snapshot) => {
    const alerts: Record<string, unknown>[] = [];
    snapshot.forEach((childSnapshot) => {
      alerts.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    // Sort by createdAt descending
    alerts.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(alerts);
  });
};

export default app;


// Environment configuration for HoyMismoGPS frontend
export const environment = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://hoymismogps-backend.onrender.com',

  // Mapbox Configuration
  MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoiem9oYXJteCIsImEiOiJjbWUwdmViYXYwOWVyMnFwdXJiN2FsMXIwIn0.t6-3BDRKYPEb7pxCItECog',

  // Firebase Configuration
  FIREBASE: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDJBIASAEKY6nZRYC2OekMQwtNIn4sW108',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hoymismogps.firebaseapp.com',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://hoymismogps-default-rtdb.firebaseio.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hoymismogps',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hoymismogps.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1098450733119',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1098450733119:web:3783fc00cf271ee7d5508a'
  },

  // Development
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV || false,
  IS_PRODUCTION: import.meta.env.PROD || false,
};

export default environment;

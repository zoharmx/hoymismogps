
// Environment configuration for HoyMismoGPS frontend
export const environment = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // Mapbox Configuration
  MAPBOX_ACCESS_TOKEN: 'pk.eyJ1Ijoiem9oYXJteCIsImEiOiJjbWUwdmViYXYwOWVyMnFwdXJiN2FsMXIwIn0.t6-3BDRKYPEb7pxCItECog',
  
  // Firebase Configuration
  FIREBASE: {
    apiKey: 'AIzaSyDJBIASAEKY6nZRYC2OekMQwtNIn4sW108',
    authDomain: 'hoymismogps.firebaseapp.com',
    projectId: 'hoymismogps',
    storageBucket: 'hoymismogps.firebasestorage.app',
    messagingSenderId: '1098450733119',
    appId: '1:1098450733119:web:3783fc00cf271ee7d5508a'
  },
  
  // Development
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV || false,
  IS_PRODUCTION: import.meta.env.PROD || false,
};

export default environment;

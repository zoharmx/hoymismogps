// ruta: hoymismogps/frontend/src/components/Auth/Login.tsx

import { auth } from '../../services/firebase';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error durante el inicio de sesión con Google:", error);
    }
  };

  const logoUrl = "https://assets.zyrosite.com/m6Lj5RMGlLT19eqJ/logo-hoy-mismo-YD0Bz1op0eizKk6L.png";
  const backgroundUrl = "https://assets.zyrosite.com/m6Lj5RMGlLT19eqJ/img-20250108-wa0006-AzG3y50BLqsX00PN.jpg";

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .google-btn {
          transition: all 0.3s ease;
        }
        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <div 
        className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        
        <div className="relative z-10 p-8 sm:p-10 md:p-12 bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md m-4 border border-gray-700 fade-in">
          
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="HoyMismoGPS Logo" className="w-48" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
            Bienvenido a la Plataforma
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Monitoreo y gestión de flotas en tiempo real.
          </p>
          
          <button
            onClick={handleGoogleSignIn}
            className="google-btn w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-100"
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 3.19-2.25 5.89-4.78 7.74l7.98 6.19C45.02 38.35 48 31.83 48 24c0-.66-.05-1.32-.15-1.97L46.98 24.55z"></path>
              <path fill="#34A853" d="M10.53 28.59C10 30.15 9.69 31.8 9.69 33.5c0 1.7.31 3.35.84 4.91l-7.98 6.19C.92 39.95 0 36.89 0 33.5c0-3.39.92-6.45 2.56-9.28l7.97 6.19z"></path>
              <path fill="#FBBC05" d="M24 48c6.47 0 11.9-2.14 15.84-5.79l-7.98-6.19c-2.11 1.42-4.82 2.25-7.86 2.25-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Iniciar sesión con Google
          </button>

          <p className="text-center text-xs text-gray-500 mt-8">
            © 2025 HoyMismoGPS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-6">Iniciar Sesión en HoyMismoGPS</h1>
        <button
          onClick={handleGoogleSignIn}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Entrar con Google
        </button>
      </div>
    </div>
  );
};

export default Login;
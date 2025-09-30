// ruta: hoymismogps/frontend/src/components/Auth/Login.tsx

import { auth } from '../../services/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  // signInWithEmailAndPassword // Comentado por ahora para evitar error de no usado
} from "firebase/auth";

const Login = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error durante el inicio de sesión con Google:", error);
    }
  };

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
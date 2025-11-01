import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase'; // Import auth directly
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      if (!auth) throw new Error('Firebase Auth not initialized');

      // 1️⃣ Sign in with Google
      const result = await signInWithPopup(auth, provider);

      // 2️⃣ Prepare user data to send to backend
      const userData = {
        name: result.user.displayName,
        email: result.user.email,
        googlePhotoUrl: result.user.photoURL,
      };

      // 3️⃣ Send to backend
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Backend error:', errText);
        alert('Backend error occurred. Check console.');
        return;
      }

      const data = await res.json();

      // 4️⃣ Dispatch to Redux and navigate
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      console.error('Google Sign-in error:', error);
      alert('Google sign-in failed! Check console.');
    }
  };

  return (
    <Button
      type="button"
      gradientDuoTone="pinkToOrange"
      outline
      onClick={handleGoogleClick}
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2" />
      Continue with Google
    </Button>
  );
}

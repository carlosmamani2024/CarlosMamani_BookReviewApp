import '@expo/metro-runtime';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCNFqJCF_o7C-L7eFSEmXFAxQjdyRMhctI",
  authDomain: "bookreviewapp-932cc.firebaseapp.com",
  projectId: "bookreviewapp-932cc",
  storageBucket: "bookreviewapp-932cc.firebasestorage.app",
  messagingSenderId: "301692201163",
  appId: "1:301692201163:web:14f4a45d2cbd22bba0934e"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

let auth;
if (!global._authInstance) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  global._authInstance = auth;
} else {
  auth = global._authInstance;
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

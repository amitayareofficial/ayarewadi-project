import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAMF-xfxii8Zol-HQ5U5lvzDVGYiOUHWtI",
  authDomain: "ayarewadi-website.firebaseapp.com",
  projectId: "ayarewadi-website",
  storageBucket: "ayarewadi-website.firebasestorage.app",
  messagingSenderId: "691909865303",
  appId: "G-3SLWDYMDSY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
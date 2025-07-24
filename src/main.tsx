
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';


const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
    <GoogleOAuthProvider clientId="352246305423-pbe4gpcpa3i96plmo3krncc11453n6hm.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
);

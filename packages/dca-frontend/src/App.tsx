import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { JwtProvider } from '@lit-protocol/vincent-app-sdk/react';
// import { useJwtContext } from '@lit-protocol/vincent-app-sdk/react';

import { env } from '@/config/env';

import './App.css';

// import { Home } from '@/pages/home';
// import { Login } from '@/pages/login';
import { Welcome } from '@/pages/welcome';
const { VITE_APP_ID } = env;

// function AppContent() {
//   const { authInfo } = useJwtContext();

//   return authInfo ? <Home /> : <Login />;
// }

function App() {
  return (
    <JwtProvider appId={VITE_APP_ID}>
      <Welcome />
    </JwtProvider>
  );
}

export default App;

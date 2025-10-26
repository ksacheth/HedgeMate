import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { useJwtContext } from '@lit-protocol/vincent-app-sdk/react';

import './App.css';

// import { Home } from '@/pages/home';
import { Login } from '@/pages/login';
import { Welcome } from '@/pages/welcome';

function AppContent() {
  const { authInfo } = useJwtContext();
  return authInfo ? <Welcome /> : <Login />;
}

function App() {
  return <AppContent />;
}

export default App;

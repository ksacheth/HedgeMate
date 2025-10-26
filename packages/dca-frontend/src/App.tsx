import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { JwtProvider } from '@lit-protocol/vincent-app-sdk/react';

import { env } from '@/config/env';

import './App.css';

import { Welcome } from '@/pages/welcome';
import { Navbar } from '@/components/navbar';
const { VITE_APP_ID } = env;

function App() {
  return (
    <JwtProvider appId={VITE_APP_ID}>
      {/* <AppContent /> */}
      <Navbar />
      <Welcome />
    </JwtProvider>
  );
}

export default App;

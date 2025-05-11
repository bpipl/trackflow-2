import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logEnvironmentStatus, verifyNoExternalConnections } from './lib/envCheck';

// Log environment status
logEnvironmentStatus();

// Verify no external connections and log result
const connectionCheck = verifyNoExternalConnections();
console.info(`Connection check: ${connectionCheck.message}`);

// Create and render app
createRoot(document.getElementById("root")!).render(<App />);

// Type definitions for the extension

// Wallet provider interfaces
export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  isConnected: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (publicKey: any) => void) => void;
}

export interface SolflareProvider {
  publicKey?: { toString: () => string };
  isConnected: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
}

// Wallet detection result
export interface WalletDetectionResult {
  phantom: {
    detected: boolean;
    provider?: PhantomProvider;
  };
  solflare: {
    detected: boolean;
    provider?: SolflareProvider;
  };
}

// Wallet connection message
export interface WalletConnectionMessage {
  action: 'walletConnected' | 'wallet_connected' | 'checkWalletConnection' | 'openWalletConnect' | 'toggleDevelopmentMode';
  publicKey?: string;
  address?: string;
  source?: string;
}

// Wallet connection response
export interface WalletConnectionResponse {
  status: 'success' | 'error';
  message?: string;
}

// Window message event for wallet connection
export interface WalletConnectedWindowMessage {
  type: 'WALLET_CONNECTED';
  publicKey: string;
}

// Extension storage data
export interface ExtensionStorageData {
  walletConnected?: boolean;
  walletPublicKey?: string;
  useLocalDevelopment?: boolean;
}

// Declare global window interface
declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
    solflare?: SolflareProvider;
    solana?: PhantomProvider;
  }
} 
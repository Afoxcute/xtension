import { PhantomProvider, SolflareProvider } from '../types';

// Type definitions for the SolanaWalletAdapter
interface WalletResponse {
  publicKey: string;
  connected: boolean;
}

interface SignatureResponse {
  signature: string;
  publicKey: string;
}

type WalletCallback = (publicKey?: string) => void;

// Solana wallet adapter for browser extension
class SolanaWalletAdapter {
  private connected: boolean;
  publicKey: string | null;
  private autoApprove: boolean;
  private onConnectCallback: WalletCallback | null;
  private onDisconnectCallback: WalletCallback | null;
  private onAccountChangeCallback: WalletCallback | null;

  constructor() {
    this.connected = false;
    this.publicKey = null;
    this.autoApprove = false;
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
    this.onAccountChangeCallback = null;
  }

  // Check if Phantom wallet is installed
  static isPhantomInstalled(): boolean {
    return !!(window.phantom?.solana?.isPhantom);
  }

  // Check if Solflare wallet is installed
  static isSolflareInstalled(): boolean {
    return !!window.solflare;
  }

  // Get the installed wallet provider
  static getProvider(): PhantomProvider | SolflareProvider | null {
    // Try to get Phantom provider - preferred way is through window.phantom.solana
    if (window.phantom?.solana?.isPhantom) {
      return window.phantom.solana;
    }
    // Legacy support for older Phantom versions
    else if (window.solana?.isPhantom) {
      return window.solana;
    }
    // Try to get Solflare provider
    else if (window.solflare) {
      return window.solflare;
    }
    return null;
  }

  // Setup listeners
  private setupListeners(provider: PhantomProvider | SolflareProvider): void {
    if ('on' in provider) {
      // Only setup listeners for Phantom which has the 'on' method
      const phantomProvider = provider as PhantomProvider;
      phantomProvider.on('disconnect', this.handleDisconnect.bind(this));
      phantomProvider.on('accountChanged', this.handleAccountChange.bind(this));
    }
  }

  // Connect to wallet
  async connect(): Promise<WalletResponse> {
    try {
      // Check if we're in a browser context
      if (typeof window === 'undefined') {
        throw new Error('Cannot connect to wallet: Not in browser context');
      }

      // Check for Phantom wallet in different possible locations
      const hasPhantom = !!(window.phantom?.solana?.isPhantom);
      const hasLegacyPhantom = !!(window.solana?.isPhantom);
      
      // Check for Solflare wallet
      const hasSolflare = !!window.solflare;
      
      // Log wallet detection status with detailed information
      console.log('Wallet detection:', { 
        phantom: {
          detected: hasPhantom || hasLegacyPhantom,
          modern: hasPhantom,
          legacy: hasLegacyPhantom,
          windowPhantom: typeof window.phantom !== 'undefined',
          windowPhantomSolana: typeof window.phantom?.solana !== 'undefined',
          windowSolana: typeof window.solana !== 'undefined'
        },
        solflare: {
          detected: hasSolflare,
          windowSolflare: typeof window.solflare !== 'undefined'
        }
      });
      
      const provider = SolanaWalletAdapter.getProvider();
      
      if (!provider) {
        console.error('No wallet provider found. Window objects:', {
          phantom: {
            exists: typeof window.phantom !== 'undefined',
            solana: typeof window.phantom?.solana !== 'undefined',
            isPhantom: !!(window.phantom?.solana?.isPhantom)
          },
          solana: {
            exists: typeof window.solana !== 'undefined',
            isPhantom: !!(window.solana?.isPhantom)
          },
          solflare: typeof window.solflare !== 'undefined'
        });
        
        throw new Error('No Solana wallet found. Please install Phantom or Solflare extension and reload the page');
      }

      // Connect to the wallet
      console.log('Connecting to wallet provider:', provider);
      const response = await provider.connect();
      
      this.connected = true;
      this.publicKey = response.publicKey.toString();
      console.log('Connected to wallet:', this.publicKey);
      
      // Setup listeners
      this.setupListeners(provider);
      
      // Call connect callback if exists
      if (this.onConnectCallback) {
        this.onConnectCallback(this.publicKey);
      }
      
      return {
        publicKey: this.publicKey,
        connected: this.connected
      };
    } catch (error) {
      console.error('Error connecting to Solana wallet:', error);
      throw error;
    }
  }

  // Disconnect from wallet
  async disconnect(): Promise<void> {
    const provider = SolanaWalletAdapter.getProvider();
    
    if (provider && this.connected) {
      await provider.disconnect();
      this.handleDisconnect();
    }
  }

  // Handle disconnect event
  private handleDisconnect(): void {
    this.connected = false;
    this.publicKey = null;
    
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }
  }

  // Handle account change event
  private handleAccountChange(publicKey: any): void {
    if (publicKey) {
      this.publicKey = publicKey.toString();
      
      if (this.onAccountChangeCallback) {
        // Pass the publicKey as a string to match the WalletCallback type
        const publicKeyString = this.publicKey || undefined;
        this.onAccountChangeCallback(publicKeyString);
      }
    } else {
      // If publicKey is null, handle as disconnect
      this.handleDisconnect();
    }
  }

  // Sign a message
  async signMessage(message: string): Promise<SignatureResponse> {
    try {
      const provider = SolanaWalletAdapter.getProvider();
      
      if (!provider || !this.connected || !this.publicKey) {
        throw new Error('Wallet not connected');
      }
      
      // Convert string message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);
      
      // Sign the message
      const { signature } = await provider.signMessage(messageBytes);
      
      return {
        signature: Buffer.from(signature).toString('hex'),
        publicKey: this.publicKey as string // Cast to string since we've already checked it's not null
      };
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  // Event listeners
  on(event: string, callback: WalletCallback): void {
    switch (event) {
      case 'connect':
        this.onConnectCallback = callback;
        break;
      case 'disconnect':
        this.onDisconnectCallback = callback;
        break;
      case 'accountChanged':
        this.onAccountChangeCallback = callback;
        break;
      default:
        console.warn(`Event ${event} not supported`);
    }
  }
}

export default SolanaWalletAdapter; 
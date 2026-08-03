import PusherClient from 'pusher-js';

// Singleton instance to prevent multiple connections during hot-reloads in dev
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (!pusherClientInstance) {
    PusherClient.logToConsole = false;
    pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
      authEndpoint: '/api/pusher/auth',
    });
  }
  return pusherClientInstance;
};

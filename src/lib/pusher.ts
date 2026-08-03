import Pusher from 'pusher';

const globalForPusher = globalThis as unknown as {
  pusher: Pusher | undefined;
};

export const pusher = globalForPusher.pusher ?? new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
  useTLS: true,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPusher.pusher = pusher;
}

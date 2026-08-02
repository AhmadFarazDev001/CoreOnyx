import { redirect } from 'next/navigation';

/**
 * Root index route.
 * Redirects all incoming traffic to the default authenticated landing page.
 */
export default function Home() {
  redirect('/announcements');
}

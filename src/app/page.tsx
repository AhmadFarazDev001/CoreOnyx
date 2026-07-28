import { redirect } from 'next/navigation';

export default function Home() {
  // In Phase 1, just redirect to the student announcements page
  redirect('/announcements');
}

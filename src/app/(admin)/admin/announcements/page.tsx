import { getAnnouncements } from '@/lib/actions/announcements';
import { AdminAnnouncementsClient } from './AdminAnnouncementsClient';

/**
 * Server Component for the Admin Announcements page.
 * Fetches all announcements securely and passes them to the client UI.
 */
export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();
  
  return <AdminAnnouncementsClient announcements={announcements} />;
}

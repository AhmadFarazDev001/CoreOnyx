import { getAnnouncements } from '@/lib/actions/announcements';
import { AdminAnnouncementsClient } from './AdminAnnouncementsClient';

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();
  
  return <AdminAnnouncementsClient announcements={announcements} />;
}

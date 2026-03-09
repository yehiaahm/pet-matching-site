import { useNavigate } from 'react-router-dom';
import { AdminSupportDashboard } from '../components/AdminSupportDashboard';

export default function AdminSupportPage() {
  const navigate = useNavigate();

  return <AdminSupportDashboard onClose={() => navigate('/admin')} />;
}

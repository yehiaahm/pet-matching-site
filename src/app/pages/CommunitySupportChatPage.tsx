import { useNavigate } from 'react-router-dom';
import { ChatSystem } from '../components/ChatSystem';

export default function CommunitySupportChatPage() {
  const navigate = useNavigate();

  return <ChatSystem isOpen={true} onClose={() => navigate('/community-support')} />;
}

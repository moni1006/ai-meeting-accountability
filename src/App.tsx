import { StoreProvider, useStore } from '@/lib/store';
import { RouterProvider, useRouter } from '@/lib/router';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { CreateMeeting } from '@/pages/CreateMeeting';
import { Analysis } from '@/pages/Analysis';
import { Accountability } from '@/pages/Accountability';
import { MeetingHistory } from '@/pages/History';
import { MeetingDetails } from '@/pages/MeetingDetails';
import { TaskDetails } from '@/pages/TaskDetails';

function Routes() {
  const { path } = useRouter();
  const { currentUser } = useStore();

  if (!currentUser) {
    return <Login />;
  }

  const parts = path.split('/').filter(Boolean);

  let page: React.ReactNode;
  if (path === '/' || path === '/dashboard') {
    page = <Dashboard />;
  } else if (path === '/create') {
    page = <CreateMeeting />;
  } else if (parts[0] === 'analysis' && parts[1]) {
    page = <Analysis meetingId={parts[1]} />;
  } else if (path === '/accountability') {
    page = <Accountability />;
  } else if (path === '/history') {
    page = <MeetingHistory />;
  } else if (parts[0] === 'meeting' && parts[1]) {
    page = <MeetingDetails meetingId={parts[1]} />;
  } else if (parts[0] === 'task' && parts[1]) {
    page = <TaskDetails taskId={parts[1]} />;
  } else {
    page = <Dashboard />;
  }

  return <Layout>{page}</Layout>;
}

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider>
        <Routes />
      </RouterProvider>
    </StoreProvider>
  );
}

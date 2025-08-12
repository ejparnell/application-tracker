/**
 * @fileoverview Loading component for the dashboard section.
 * Displays a loading spinner while dashboard content is being fetched or rendered.
 * 
 * @author ejparnell
 * @since 1.0.0
 */
import Loading from '@/components/ui/Loading';

export default function DashboardLoading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh' 
    }}>
      <Loading size="large" />
    </div>
  );
}
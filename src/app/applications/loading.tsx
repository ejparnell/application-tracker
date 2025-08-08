import Loading from '@/components/ui/Loading';

export default function ApplicationsLoading() {
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
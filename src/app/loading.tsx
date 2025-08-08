import Loading from '@/components/ui/Loading';

export default function LoadingPage() {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh' 
        }}>
            <Loading size="large" />
        </div>
    );
}

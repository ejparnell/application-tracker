import Text from '@/components/ui/Text';
import { ApplicationStatus } from '@/types/applications';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusDisplay = (status: ApplicationStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Available', emoji: '📋' };
      case 'applied':
        return { label: 'Applied', emoji: '✅' };
      case 'interview':
        return { label: 'Interview', emoji: '🎯' };
      case 'rejected':
        return { label: 'Rejected', emoji: '❌' };
      case 'hidden':
        return { label: 'Hidden', emoji: '👁️' };
      default:
        return { label: 'Unknown', emoji: '❓' };
    }
  };

  const { label, emoji } = getStatusDisplay(status);

  return (
    <div className={`${styles.badge} ${styles[status]} ${styles[size]}`}>
      <span className={styles.emoji}>{emoji}</span>
      <Text 
        variant={size === 'small' ? 'caption' : 'body-small'} 
        className={styles.label}
      >
        {label}
      </Text>
    </div>
  );
}

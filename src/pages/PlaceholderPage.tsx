import React from 'react';
import { LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  icon,
  emptyTitle,
  emptyDescription,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="space-y-6">
      <EmptyState
        icon={icon}
        title={emptyTitle}
        description={emptyDescription}
        action={
          actionLabel ? (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : undefined
        }
        className="py-20 bg-white/80"
      />
    </div>
  );
};

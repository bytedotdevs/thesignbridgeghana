import React from 'react';
import { GSLSearchIndexItem, ViewMode } from '../../types/dictionary';
import { VocabularyCard } from './VocabularyCard';
import { GridSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from './EmptyState';

interface VocabularyGridProps {
  items: GSLSearchIndexItem[];
  isLoading: boolean;
  viewMode: ViewMode;
  onSelectItem: (item: GSLSearchIndexItem) => void;
  onResetFilters?: () => void;
}

export const VocabularyGrid: React.FC<VocabularyGridProps> = ({
  items,
  isLoading,
  viewMode,
  onSelectItem,
  onResetFilters,
}) => {
  if (isLoading) {
    return <GridSkeleton count={8} />;
  }

  if (!items.length) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          viewMode === 'list'
            ? '1fr'
            : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        width: '100%',
      }}
    >
      {items.map((item) => (
        <VocabularyCard
          key={item.id}
          item={item}
          onClick={onSelectItem}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

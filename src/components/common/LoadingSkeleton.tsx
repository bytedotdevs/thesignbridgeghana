import React from 'react';

export const VocabularyCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(220, 230, 245, 0.6)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        className="skeleton-loading"
        style={{ width: '100%', height: '160px', borderRadius: '12px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          className="skeleton-loading"
          style={{ width: '60%', height: '22px', borderRadius: '6px' }}
        />
        <div
          className="skeleton-loading"
          style={{ width: '25%', height: '18px', borderRadius: '9999px' }}
        />
      </div>
      <div
        className="skeleton-loading"
        style={{ width: '90%', height: '14px', borderRadius: '4px' }}
      />
      <div
        className="skeleton-loading"
        style={{ width: '70%', height: '14px', borderRadius: '4px' }}
      />
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '20px',
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <VocabularyCardSkeleton key={i} />
      ))}
    </div>
  );
};

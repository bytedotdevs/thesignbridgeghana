import React from 'react';
import { Search, Sparkles, RefreshCw } from 'lucide-react';
import { LiquidChromeButton } from '../common/LiquidChromeButton';

export const EmptyState: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  return (
    <div
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(220, 230, 245, 0.7)',
        borderRadius: '24px',
        maxWidth: '560px',
        margin: '40px auto',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}
      >
        <Search size={28} color="var(--brand-blue)" />
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '8px' }}>
        No Ghanaian Sign Language vocabulary found
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
        We couldn't find any signs matching your active search or filter combination. Try adjusting your search query, or reset the filters to browse all 1,500+ official GSL entries.
      </p>

      {onReset && (
        <LiquidChromeButton
          variant="primary"
          size="md"
          icon={<RefreshCw size={16} />}
          onClick={onReset}
        >
          Reset All Filters
        </LiquidChromeButton>
      )}
    </div>
  );
};

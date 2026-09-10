import React from 'react';
import { useDictionary } from '../../context/DictionaryContext';
import {
  Palette,
  Users,
  BookOpen,
  Home,
  Utensils,
  PawPrint,
  Briefcase,
  Coins,
  HelpCircle,
  Activity,
  Trophy,
  Compass,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Smile,
  Clock,
  Navigation,
  MapPin,
  Building2,
  Church,
  Calendar,
  Sparkles,
  Cpu,
  Layers,
} from 'lucide-react';

export const CategoryPills: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useDictionary();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette': return <Palette size={14} />;
      case 'Users': return <Users size={14} />;
      case 'BookOpen': return <BookOpen size={14} />;
      case 'Home': return <Home size={14} />;
      case 'Utensils': return <Utensils size={14} />;
      case 'PawPrint': return <PawPrint size={14} />;
      case 'Briefcase': return <Briefcase size={14} />;
      case 'Coins': return <Coins size={14} />;
      case 'HelpCircle': return <HelpCircle size={14} />;
      case 'Activity': return <Activity size={14} />;
      case 'Trophy': return <Trophy size={14} />;
      case 'Compass': return <Compass size={14} />;
      case 'GraduationCap': return <GraduationCap size={14} />;
      case 'HeartPulse': return <HeartPulse size={14} />;
      case 'Lightbulb': return <Lightbulb size={14} />;
      case 'Smile': return <Smile size={14} />;
      case 'Clock': return <Clock size={14} />;
      case 'Navigation': return <Navigation size={14} />;
      case 'MapPin': return <MapPin size={14} />;
      case 'Building2': return <Building2 size={14} />;
      case 'Church': return <Church size={14} />;
      case 'Calendar': return <Calendar size={14} />;
      case 'Sparkles': return <Sparkles size={14} />;
      case 'Cpu': return <Cpu size={14} />;
      default: return <Layers size={14} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 0 14px 0',
        scrollbarWidth: 'thin',
      }}
      className="category-pills-row"
    >
      <button
        onClick={() => setSelectedCategory(null)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: selectedCategory === null ? 700 : 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          backgroundColor: selectedCategory === null ? 'var(--ink-primary)' : 'rgba(255, 255, 255, 0.9)',
          color: selectedCategory === null ? '#ffffff' : 'var(--ink-secondary)',
          border: selectedCategory === null ? '1px solid var(--ink-primary)' : '1px solid rgba(200, 215, 235, 0.7)',
          boxShadow: selectedCategory === null ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <Layers size={14} />
        <span>All Categories</span>
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: isSelected ? 700 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: isSelected ? 'var(--ink-primary)' : 'rgba(255, 255, 255, 0.9)',
              color: isSelected ? '#ffffff' : 'var(--ink-primary)',
              border: isSelected ? '1px solid var(--ink-primary)' : '1px solid rgba(200, 215, 235, 0.7)',
              boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {getCategoryIcon(cat.icon)}
            <span>{cat.name}</span>
            <span
              style={{
                fontSize: '11px',
                opacity: isSelected ? 0.9 : 0.6,
                fontWeight: 500,
              }}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

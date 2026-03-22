import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { categories } from '../data/mockBusinesses';
import type { Business } from '../data/types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelectBusiness?: (id: string) => void;
  initialQuery?: string;
  businesses?: Business[];
}

interface Suggestion {
  type: 'business' | 'category' | 'tag';
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  exclusive?: boolean;
  category?: string;
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    restaurant: '\u{1F37D}\uFE0F',
    cafe: '\u2615',
    bakery: '\u{1F950}',
    retail: '\u{1F6CD}\uFE0F',
    grocery: '\u{1F96C}',
    salon: '\u{1F487}',
    repair: '\u{1F527}',
    art: '\u{1F3A8}',
  };
  return map[category.toLowerCase()] || '\u{1F4CD}';
}

export default function SearchBar({ onSearch, onSelectBusiness, initialQuery = '', businesses = [] }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const suggestions = getSuggestions(query);

  function getSuggestions(q: string): Suggestion[] {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) return [];

    const results: Suggestion[] = [];

    const bizMatches = businesses
      .filter((b) => b.name.toLowerCase().includes(trimmed))
      .slice(0, 5)
      .map((b): Suggestion => ({
        type: 'business',
        id: b.id,
        label: b.name,
        sublabel: b.category,
        category: b.category,
        exclusive: !b.onGoogle,
      }));
    results.push(...bizMatches);

    const catMatches = categories
      .filter((c) => c.value !== 'all' && c.label.toLowerCase().includes(trimmed))
      .slice(0, 2)
      .map((c): Suggestion => ({
        type: 'category',
        id: c.value,
        label: `Search all ${c.label}`,
        icon: c.icon,
      }));
    results.push(...catMatches);

    const allTags = new Set(businesses.flatMap((b) => b.tags));
    const tagMatch = [...allTags].find((t) => t.toLowerCase().includes(trimmed));
    if (tagMatch) {
      results.push({
        type: 'tag',
        id: tagMatch,
        label: `Search '${tagMatch}' in all businesses`,
      });
    }

    return results.slice(0, 8);
  }

  const handleSelect = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.type === 'business') {
        setQuery(suggestion.label);
        onSelectBusiness?.(suggestion.id);
      } else {
        const searchTerm = suggestion.id;
        setQuery('');
        onSearch(searchTerm);
      }
      setShowDropdown(false);
      setHighlightedIndex(-1);
    },
    [onSearch, onSelectBusiness],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        } else {
          onSearch(query);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(val.trim().length >= 1);
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    if (query.trim().length >= 1) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
    onSearch('');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search hidden businesses near you..."
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-lg shadow-gray-100 transition-all text-sm"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-activedescendant={
            highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
          }
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden py-2"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.type}-${suggestion.id}`}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={highlightedIndex === index}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors text-sm ${
                highlightedIndex === index
                  ? 'bg-gray-50'
                  : 'hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(suggestion);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion.type === 'business' && (
                <>
                  <span className="text-base leading-none flex-shrink-0">
                    {getCategoryEmoji(suggestion.category || '')}
                  </span>
                  <span className="text-gray-900 font-medium truncate">{suggestion.label}</span>
                  {suggestion.exclusive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e88c0a] flex-shrink-0" />
                  )}
                  <span className="ml-auto text-xs text-gray-400 capitalize flex-shrink-0">
                    {suggestion.sublabel}
                  </span>
                </>
              )}
              {suggestion.type === 'category' && (
                <>
                  <span className="text-base leading-none flex-shrink-0">
                    {suggestion.icon}
                  </span>
                  <span className="text-gray-600">{suggestion.label}</span>
                </>
              )}
              {suggestion.type === 'tag' && (
                <>
                  <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{suggestion.label}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

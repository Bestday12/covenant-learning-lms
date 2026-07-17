import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  Download,
  RotateCcw,
  LayoutGrid,
  Grid3x3,
  List,
  ArrowUp,
  ArrowDown,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Plus,
  Trash2,
  Circle,
  CalendarDays,
  CalendarRange,
  Archive,
} from 'lucide-react';

const EMPTY_FILTERS = {};

const countActiveFilters = (filters = {}) => {
  const filterKeys = [
    'status',
    'category',
    'instructor',
    'priceMin',
    'priceMax',
    'dateRange',
    'difficulty',
    'rating',
  ];

  return filterKeys.reduce((count, key) => {
    const value = filters[key];
    if (
      value === '' ||
      value === null ||
      value === undefined ||
      value === 'all' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return count;
    }
    return count + 1;
  }, 0);
};

const CourseFilters = ({
  courses = [],
  filters = EMPTY_FILTERS,
  searchQuery = '',
  sortBy = 'title',
  sortOrder = 'asc',
  viewMode = 'grid',
  selectedItems = [],
  onFilterChange,
  onSearchChange,
  onSortChange,
  onViewChange,
  onSelectionChange,
  onBulkAction,
  statusOptions = ['all', 'published', 'draft', 'archived'],
  categoryOptions = [],
  instructorOptions = [],
  priceRangeOptions = { min: 0, max: 1000 },
  dateRangeOptions = ['all', 'today', 'week', 'month', 'quarter', 'year'],
  placeholder = 'Search courses...',
  title = 'Courses',
  onExport,
  onSaveFilterPreset,
  onLoadFilterPreset,
  onDeleteFilterPreset,
  onClearFilters,
  isLoading = false,
  totalResults = 0,
  isSelectable = true,
  className = '',
  showBulkActions = true,
  showViewToggle = true,
  showFilterPresets = true,
  compact = false,
}) => {
  const [isDesktopFiltersOpen, setIsDesktopFiltersOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filterPresets, setFilterPresets] = useState([]);
  const [activePreset, setActivePreset] = useState(null);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const searchInputRef = useRef(null);
  const filterPanelRef = useRef(null);

  const isMobile =
    typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const filterBadgeCount = useMemo(() => countActiveFilters(filters), [filters]);

  const selectedCount = selectedItems.length;
  const isSelectAll =
    courses.length > 0 && selectedItems.length === courses.length;

  const statusDisplay = useMemo(
    () => ({
      all: {
        label: 'All Statuses',
        icon: <Circle className="h-3.5 w-3.5" />,
      },
      published: {
        label: 'Published',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      },
      draft: {
        label: 'Draft',
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      },
      archived: {
        label: 'Archived',
        icon: <EyeOff className="h-3.5 w-3.5" />,
      },
    }),
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: 'title', label: 'Title A-Z' },
      { value: 'createdAt', label: 'Date Created' },
      { value: 'updatedAt', label: 'Date Updated' },
      { value: 'studentCount', label: 'Most Popular' },
      { value: 'price', label: 'Price' },
      { value: 'rating', label: 'Rating' },
      { value: 'completionRate', label: 'Completion Rate' },
    ],
    []
  );

  const bulkActions = useMemo(
    () => [
      {
        id: 'publish',
        label: 'Publish Selected',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        color: 'text-emerald-600',
      },
      {
        id: 'unpublish',
        label: 'Unpublish Selected',
        icon: <EyeOff className="h-3.5 w-3.5" />,
        color: 'text-amber-600',
      },
      {
        id: 'archive',
        label: 'Archive Selected',
        icon: <Archive className="h-3.5 w-3.5" />,
        color: 'text-slate-600',
      },
      {
        id: 'delete',
        label: 'Delete Selected',
        icon: <Trash2 className="h-3.5 w-3.5" />,
        color: 'text-rose-600',
      },
      {
        id: 'export',
        label: 'Export Selected',
        icon: <Download className="h-3.5 w-3.5" />,
        color: 'text-indigo-600',
      },
    ],
    []
  );

  const emitFilters = useCallback(
    (updates) => {
      onFilterChange?.({
        ...filters,
        ...updates,
      });
    },
    [filters, onFilterChange]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      emitFilters({ [key]: value });

      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsMobileFiltersOpen(false);
      }
    },
    [emitFilters]
  );

  const handleClearFilters = useCallback(() => {
    onFilterChange?.({});
    onSearchChange?.('');
    onSortChange?.('title', 'asc');
    setActivePreset(null);
    onClearFilters?.();
  }, [onFilterChange, onSearchChange, onSortChange, onClearFilters]);

  const handleSortChange = useCallback(
    (newSortBy) => {
      const nextOrder =
        sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
      onSortChange?.(newSortBy, nextOrder);
    },
    [sortBy, sortOrder, onSortChange]
  );

  const handleToggleSortOrder = useCallback(() => {
    onSortChange?.(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  }, [sortBy, sortOrder, onSortChange]);

  const handleViewChange = useCallback(
    (newView) => {
      onViewChange?.(newView);
    },
    [onViewChange]
  );

  const handleSelectAll = useCallback(() => {
    if (isSelectAll) {
      onSelectionChange?.([]);
      return;
    }
    onSelectionChange?.(courses.map((course) => course.id).filter(Boolean));
  }, [isSelectAll, onSelectionChange, courses]);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const preset = {
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      filters,
      searchQuery,
      sortBy,
      sortOrder,
      viewMode,
    };

    setFilterPresets((prev) => [...prev, preset]);
    setActivePreset(preset.id);
    setShowSavePresetModal(false);
    setPresetName('');
    onSaveFilterPreset?.(preset);
  }, [
    presetName,
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    viewMode,
    onSaveFilterPreset,
  ]);

  const handleLoadPreset = useCallback(
    (preset) => {
      onFilterChange?.(preset.filters || {});
      onSearchChange?.(preset.searchQuery || '');
      onSortChange?.(preset.sortBy || 'title', preset.sortOrder || 'asc');
      onViewChange?.(preset.viewMode || 'grid');
      setActivePreset(preset.id);
      onLoadFilterPreset?.(preset);
    },
    [
      onFilterChange,
      onSearchChange,
      onSortChange,
      onViewChange,
      onLoadFilterPreset,
    ]
  );

  const handleDeletePreset = useCallback(
    (presetId) => {
      setFilterPresets((prev) => prev.filter((preset) => preset.id !== presetId));
      if (activePreset === presetId) {
        setActivePreset(null);
      }
      onDeleteFilterPreset?.(presetId);
    },
    [activePreset, onDeleteFilterPreset]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key === 'Escape') {
        if (searchQuery) onSearchChange?.('');
        setIsDesktopFiltersOpen(false);
        setIsMobileFiltersOpen(false);
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setIsMobileFiltersOpen((prev) => !prev);
        } else {
          setIsDesktopFiltersOpen((prev) => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchChange]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target) &&
        typeof window !== 'undefined' &&
        window.innerWidth < 768
      ) {
        setIsMobileFiltersOpen(false);
      }
    };

    if (isMobileFiltersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileFiltersOpen]);

  const renderSearchBar = () => (
    <div className="relative flex-1">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <Search className="h-4 w-4" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchChange?.(searchQuery);
        }}
      >
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
            compact ? 'py-2 text-xs' : ''
          }`}
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange?.('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      <div className="absolute bottom-0 right-3 -translate-y-1/2 text-[10px] text-slate-400">
        <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono">
          ⌘/Ctrl K
        </kbd>
      </div>
    </div>
  );

  const renderSortControls = () => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className={`appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-8 text-sm font-medium text-slate-700 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
            compact ? 'py-1.5 text-xs' : ''
          }`}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      <button
        type="button"
        onClick={handleToggleSortOrder}
        className={`rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 ${
          compact ? 'p-1.5' : ''
        }`}
        aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  const renderViewToggle = () => {
    if (!showViewToggle) return null;

    const views = [
      { id: 'grid', icon: <LayoutGrid className="h-4 w-4" />, label: 'Grid' },
      { id: 'list', icon: <List className="h-4 w-4" />, label: 'List' },
      { id: 'compact', icon: <Grid3x3 className="h-4 w-4" />, label: 'Compact' },
    ];

    return (
      <div className="flex rounded-xl border border-slate-200 bg-white p-0.5">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => handleViewChange(view.id)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              viewMode === view.id
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            } ${compact ? 'px-2 py-1 text-[10px]' : ''}`}
            aria-label={view.label}
          >
            {view.icon}
          </button>
        ))}
      </div>
    );
  };

  const renderFilterPanel = () => {
    const panelIsOpen = isMobile ? isMobileFiltersOpen : isDesktopFiltersOpen;
    if (!panelIsOpen) return null;

    return (
      <div
        ref={filterPanelRef}
        className={`bg-white border border-slate-200 shadow-lg ${
          isMobile
            ? 'fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl p-4'
            : 'relative rounded-2xl p-5'
        }`}
      >
        {isMobile ? (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">Filters</h3>
              {filterBadgeCount > 0 ? (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  {filterBadgeCount}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        <div className="space-y-5">
          <FilterSection label="Status">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => {
                const display = statusDisplay[status] || {
                  label: status,
                  icon: <Circle className="h-3.5 w-3.5" />,
                };
                const isActive =
                  filters.status === status || (!filters.status && status === 'all');

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      handleFilterChange('status', status === 'all' ? '' : status)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${
                      isActive
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {display.icon}
                    {display.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {categoryOptions.length > 0 ? (
            <FilterSection label="Category">
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => {
                  const isActive =
                    filters.category === category.value ||
                    (!filters.category && category.value === 'all');

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() =>
                        handleFilterChange(
                          'category',
                          category.value === 'all' ? '' : category.value
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${
                        isActive
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {category.icon ? (
                        <span className="text-slate-400">{category.icon}</span>
                      ) : null}
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>
          ) : null}

          {priceRangeOptions ? (
            <FilterSection label="Price Range">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    £
                  </span>
                  <input
                    type="number"
                    min={priceRangeOptions.min}
                    max={priceRangeOptions.max}
                    value={filters.priceMin || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'priceMin',
                        e.target.value ? Number(e.target.value) : ''
                      )
                    }
                    placeholder="Min"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 pl-6 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <span className="text-sm text-slate-400">to</span>

                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    £
                  </span>
                  <input
                    type="number"
                    min={priceRangeOptions.min}
                    max={priceRangeOptions.max}
                    value={filters.priceMax || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'priceMax',
                        e.target.value ? Number(e.target.value) : ''
                      )
                    }
                    placeholder="Max"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 pl-6 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </FilterSection>
          ) : null}

          <FilterSection label="Date Range">
            <div className="flex flex-wrap gap-2">
              {dateRangeOptions.map((range) => {
                const isActive =
                  filters.dateRange === range || (range === 'all' && !filters.dateRange);

                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() =>
                      handleFilterChange('dateRange', range === 'all' ? '' : range)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${
                      isActive
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {range === 'all' ? <Calendar className="h-3.5 w-3.5" /> : null}
                    {range === 'today' ? (
                      <CalendarDays className="h-3.5 w-3.5" />
                    ) : null}
                    {range === 'week' || range === 'quarter' ? (
                      <CalendarRange className="h-3.5 w-3.5" />
                    ) : null}
                    {range === 'month' || range === 'year' ? (
                      <CalendarDays className="h-3.5 w-3.5" />
                    ) : null}
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {filterBadgeCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Active filters:</span>

              {filters.status ? (
                <FilterBadge
                  label={`Status: ${statusDisplay[filters.status]?.label || filters.status}`}
                  onRemove={() => handleFilterChange('status', '')}
                />
              ) : null}

              {filters.category ? (
                <FilterBadge
                  label={`Category: ${
                    categoryOptions.find((c) => c.value === filters.category)?.label ||
                    filters.category
                  }`}
                  onRemove={() => handleFilterChange('category', '')}
                />
              ) : null}

              {filters.priceMin ? (
                <FilterBadge
                  label={`Min: £${filters.priceMin}`}
                  onRemove={() => handleFilterChange('priceMin', '')}
                />
              ) : null}

              {filters.priceMax ? (
                <FilterBadge
                  label={`Max: £${filters.priceMax}`}
                  onRemove={() => handleFilterChange('priceMax', '')}
                />
              ) : null}

              {filters.dateRange ? (
                <FilterBadge
                  label={`Date: ${
                    filters.dateRange.charAt(0).toUpperCase() +
                    filters.dateRange.slice(1)
                  }`}
                  onRemove={() => handleFilterChange('dateRange', '')}
                />
              ) : null}

              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline"
              >
                Clear all
              </button>
            </div>
          ) : null}

          {showFilterPresets ? (
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Saved Presets
                </span>
                <button
                  type="button"
                  onClick={() => setShowSavePresetModal(true)}
                  className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                >
                  <Plus className="h-3 w-3" />
                  Save Current
                </button>
              </div>

              {filterPresets.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filterPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                        activePreset === preset.id
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleLoadPreset(preset)}
                        className="inline-flex items-center gap-1.5"
                      >
                        <BookOpen className="h-3 w-3" />
                        {preset.name}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="ml-1 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                        aria-label={`Delete preset ${preset.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All
            </button>

            {isMobile ? (
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const renderResultsCount = () => (
    <div className="flex items-center gap-1 text-sm text-slate-500">
      <span className="font-medium text-slate-900">{totalResults}</span>
      <span>course{totalResults !== 1 ? 's' : ''}</span>
      {filterBadgeCount > 0 ? (
        <span className="ml-1.5 text-xs text-slate-400">
          • <span className="font-medium">{filterBadgeCount}</span> filter
          {filterBadgeCount !== 1 ? 's' : ''} active
        </span>
      ) : null}
      {isLoading ? (
        <Loader2 className="ml-2 h-4 w-4 animate-spin text-indigo-500" />
      ) : null}
    </div>
  );

  const renderBulkActions = () => {
    if (!showBulkActions || selectedCount === 0) return null;

    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-900">
              {selectedCount} selected
            </span>
            <button
              type="button"
              onClick={() => onSelectionChange?.([])}
              className="text-xs text-slate-400 transition hover:text-slate-600"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onBulkAction?.(action.id, selectedItems)}
                className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 ${action.color}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            ) : null}
          </div>

          <div className="max-w-md flex-1">{renderSearchBar()}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isMobile) {
                setIsMobileFiltersOpen((prev) => !prev);
              } else {
                setIsDesktopFiltersOpen((prev) => !prev);
              }
            }}
            className={`relative inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              filterBadgeCount > 0
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            } ${compact ? 'px-3 py-2 text-xs' : ''}`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {filterBadgeCount > 0 ? (
              <span className="rounded-full bg-indigo-200 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {filterBadgeCount}
              </span>
            ) : null}
          </button>

          {renderSortControls()}
          {renderViewToggle()}
        </div>
      </div>

      {renderFilterPanel()}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {renderResultsCount()}

        <div className="flex items-center gap-3">
          {isSelectable && courses.length > 0 ? (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              {isSelectAll ? 'Deselect All' : 'Select All'}
            </button>
          ) : null}

          {onExport ? (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          ) : null}
        </div>
      </div>

      {renderBulkActions()}

      {showSavePresetModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Save Filter Preset
              </h3>
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100"
                aria-label="Close preset modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Save your current filter settings for quick access later.
            </p>

            <div className="mt-4">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePreset();
                  if (e.key === 'Escape') setShowSavePresetModal(false);
                }}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex-1 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const FilterSection = ({ label, children }) => (
  <div>
    <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
      {label}
    </p>
    {children}
  </div>
);

const FilterBadge = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="rounded-full p-0.5 text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-600"
      aria-label={`Remove ${label}`}
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

FilterSection.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

FilterBadge.propTypes = {
  label: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
};

CourseFilters.propTypes = {
  courses: PropTypes.array,
  filters: PropTypes.object,
  searchQuery: PropTypes.string,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.oneOf(['asc', 'desc']),
  viewMode: PropTypes.oneOf(['grid', 'list', 'compact']),
  selectedItems: PropTypes.array,
  onFilterChange: PropTypes.func,
  onSearchChange: PropTypes.func,
  onSortChange: PropTypes.func,
  onViewChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onBulkAction: PropTypes.func,
  statusOptions: PropTypes.array,
  categoryOptions: PropTypes.array,
  instructorOptions: PropTypes.array,
  priceRangeOptions: PropTypes.object,
  dateRangeOptions: PropTypes.array,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  onExport: PropTypes.func,
  onSaveFilterPreset: PropTypes.func,
  onLoadFilterPreset: PropTypes.func,
  onDeleteFilterPreset: PropTypes.func,
  onClearFilters: PropTypes.func,
  isLoading: PropTypes.bool,
  totalResults: PropTypes.number,
  isSelectable: PropTypes.bool,
  className: PropTypes.string,
  showBulkActions: PropTypes.bool,
  showViewToggle: PropTypes.bool,
  showFilterPresets: PropTypes.bool,
  compact: PropTypes.bool,
};

CourseFilters.defaultProps = {
  courses: [],
  filters: {},
  searchQuery: '',
  sortBy: 'title',
  sortOrder: 'asc',
  viewMode: 'grid',
  selectedItems: [],
  onFilterChange: undefined,
  onSearchChange: undefined,
  onSortChange: undefined,
  onViewChange: undefined,
  onSelectionChange: undefined,
  onBulkAction: undefined,
  statusOptions: ['all', 'published', 'draft', 'archived'],
  categoryOptions: [],
  instructorOptions: [],
  priceRangeOptions: { min: 0, max: 1000 },
  dateRangeOptions: ['all', 'today', 'week', 'month', 'quarter', 'year'],
  placeholder: 'Search courses...',
  title: 'Courses',
  onExport: undefined,
  onSaveFilterPreset: undefined,
  onLoadFilterPreset: undefined,
  onDeleteFilterPreset: undefined,
  onClearFilters: undefined,
  isLoading: false,
  totalResults: 0,
  isSelectable: true,
  className: '',
  showBulkActions: true,
  showViewToggle: true,
  showFilterPresets: true,
  compact: false,
};

export default CourseFilters;
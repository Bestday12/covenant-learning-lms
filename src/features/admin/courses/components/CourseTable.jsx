import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Copy,
  Archive,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  X,
  MoreVertical,
  Download,
  Rocket,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Square,
  CheckSquare,
  MinusSquare,
  BookOpen,
} from 'lucide-react';

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

const statusMap = {
  draft: {
    label: 'Draft',
    icon: Clock,
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  },
  published: {
    label: 'Published',
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'border-slate-200 bg-slate-100 text-slate-500',
  },
  coming_soon: {
    label: 'Coming Soon',
    icon: Rocket,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  in_review: {
    label: 'In Review',
    icon: Loader2,
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
};

const normalizeOption = (item) =>
  typeof item === 'string'
    ? { key: item, label: item }
    : item;

const CourseTable = ({
  data = [],
  totalCount = 0,
  pageSize = 10,
  currentPage = 1,
  searchQuery = '',
  sortField = 'created_at',
  sortDirection = 'desc',
  selectedRows = [],
  onSearchChange,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  onRowClick,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onPublish,
  onUnpublish,
  onPreview,
  onBulkAction,
  onExport,
  onRefresh,
  isLoading = false,
  isSelectable = true,
  isSortable = true,
  columns = [],
  hiddenColumns = [],
  className = '',
  compact = false,
  bordered = true,
  striped = true,
  hoverable = true,
  showPagination = true,
  showSearch = true,
  showBulkActions = true,
  showRowNumbers = false,
  emptyMessage = 'No courses found',
  loadingMessage = 'Loading courses...',
  pageSizeOptions = DEFAULT_PAGE_SIZES,
}) => {
  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const searchInputRef = useRef(null);
  const rowMenuRef = useRef(null);

  const defaultColumns = useMemo(
    () => [
      {
        key: 'title',
        label: 'Course',
        sortable: true,
        width: 'min-w-[260px]',
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.image_url ? (
              <img
                src={row.image_url}
                alt={row.title || 'Course image'}
                className="h-11 w-11 flex-shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <BookOpen className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">
                {row.title || 'Untitled course'}
              </p>
              {row.subtitle ? (
                <p className="truncate text-xs text-slate-400">{row.subtitle}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        key: 'modules',
        label: 'Modules',
        sortable: false,
        width: 'w-28',
        render: (row) => {
          const modules = Array.isArray(row.modules) ? row.modules : [];
          return (
            <span className="text-sm text-slate-700">{modules.length}</span>
          );
        },
      },
      {
        key: 'price',
        label: 'Price',
        sortable: true,
        width: 'w-28',
        render: (row) => (
          <span className="text-sm text-slate-700">
            {row.price || row.price === 0 ? `£${row.price}` : '—'}
          </span>
        ),
      },
      {
        key: 'updated_at',
        label: 'Updated',
        sortable: true,
        width: 'w-32',
        render: (row) => (
          <span className="text-sm text-slate-600">
            {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '—'}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        width: 'w-32',
        render: (row) => <StatusBadge status={row.status || 'draft'} />,
      },
      {
        key: 'actions',
        label: '',
        sortable: false,
        width: 'w-16',
        align: 'right',
        render: (row) => (
          <RowActions
            row={row}
            isOpen={openRowMenuId === row.id}
            onToggle={() =>
              setOpenRowMenuId((prev) => (prev === row.id ? null : row.id))
            }
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onPreview={onPreview}
          />
        ),
      },
    ],
    [openRowMenuId, onArchive, onDelete, onDuplicate, onEdit, onPreview, onPublish, onUnpublish]
  );

  const visibleColumns = useMemo(() => {
    const merged = [...defaultColumns, ...columns];
    return merged.filter((column) => !hiddenColumns.includes(column.key));
  }, [defaultColumns, columns, hiddenColumns]);

  const selectedIds = selectedRows.filter(Boolean);
  const dataIds = useMemo(() => data.map((row) => row.id).filter(Boolean), [data]);
  const allVisibleSelected = dataIds.length > 0 && dataIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = dataIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startRow = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalCount);

  const handleSelectAll = useCallback(() => {
    if (!isSelectable) return;
    if (allVisibleSelected) {
      onSelectionChange?.(selectedIds.filter((id) => !dataIds.includes(id)));
      return;
    }
    const next = Array.from(new Set([...selectedIds, ...dataIds]));
    onSelectionChange?.(next);
  }, [allVisibleSelected, dataIds, isSelectable, onSelectionChange, selectedIds]);

  const handleSelectRow = useCallback(
    (id) => {
      if (!isSelectable || !id) return;
      const next = selectedIds.includes(id)
        ? selectedIds.filter((rowId) => rowId !== id)
        : [...selectedIds, id];
      onSelectionChange?.(next);
    },
    [isSelectable, onSelectionChange, selectedIds]
  );

  const handleSort = useCallback(
    (field) => {
      if (!isSortable || !field) return;
      const nextDirection =
        sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort?.(field, nextDirection);
    },
    [isSortable, onSort, sortDirection, sortField]
  );

  const handleExport = useCallback(
    (format = 'csv') => {
      const exportData = selectedIds.length > 0
        ? data.filter((row) => selectedIds.includes(row.id))
        : data;
      onExport?.(exportData, format);
    },
    [data, onExport, selectedIds]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && isSelectable) {
        e.preventDefault();
        handleSelectAll();
      }
      if (e.key === 'Escape') {
        setOpenRowMenuId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectAll, isSelectable]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target)) {
        setOpenRowMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {showSearch ? (
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
          ) : null}
          {onExport ? (
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          ) : null}
        </div>
      </div>

      {showBulkActions && selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <div className="text-sm font-medium text-indigo-800">
            {selectedIds.length} selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BulkActionButton icon={Rocket} label="Publish" onClick={() => onBulkAction?.('publish', selectedIds)} />
            <BulkActionButton icon={EyeOff} label="Unpublish" onClick={() => onBulkAction?.('unpublish', selectedIds)} />
            <BulkActionButton icon={Archive} label="Archive" onClick={() => onBulkAction?.('archive', selectedIds)} />
            <BulkActionButton danger icon={Trash2} label="Delete" onClick={() => onBulkAction?.('delete', selectedIds)} />
            <BulkActionButton icon={Download} label="Export" onClick={() => onBulkAction?.('export', selectedIds)} />
            <button
              type="button"
              onClick={() => onSelectionChange?.([])}
              className="rounded-xl px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {isSelectable ? (
                  <th className="w-12 px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="rounded p-1 text-slate-500 transition hover:bg-slate-100"
                      aria-label="Select all rows"
                    >
                      {allVisibleSelected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : someVisibleSelected ? (
                        <MinusSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                ) : null}

                {showRowNumbers ? (
                  <th className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                    #
                  </th>
                ) : null}

                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 ${column.width || ''} ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {column.sortable && isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="inline-flex items-center gap-1 transition hover:text-slate-600"
                      >
                        <span>{column.label}</span>
                        {sortField === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (isSelectable ? 1 : 0) + (showRowNumbers ? 1 : 0)}
                    className="px-4 py-16 text-center"
                  >
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {loadingMessage}
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (isSelectable ? 1 : 0) + (showRowNumbers ? 1 : 0)}
                    className="px-4 py-16 text-center text-sm text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id || index}
                      className={[
                        bordered ? 'border-t border-slate-100' : '',
                        striped && index % 2 === 1 ? 'bg-slate-50/50' : '',
                        hoverable ? 'hover:bg-slate-50' : '',
                        onRowClick ? 'cursor-pointer' : '',
                        isSelected ? 'bg-indigo-50/70' : '',
                      ].join(' ')}
                      onClick={() => onRowClick?.(row)}
                    >
                      {isSelectable ? (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleSelectRow(row.id)}
                            className="rounded p-1 text-slate-500 transition hover:bg-slate-100"
                            aria-label={`Select ${row.title || 'row'}`}
                          >
                            {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                      ) : null}

                      {showRowNumbers ? (
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                      ) : null}

                      {visibleColumns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 align-middle ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                          onClick={column.key === 'actions' ? (e) => e.stopPropagation() : undefined}
                        >
                          {column.render ? column.render(row) : row[column.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPagination ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{startRow}</span> to{' '}
            <span className="font-medium text-slate-900">{endRow}</span> of{' '}
            <span className="font-medium text-slate-900">{totalCount}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <span>Rows</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-1">
              <PagerButton onClick={() => onPageChange?.(1)} disabled={currentPage <= 1} icon={ChevronsLeft} />
              <PagerButton onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1} icon={ChevronLeft} />
              <span className="px-3 text-sm text-slate-600">
                Page <span className="font-medium text-slate-900">{currentPage}</span> of{' '}
                <span className="font-medium text-slate-900">{totalPages}</span>
              </span>
              <PagerButton onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages} icon={ChevronRight} />
              <PagerButton onClick={() => onPageChange?.(totalPages)} disabled={currentPage >= totalPages} icon={ChevronsRight} />
            </div>
          </div>
        </div>
      ) : null}

      <div ref={rowMenuRef} />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const entry = statusMap[status] || statusMap.draft;
  const Icon = entry.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${entry.className}`}>
      <Icon className={`h-3 w-3 ${status === 'in_review' ? 'animate-spin' : ''}`} />
      {entry.label}
    </span>
  );
};

const RowActions = ({
  row,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onPublish,
  onUnpublish,
  onPreview,
}) => {
  const actions = [
    { id: 'edit', label: 'Edit', icon: Edit2, onClick: () => onEdit?.(row) },
    { id: 'duplicate', label: 'Duplicate', icon: Copy, onClick: () => onDuplicate?.(row) },
    { id: 'preview', label: 'Preview', icon: Eye, onClick: () => onPreview?.(row) },
  ];

  if (row.status === 'draft' || row.status === 'coming_soon') {
    actions.push({ id: 'publish', label: 'Publish', icon: Rocket, onClick: () => onPublish?.(row), className: 'text-emerald-600 hover:bg-emerald-50' });
  }

  if (row.status === 'published') {
    actions.push({ id: 'unpublish', label: 'Unpublish', icon: EyeOff, onClick: () => onUnpublish?.(row), className: 'text-amber-600 hover:bg-amber-50' });
    actions.push({ id: 'archive', label: 'Archive', icon: Archive, onClick: () => onArchive?.(row), className: 'text-slate-600 hover:bg-slate-50' });
  }

  actions.push({ id: 'delete', label: 'Delete', icon: Trash2, onClick: () => onDelete?.(row), className: 'text-rose-600 hover:bg-rose-50' });

  return (
    <div className="relative inline-flex justify-end">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label="Open row actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-40 mt-1 min-w-[180px] rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  action.onClick();
                  onToggle();
                }}
                className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 ${action.className || ''}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const BulkActionButton = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${danger ? 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50' : 'border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100'}`}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

const PagerButton = ({ icon: Icon, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
  >
    <Icon className="h-4 w-4" />
  </button>
);

StatusBadge.propTypes = {
  status: PropTypes.string,
};

RowActions.propTypes = {
  row: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
  onArchive: PropTypes.func,
  onPublish: PropTypes.func,
  onUnpublish: PropTypes.func,
  onPreview: PropTypes.func,
};

BulkActionButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  danger: PropTypes.bool,
};

PagerButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

CourseTable.propTypes = {
  data: PropTypes.array,
  totalCount: PropTypes.number,
  pageSize: PropTypes.number,
  currentPage: PropTypes.number,
  searchQuery: PropTypes.string,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  selectedRows: PropTypes.array,
  onSearchChange: PropTypes.func,
  onSort: PropTypes.func,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onRowClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
  onArchive: PropTypes.func,
  onPublish: PropTypes.func,
  onUnpublish: PropTypes.func,
  onPreview: PropTypes.func,
  onBulkAction: PropTypes.func,
  onExport: PropTypes.func,
  onRefresh: PropTypes.func,
  isLoading: PropTypes.bool,
  isSelectable: PropTypes.bool,
  isSortable: PropTypes.bool,
  columns: PropTypes.array,
  hiddenColumns: PropTypes.array,
  className: PropTypes.string,
  compact: PropTypes.bool,
  bordered: PropTypes.bool,
  striped: PropTypes.bool,
  hoverable: PropTypes.bool,
  showPagination: PropTypes.bool,
  showSearch: PropTypes.bool,
  showBulkActions: PropTypes.bool,
  showRowNumbers: PropTypes.bool,
  emptyMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  pageSizeOptions: PropTypes.array,
};

export default CourseTable;

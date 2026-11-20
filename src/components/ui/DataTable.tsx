import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  selectable = true,
  selectedIds = [],
  onSelectChange,
  sortBy,
  sortOrder,
  onSort,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const allIds = data.map((d) => d.id);
  const isAllSelected =
    data.length > 0 && data.every((d) => selectedIds.includes(d.id));
  const isPartiallySelected =
    selectedIds.some((id) => allIds.includes(id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (!onSelectChange) return;
    if (isAllSelected) {
      onSelectChange(selectedIds.filter((id) => !allIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedIds, ...allIds]));
      onSelectChange(merged);
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectChange) return;
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className={cn('bg-white rounded-card border border-border-card shadow-sm overflow-hidden flex flex-col', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-card bg-[#FAFCFB] text-app-muted font-medium select-none">
              {selectable && (
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded border-slate-300 text-primary-brand focus:ring-accent-brand cursor-pointer accent-primary-brand"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={cn(
                    'px-4 py-3 font-semibold text-app-muted uppercase tracking-wider text-[11px]',
                    col.sortable && 'cursor-pointer hover:text-app-text'
                  )}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            'w-3 h-3 -mb-1',
                            sortBy === col.key && sortOrder === 'asc'
                              ? 'text-primary-brand font-bold'
                              : 'text-slate-300'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'w-3 h-3',
                            sortBy === col.key && sortOrder === 'desc'
                              ? 'text-primary-brand font-bold'
                              : 'text-slate-300'
                          )}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`}>
                  {selectable && (
                    <td className="px-4 py-3 text-center">
                      <Skeleton className="w-4 h-4 rounded mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-app-muted"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'transition-colors hover:bg-slate-50/80 cursor-pointer',
                      isSelected && 'bg-accent-soft/40 hover:bg-accent-soft/60'
                    )}
                  >
                    {selectable && (
                      <td
                        className="w-10 px-4 py-3.5 text-center"
                        onClick={(e) => handleSelectRow(row.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select row ${row.id}`}
                          className="w-4 h-4 rounded border-slate-300 text-primary-brand focus:ring-accent-brand cursor-pointer accent-primary-brand"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5 text-app-text font-normal">
                        {col.render
                          ? col.render(row, idx)
                          : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border-card bg-white text-xs text-app-muted select-none">
          <div>
            Showing <span className="font-semibold text-app-text">{startItem}</span> to{' '}
            <span className="font-semibold text-app-text">{endItem}</span> of{' '}
            <span className="font-semibold text-app-text">{total}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              aria-label="Previous page"
              className="inline-flex items-center justify-center w-7 h-7 rounded border border-border-card bg-white text-app-text hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium text-app-text">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              aria-label="Next page"
              className="inline-flex items-center justify-center w-7 h-7 rounded border border-border-card bg-white text-app-text hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

/**
 * Reusable project data table.
 *
 * @param {Array<string | { key: string, label?: string, render?: (value: unknown, row: object) => React.ReactNode, truncate?: boolean, maxWidth?: string | number, getTooltip?: (value: unknown, row: object) => string }>} headers
 * @param {Array<object>} rows
 * @param {Array<string>} sortableFields - Field keys which can be sorted.
 * @param {(row: object) => void} onShow
 * @param {(row: object) => void} onEdit
 * @param {(row: object) => void} onDelete
 * @param {() => void} onCreate
 * @param {string} tableName - Optional table title.
 * @param {string} createLabel - Optional create button label. Requires onCreate.
 * @param {number} visibleRows - Number of rows visible before the body scrolls. Default: 10.
 * @param {boolean} pagination - Shows pagination controls when true.
 * @param {number} currentPage - Current page number (controlled by the parent).
 * @param {number} totalPages - Total number of available pages.
 * @param {(page: number) => void} onPageChange - Called with the selected page number.
 * @param {boolean} searchable - Shows a search field when true.
 * @param {Array<string>} searchFields - Row fields used for local search. Defaults to all columns.
 * @param {string} searchValue - Controlled search value, useful for API search.
 * @param {(value: string) => void} onSearchChange - Called whenever search input changes.
 */
export function DataTable({
  headers = [],
  rows = [],
  sortableFields = [],
  onShow,
  onEdit,
  onDelete,
  onCreate,
  tableName,
  createLabel,
  rowKey = 'id',
  visibleRows = 10,
  emptyMessage = 'No records found.',
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchable = false,
  searchFields,
  searchValue,
  onSearchChange,
}) {
  const [sort, setSort] = useState({ field: null, direction: 'asc' })
  const [internalSearch, setInternalSearch] = useState('')
  const columns = useMemo(() => headers.map((header) => typeof header === 'string'
    ? { key: header, label: header.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()) }
    : header), [headers])
  const hasActions = Boolean(onShow || onEdit || onDelete)
  const showCreateAction = Boolean(onCreate && createLabel)
  const showToolbar = Boolean(tableName || showCreateAction || searchable)
  const activeSearch = searchValue ?? internalSearch
  const isServerSearch = Boolean(onSearchChange)

  const sortedRows = useMemo(() => {
    // When onSearchChange is supplied, the parent/API has already filtered rows.
    const filteredRows = !isServerSearch && activeSearch.trim()
      ? rows.filter((row) => (searchFields?.length ? searchFields : columns.map((column) => column.key)).some((field) => String(row[field] ?? '').toLowerCase().includes(activeSearch.trim().toLowerCase())))
      : rows
    if (!sort.field) return filteredRows
    return [...filteredRows].sort((first, second) => {
      const a = first[sort.field] ?? ''
      const b = second[sort.field] ?? ''
      const result = typeof a === 'number' && typeof b === 'number'
        ? a - b
        : String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
      return sort.direction === 'asc' ? result : -result
    })
  }, [rows, sort, activeSearch, searchFields, columns, isServerSearch])

  const changeSort = (field) => {
    setSort((current) => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const bodyHeight = `${Math.max(1, visibleRows) * 52 + 1}px`
  const handleSearch = (value) => {
    if (onSearchChange) onSearchChange(value)
    else setInternalSearch(value)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      {showToolbar && (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
          {tableName ? <div><h2 className="text-sm font-bold text-[var(--color-text)]">{tableName}</h2><p className="text-xs text-[var(--color-muted)]">{rows.length} total record{rows.length === 1 ? '' : 's'}</p></div> : <span />}
          <div className="flex items-center gap-2">{searchable && <label className="relative"><Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" /><input value={activeSearch} onChange={(event) => handleSearch(event.target.value)} placeholder="Search..." aria-label="Search table records" className="h-8 w-[8.75rem] rounded-md border border-[var(--color-border)] bg-transparent py-1 pl-8 pr-7 text-xs outline-none focus:border-[var(--color-primary)] sm:w-48" />{activeSearch && <button type="button" aria-label="Clear search" onClick={() => handleSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)]"><X size={14} /></button>}</label>}{showCreateAction && <button type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-[var(--color-surface)] transition-opacity hover:opacity-90"><Plus size={16} />{createLabel}</button>}</div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[620px]" style={{ maxHeight: bodyHeight, overflowY: 'auto' }}>
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--color-page)] text-[var(--color-muted)]">
              <tr>
                {columns.map((column) => {
                  const sortable = sortableFields.includes(column.key)
                  const active = sort.field === column.key
                  return <th key={column.key} className="whitespace-nowrap border-b border-[var(--color-border)] px-4 py-3 text-xs font-semibold sm:px-5">
                    {sortable ? <button type="button" onClick={() => changeSort(column.key)} className="inline-flex items-center gap-1.5 hover:text-[var(--color-primary)]">{column.label}{active ? sort.direction === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} /> : <ChevronDown size={14} />}</button> : column.label}
                  </th>
                })}
                {hasActions && <th className="sticky right-0 border-b border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-right text-xs font-semibold sm:px-5">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? <tr><td colSpan={columns.length + Number(hasActions)} className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">{emptyMessage}</td></tr> : sortedRows.map((row, index) => <tr key={row[rowKey] ?? index} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-page)]">
                {columns.map((column) => <TableCell key={column.key} column={column} row={row} />)}
                {hasActions && <td className="sticky right-0 bg-[var(--color-surface)] px-4 py-2 text-right sm:px-5"><div className="inline-flex items-center gap-1">{onShow && <ActionButton label="View record" onClick={() => onShow(row)}><Eye size={16} /></ActionButton>}{onEdit && <ActionButton label="Edit record" onClick={() => onEdit(row)}><Edit3 size={16} /></ActionButton>}{onDelete && <ActionButton label="Delete record" danger onClick={() => onDelete(row)}><Trash2 size={16} /></ActionButton>}</div></td>}
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {pagination && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />}
    </section>
  )
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const safeTotalPages = Math.max(1, totalPages)
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages)
  const pages = getPaginationPages(safeCurrentPage, safeTotalPages)
  const selectPage = (page) => { if (onPageChange && page >= 1 && page <= safeTotalPages && page !== safeCurrentPage) onPageChange(page) }

  return <nav aria-label="Table pagination" className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 sm:px-5">
    <button type="button" onClick={() => selectPage(safeCurrentPage - 1)} disabled={safeCurrentPage === 1} className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} />Previous</button>
    <div className="flex items-center gap-1">{pages.map((page, index) => page === 'ellipsis' ? <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-[var(--color-muted)]">…</span> : <button type="button" key={page} aria-current={page === safeCurrentPage ? 'page' : undefined} onClick={() => selectPage(page)} className={`grid size-8 place-items-center rounded-md text-xs font-bold ${page === safeCurrentPage ? 'bg-[var(--color-primary)] text-[var(--color-surface)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'}`}>{page}</button>)}</div>
    <button type="button" onClick={() => selectPage(safeCurrentPage + 1)} disabled={safeCurrentPage === safeTotalPages} className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={15} /></button>
  </nav>
}

function getPaginationPages(currentPage, totalPages) {
  if (totalPages <= 3) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const middlePages = currentPage <= 2 ? [1, 2, 3] : currentPage >= totalPages - 1 ? [totalPages - 2, totalPages - 1, totalPages] : [currentPage - 1, currentPage, currentPage + 1]
  const pages = []
  if (middlePages[0] > 1) pages.push(1)
  if (middlePages[0] > 2) pages.push('ellipsis')
  pages.push(...middlePages)
  if (middlePages[2] < totalPages - 1) pages.push('ellipsis')
  if (middlePages[2] < totalPages) pages.push(totalPages)
  return pages
}

function TableCell({ column, row }) {
  const value = row[column.key]
  const content = column.render ? column.render(value, row) : String(value ?? '—')

  if (!column.truncate) {
    return <td className="whitespace-nowrap px-4 py-3.5 text-[var(--color-text)] sm:px-5">{content}</td>
  }

  const tooltip = column.getTooltip ? column.getTooltip(value, row) : String(value ?? '')
  return <td className="px-4 py-3.5 text-[var(--color-text)] sm:px-5"><div title={tooltip} className="truncate" style={{ maxWidth: column.maxWidth || '18rem' }}>{content}</div></td>
}

function ActionButton({ label, children, danger = false, onClick }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`grid size-8 place-items-center rounded-md transition-colors ${danger ? 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'}`}>{children}</button>
}

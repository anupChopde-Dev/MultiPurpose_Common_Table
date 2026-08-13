# MultiPurpose_Common_Table
Provide a ready-to-paste README.md file structure containing this description and setup steps.
# Reusable React DataTable

A reusable, Tailwind-styled data table for React projects. It supports dynamic columns, actions, search, sorting, a fixed header, scrolling rows, optional pagination, long-text ellipsis, and light/dark theme tokens.

## Installation

Copy [DataTable.jsx](./src/components/common/DataTable.jsx) into your project. It requires React, Tailwind CSS, and `lucide-react`.

```bash
npm install lucide-react
```

The component uses these CSS variables, so define them in your application theme: `--color-surface`, `--color-page`, `--color-text`, `--color-muted`, `--color-border`, `--color-primary`, `--color-primary-soft`, `--color-success`, `--color-success-soft`, `--color-danger`, and `--color-danger-soft`.

## Basic Usage

```jsx
import { DataTable } from '@/components/common/DataTable'

const headers = ['name', 'email', 'status']
const users = [
  { id: 1, name: 'Anup', email: 'anup@example.com', status: 'Active' },
  { id: 2, name: 'John', email: 'john@example.com', status: 'Inactive' },
]

export function Users() {
  return <DataTable headers={headers} rows={users} rowKey="id" />
}
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `headers` | `array` | String field names or custom column objects. |
| `rows` | `array` | Array of row objects. Field names must match column keys. |
| `rowKey` | `string` | Unique row identifier. Default: `id`. |
| `tableName` | `string` | Optional title displayed above the table. |
| `visibleRows` | `number` | Visible row count before the table body scrolls. Default: `10`. |
| `emptyMessage` | `string` | Empty-table text. |
| `sortableFields` | `string[]` | Fields the user may sort. Sorting is local to supplied rows. |
| `searchable` | `boolean` | Displays a search field. |
| `searchFields` | `string[]` | Fields searched for local search. Defaults to all displayed fields. |
| `searchValue` | `string` | Controlled search value for API/server search. |
| `onSearchChange` | `(value) => void` | Search callback for API/server search. |
| `createLabel` | `string` | Optional create button text. Needs `onCreate`. |
| `onCreate` | `function` | Create action callback. |
| `onShow` | `(row) => void` | View action callback; receives selected row. |
| `onEdit` | `(row) => void` | Edit action callback; receives selected row. |
| `onDelete` | `(row) => void` | Delete action callback; receives selected row. |
| `pagination` | `boolean` | Displays pagination when true. |
| `currentPage` | `number` | Controlled current page. |
| `totalPages` | `number` | Controlled total available pages. |
| `onPageChange` | `(page) => void` | Callback for Previous, Next, and page buttons. |

## Custom Columns and Long Text

Use a custom header object to rename a column, render custom UI, or truncate any long column. Full text appears on hover.

```jsx
const headers = [
  'storeName',
  {
    key: 'description',
    label: 'Description',
    truncate: true,
    maxWidth: '20rem',
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <span className="font-semibold">{value}</span>,
  },
]
```

`maxWidth` is optional and defaults to `18rem`. Use `getTooltip(value, row)` when the hover text must be different from the cell value.

## Local Search and Sorting

Without `onSearchChange`, search is performed locally against the supplied rows.

```jsx
<DataTable
  tableName="Users"
  headers={headers}
  rows={users}
  rowKey="id"
  searchable
  searchFields={['name', 'email']}
  sortableFields={['name', 'email', 'status']}
/>
```

## Actions

Action callbacks always receive the complete selected row.

```jsx
<DataTable
  headers={headers}
  rows={users}
  createLabel="Add user"
  onCreate={() => navigate('/users/create')}
  onShow={(user) => navigate(`/users/${user.id}`)}
  onEdit={(user) => navigate(`/users/${user.id}/edit`)}
  onDelete={(user) => deleteUser(user.id)}
/>
```

## API Search and Pagination

For API tables, the parent owns the current page, search text, returned rows, loading state, and total pages. `DataTable` only renders controls and calls the callbacks.

```jsx
import { useCallback, useEffect, useState } from 'react'
import { DataTable } from '@/components/common/DataTable'

const PAGE_SIZE = 10

export function Vendors() {
  const [vendors, setVendors] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadVendors = useCallback(async () => {
    setLoading(true)
    const query = new URLSearchParams({ page, limit: PAGE_SIZE, search })
    const response = await fetch(`/api/vendors?${query}`)
    const data = await response.json()

    setVendors(data.vendors)
    setTotalPages(data.totalPages)
    setLoading(false)
  }, [page, search])

  useEffect(() => { loadVendors() }, [loadVendors])

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  if (loading) return <p>Loading vendors...</p>

  return <DataTable
    tableName="Vendors"
    headers={headers}
    rows={vendors}
    rowKey="id"
    searchable
    searchValue={search}
    onSearchChange={handleSearchChange}
    pagination
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
    createLabel="Add vendor"
    onCreate={() => navigate('/vendors/create')}
    onShow={(vendor) => navigate(`/vendors/${vendor.id}`)}
    onEdit={(vendor) => navigate(`/vendors/${vendor.id}/edit`)}
    onDelete={(vendor) => deleteVendor(vendor.id)}
  />
}
```

Expected API response:

```json
{
  "vendors": [],
  "page": 1,
  "totalPages": 12,
  "totalRecords": 117
}
```

Pagination displays Previous and Next buttons, a maximum three-page middle window, and ellipses for omitted pages.

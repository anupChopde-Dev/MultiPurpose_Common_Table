import { useCallback, useEffect, useState } from 'react'
import { DataTable } from '../../components/common/DataTable'

// Keep true until your backend endpoint is available. Change to false to use API_URL.
const USE_DEMO_DATA = true
const API_URL = 'http://localhost:5000/api/vendors'
const PAGE_SIZE = 5

const vendorHeaders = [
  'storeName',
  'ownerName',
  { key: 'email', label: 'Email', truncate: true, maxWidth: '12rem' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <span className={`rounded-full px-2 py-1 text-xs font-semibold ${value === 'Active' ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' : 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]'}`}>{value}</span>,
  },
  'totalSales',
]

// This data acts like a backend response until you connect an API.
const demoVendors = [
  { id: 1, storeName: 'Urban Nest', ownerName: 'Mira Patel', email: 'mira@urbannest.com', status: 'Active', totalSales: '$12,480' },
  { id: 2, storeName: 'Wander & Co.', ownerName: 'Liam Carter', email: 'liam@wanderco.com', status: 'Active', totalSales: '$9,820' },
  { id: 3, storeName: 'Lumière', ownerName: 'Ava Thompson', email: 'ava@lumiere.com', status: 'Pending', totalSales: '$8,540' },
  { id: 4, storeName: 'Northline', ownerName: 'Noah Williams', email: 'noah@northline.com', status: 'Active', totalSales: '$7,260' },
  { id: 5, storeName: 'Studio 44', ownerName: 'Emma Wilson', email: 'emma@studio44.com', status: 'Active', totalSales: '$6,940' },
  { id: 6, storeName: 'Kindred Goods', ownerName: 'Oliver Brown', email: 'oliver@kindredgoods.com', status: 'Pending', totalSales: '$6,110' },
  { id: 7, storeName: 'The Daily Edit', ownerName: 'Sophia Davis', email: 'sophia@dailyedit.com', status: 'Active', totalSales: '$5,870' },
  { id: 8, storeName: 'Fern & Form', ownerName: 'James Miller', email: 'james@fernform.com', status: 'Active', totalSales: '$5,420' },
  { id: 9, storeName: 'Arden Home', ownerName: 'Isabella Moore', email: 'isabella@ardenhome.com', status: 'Pending', totalSales: '$4,980' },
  { id: 10, storeName: 'Still Studio', ownerName: 'Benjamin Lee', email: 'ben@stillstudio.com', status: 'Active', totalSales: '$4,650' },
  { id: 11, storeName: 'Little Loom', ownerName: 'Charlotte Hall', email: 'charlotte@littleloom.com', status: 'Active', totalSales: '$4,320' },
  { id: 12, storeName: 'Morrow Supply', ownerName: 'Henry Young', email: 'henry@morrow.com', status: 'Pending', totalSales: '$3,890' },
]

export function AdminVendors() {
  const [vendors, setVendors] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // This function supports either demo data or this suggested API response:
  // { vendors: Vendor[], page: number, totalPages: number, totalRecords: number }
  const loadVendors = useCallback(async (page, searchQuery) => {
    setLoading(true)
    setError('')
    try {
      if (USE_DEMO_DATA) {
        // Keep the demo branch asynchronous, exactly like a real HTTP request.
        await Promise.resolve()
        const matchingVendors = demoVendors.filter((vendor) => Object.values(vendor).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())))
        setVendors(matchingVendors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
        setTotalPages(Math.max(1, Math.ceil(matchingVendors.length / PAGE_SIZE)))
        return
      }

      // Add Authorization here when your backend requires a token.
      const query = new URLSearchParams({ page, limit: PAGE_SIZE, search: searchQuery })
      const response = await fetch(`${API_URL}?${query}`)
      if (!response.ok) throw new Error('Could not load vendors.')
      const data = await response.json()
      setVendors(data.vendors)
      setTotalPages(data.totalPages)
    } catch (requestError) {
      setError(requestError.message || 'Could not load vendors.')
      setVendors([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch a new server page every time the DataTable pagination callback changes currentPage.
  // loadVendors is asynchronous (the same lifecycle as fetch), so this intentional state sync is safe.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadVendors(currentPage, search) }, [currentPage, search, loadVendors])

  const handleCreate = () => {
    // navigate('/admin/vendors/create') or open your create-vendor modal here.
    console.log('Create vendor')
  }

  const handleShow = (vendor) => {
    // navigate(`/admin/vendors/${vendor.id}`)
    console.log('Show vendor:', vendor)
  }

  const handleEdit = (vendor) => {
    // navigate(`/admin/vendors/${vendor.id}/edit`)
    console.log('Edit vendor:', vendor)
  }

  const handleDelete = async (vendor) => {
    // Recommended API implementation:
    // await fetch(`${API_URL}/${vendor.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    // await loadVendors(currentPage)
    if (USE_DEMO_DATA) console.log('Delete vendor:', vendor)
  }

  // Controlled search: changing it starts API/demo search from the first page.
  const handleSearchChange = (value) => {
    setSearch(value)
    setCurrentPage(1)
  }

  if (loading) return <p className="text-sm text-[var(--color-muted)]">Loading vendors...</p>
  if (error) return <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 text-sm text-[var(--color-danger)]">{error}</div>

  return <DataTable
    tableName="Vendors"
    headers={vendorHeaders}
    rows={vendors}
    rowKey="id"
    visibleRows={10}
    emptyMessage="No vendors found."
    sortableFields={['storeName', 'ownerName', 'status', 'totalSales']}
    createLabel="Add vendor"
    onCreate={handleCreate}
    onShow={handleShow}
    onEdit={handleEdit}
    onDelete={handleDelete}
    pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    searchable
    searchValue={search}
    onSearchChange={handleSearchChange}
  />
}

export function AdminOrders() { return null }
export function AdminCatalog() { return null }
export function AdminReports() { return null }
export function AdminSettings() { return null }

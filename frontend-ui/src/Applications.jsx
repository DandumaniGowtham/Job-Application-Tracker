import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import './Applications.css'

const STATUSES = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]

const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'REMOTE',
  'FREELANCE',
]

const EMPTY_FORM = {
  company_name: '',
  job_title: '',
  location: '',
  employment_type: 'FULL_TIME',
  source: '',
  job_url: '',
  salary_min: '',
  salary_max: '',
  applied_date: '',
  status: 'APPLIED',
}

function Applications() {
  const [applications, setApplications] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [employmentFilter, setEmploymentFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [hasMore, setHasMore] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    loadApplications()
  }, [page, statusFilter, employmentFilter, sortOrder])

  async function loadApplications() {
    setLoading(true)
    setMessage('')

    try {
      let endpoint

      if (statusFilter) {
        endpoint = `/applications/status/${encodeURIComponent(statusFilter)}`
      } else if (employmentFilter) {
        const params = new URLSearchParams({
          employment_type: employmentFilter,
          sort_by: 'applied_date',
          order: sortOrder,
        })

        endpoint = `/applications/filter-sort?${params.toString()}`
      } else {
        endpoint = `/applications?page=${page}&limit=${limit}`
      }

      let data = await apiRequest(endpoint)

      if (!Array.isArray(data)) {
        data = []
      }

      if (statusFilter || employmentFilter) {
        data.sort((a, b) => {
          const comparison = String(a.applied_date).localeCompare(
            String(b.applied_date)
          )

          return sortOrder === 'asc' ? comparison : -comparison
        })

        const start = (page - 1) * limit
        setHasMore(data.length > start + limit)
        data = data.slice(start, start + limit)
      } else {
        setHasMore(data.length === limit)
      }

      setApplications(data)
    } catch (error) {
      setMessage(error.message || 'Unable to load applications.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  function updateField(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function openCreateForm() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(application) {
    setEditingId(application.id)

    setForm({
      company_name: application.company_name || '',
      job_title: application.job_title || '',
      location: application.location || '',
      employment_type: application.employment_type || 'FULL_TIME',
      source: application.source || '',
      job_url: application.job_url || '',
      salary_min: application.salary_min ?? '',
      salary_max: application.salary_max ?? '',
      applied_date: application.applied_date || '',
      status: application.status || 'APPLIED',
    })

    setMessage('')
    setShowForm(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    if (
      form.salary_min !== '' &&
      form.salary_max !== '' &&
      Number(form.salary_min) > Number(form.salary_max)
    ) {
      setMessage('Minimum salary cannot exceed maximum salary.')
      setMessageType('error')
      setSaving(false)
      return
    }

    const payload = {
      ...form,
      job_url: form.job_url.trim() || null,
      salary_min: form.salary_min === '' ? null : Number(form.salary_min),
      salary_max: form.salary_max === '' ? null : Number(form.salary_max),
    }

    try {
      if (editingId !== null) {
        await apiRequest(`/applications/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        setMessage('Application updated successfully.')
      } else {
        await apiRequest('/applications', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        setMessage('Application created successfully.')
      }

      setMessageType('success')
      setShowForm(false)
      setEditingId(null)
      setForm({ ...EMPTY_FORM })
      setPage(1)

      await loadApplications()
    } catch (error) {
      setMessage(error.message || 'Unable to save application.')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(applicationId, status) {
    try {
      await apiRequest(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })

      setMessage('Application status updated.')
      setMessageType('success')

      await loadApplications()
    } catch (error) {
      setMessage(error.message || 'Unable to update status.')
      setMessageType('error')
    }
  }

  async function deleteApplication(application) {
    const confirmed = window.confirm(
      `Delete the application for ${application.company_name}?`
    )

    if (!confirmed) return

    try {
      await apiRequest(`/applications/${application.id}`, {
        method: 'DELETE',
      })

      setMessage('Application deleted successfully.')
      setMessageType('success')

      if (applications.length === 1 && page > 1) {
        setPage((previous) => previous - 1)
      } else {
        await loadApplications()
      }
    } catch (error) {
      setMessage(error.message || 'Unable to delete application.')
      setMessageType('error')
    }
  }

  async function handleSearch(event) {
    event.preventDefault()
    setPage(1)
    setLoading(true)
    setMessage('')

    try {
      let data

      if (!search.trim()) {
        await loadApplications()
        return
      }

      data = await apiRequest(
        `/applications/search/${encodeURIComponent(search.trim())}`
      )

      setApplications(Array.isArray(data) ? data : [])
      setHasMore(false)
    } catch (error) {
      setMessage(error.message || 'Search failed.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setEmploymentFilter('')
    setSortOrder('desc')
    setPage(1)
    setMessage('')
  }

  return (
    <main className="applications-page">
      <header className="applications-header">
        <div>
          <p className="applications-eyebrow">CAREER MANAGEMENT</p>
          <h1>Applications</h1>
          <p className="applications-subtitle">
            Manage every opportunity in one place.
          </p>
        </div>

        <button
          type="button"
          className="applications-primary-button"
          onClick={openCreateForm}
        >
          + Add Application
        </button>
      </header>

      {message && (
        <div
          className={`applications-message ${messageType}`}
          role="status"
        >
          {message}
        </div>
      )}

      {showForm && (
        <section className="application-form-card">
          <div className="application-form-heading">
            <div>
              <h2>
                {editingId !== null ? 'Edit Application' : 'New Application'}
              </h2>
              <p>Enter the job details below.</p>
            </div>

            <button
              type="button"
              className="application-close-button"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="application-form-grid">
              <label>
                Company name *
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={updateField}
                  required
                  maxLength={200}
                />
              </label>

              <label>
                Job title *
                <input
                  name="job_title"
                  value={form.job_title}
                  onChange={updateField}
                  required
                  maxLength={200}
                />
              </label>

              <label>
                Location *
                <input
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  required
                  
                />
              </label>

              <label>
                Employment type *
                <select
                  name="employment_type"
                  value={form.employment_type}
                  onChange={updateField}
                  required
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Application source *
                <input
                  name="source"
                  value={form.source}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Applied date *
                <input
                  type="date"
                  name="applied_date"
                  value={form.applied_date}
                  onChange={updateField}
                  max={new Date().toLocaleDateString('en-CA')}
                  required
                />
              </label>

              <label>
                Minimum salary
                <input
                  type="number"
                  name="salary_min"
                  value={form.salary_min}
                  onChange={updateField}
                  min="0"
                  step="0.01"
                />
              </label>

              <label>
                Maximum salary
                <input
                  type="number"
                  name="salary_max"
                  value={form.salary_max}
                  onChange={updateField}
                  min="0"
                  step="0.01"
                />
              </label>

              <label className="application-full-width">
                Job URL
                <input
                  type="url"
                  name="job_url"
                  value={form.job_url}
                  onChange={updateField}
                />
              </label>

              <label>
                Status *
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                  required
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="application-form-actions">
              <button
                type="button"
                className="application-secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="applications-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Save Changes'
                    : 'Create Application'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="applications-list-card">
        <div className="applications-list-heading">
          <div>
            <h2>All Applications</h2>
            <p>Your saved job opportunities</p>
          </div>

          <span className="applications-count">
            {applications.length} shown
          </span>
        </div>

        <form className="application-filters" onSubmit={handleSearch}>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company..."
            aria-label="Search company"
          />

          <button
            type="submit"
            className="application-secondary-button"
          >
            Search
          </button>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by employment type"
            value={employmentFilter}
            onChange={(event) => {
              setEmploymentFilter(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All employment types</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll('_', ' ')}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort by applied date"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>

          <button
            type="button"
            className="application-secondary-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </form>

        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Company / Role</th>
                <th>Location</th>
                <th>Applied date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="applications-empty">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="applications-empty">
                    No applications found. Add your first application!
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <div className="application-company">
                        {application.company_name}
                      </div>
                      <div className="application-role">
                        {application.job_title}
                      </div>
                      {application.job_url && (
                        <a
                          className="application-job-link"
                          href={application.job_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View job ↗
                        </a>
                      )}
                    </td>

                    <td>{application.location}</td>
                    <td>{application.applied_date}</td>

                    <td>
                      <select
                        className={`application-status status-${application.status.toLowerCase()}`}
                        value={application.status}
                        aria-label={`Status for ${application.company_name}`}
                        onChange={(event) =>
                          updateStatus(application.id, event.target.value)
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <div className="application-row-actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(application)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="application-delete-button"
                          onClick={() => deleteApplication(application)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="applications-pagination">
          <span>Page {page}</span>

          <div>
            <button
              type="button"
              className="application-secondary-button"
              disabled={page === 1 || loading}
              onClick={() => setPage((previous) => previous - 1)}
            >
              Previous
            </button>

            <button
              type="button"
              className="application-secondary-button"
              disabled={!hasMore || loading}
              onClick={() => setPage((previous) => previous + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Applications
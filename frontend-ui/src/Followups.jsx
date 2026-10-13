
import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import './Followups.css'

import {BellRing} from 'lucide-react'


const emptyForm = {
  application_id: '',
  followup_date: '',
  note: '',
}

function Followups() {
  const [applications, setApplications] = useState([])
  const [followups, setFollowups] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadFollowups() {
    try {
      setLoading(true)
      setError('')

      const applicationData = await apiRequest(
        '/applications?page=1&limit=100'
      )

      setApplications(applicationData)

      const groups = await Promise.all(
        applicationData.map(async (application) => {
          const data = await apiRequest(
            `/applications/${application.id}/followups`
          )

          return data.map((followup) => ({
            ...followup,
            company_name: application.company_name,
            job_title: application.job_title,
          }))
        })
      )

      const allFollowups = groups.flat().sort(
        (a, b) =>
          new Date(a.followup_date) - new Date(b.followup_date)
      )

      setFollowups(allFollowups)
    } catch (err) {
      setError(err.message || 'Failed to load follow-ups.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFollowups()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function openCreateForm() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      application_id: applications[0]
        ? String(applications[0].id)
        : '',
    })
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(followup) {
    setEditingId(followup.id)

    const date = new Date(followup.followup_date)
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16)

    setForm({
      application_id: String(followup.application_id),
      followup_date: localDate,
      note: followup.note || '',
    })

    setError('')
    setMessage('')
    setShowForm(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const payload = {
        followup_date: new Date(form.followup_date).toISOString(),
        note: form.note.trim() || null,
      }

      if (editingId !== null) {
        await apiRequest(`/followups/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        setMessage('Follow-up updated successfully.')
      } else {
        if (!form.application_id) {
          setError('Please create an application first.')
          return
        }

        await apiRequest(
          `/applications/${form.application_id}/followups`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              application_id: Number(form.application_id),
            }),
          }
        )

        setMessage('Follow-up created successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)

      await loadFollowups()
    } catch (err) {
      setError(err.message || 'Failed to save follow-up.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(followup) {
    if (!window.confirm(
      `Delete the follow-up for ${followup.company_name}?`
    )) {
      return
    }

    try {
      setError('')
      setMessage('')

      await apiRequest(`/followups/${followup.id}`, {
        method: 'DELETE',
      })

      setMessage('Follow-up deleted successfully.')
      await loadFollowups()
    } catch (err) {
      setError(err.message || 'Failed to delete follow-up.')
    }
  }

  function getFollowupState(followupDate) {
    const due = new Date(followupDate)
    const now = new Date()

    if (due < now) return 'Overdue'
    if (due.toDateString() === now.toDateString()) return 'Due today'
    return 'Upcoming'
  }

  function formatDate(dateValue) {
    return new Date(dateValue).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="followups-page">
      <header className="followups-header">
        <div>
          <p className="followups-eyebrow">CAREER MANAGEMENT</p>
          <h1>Follow-ups</h1>
          <p>Keep track of reminders for your job applications.</p>
        </div>

        <button
          type="button"
          className="followup-primary-button"
          onClick={openCreateForm}
          disabled={applications.length === 0 && !loading}
        >
          + Add Follow-up
        </button>
      </header>

      {error && (
        <p className="followup-message followup-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="followup-message followup-success" role="status">
          {message}
        </p>
      )}

      {showForm && (
        <section className="followup-form-card">
          <div className="followup-form-heading">
            <h2>{editingId ? 'Edit Follow-up' : 'Add Follow-up'}</h2>

            <button
              type="button"
              className="followup-secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <form className="followup-form" onSubmit={handleSubmit}>
            {!editingId && (
              <label>
                Job Application *
                <select
                  name="application_id"
                  value={form.application_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an application</option>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.company_name} — {application.job_title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Follow-up Date and Time *
              <input
                type="datetime-local"
                name="followup_date"
                value={form.followup_date}
                onChange={handleChange}
                required
              />
            </label>

            <label className="followup-full-width">
              Note
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={3}
                placeholder="Example: Ask HR about the interview result..."
              />
            </label>

            <div className="followup-form-actions followup-full-width">
              <button
                type="button"
                className="followup-secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="followup-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Add Follow-up'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="followup-list-card">
        <div className="followup-list-heading">
          <div>
            <h2>All Follow-ups</h2>
            <p>{followups.length} follow-up(s) found</p>
          </div>
        </div>

        {loading ? (
          <p className="followup-empty-message">Loading follow-ups...</p>
        ) : followups.length === 0 ? (
          <div className="followup-empty-state">
            <div className="followup-empty-icon">
                <BellRing size={22} strokeWidth={1.8} />
            </div>
            <h3>No follow-ups yet</h3>
            <p>Create a reminder to follow up on a job application.</p>

            {applications.length > 0 ? (
              <button
                type="button"
                className="followup-primary-button"
                onClick={openCreateForm}
              >
                + Add Your First Follow-up
              </button>
            ) : (
              <p>Add a job application first to create a follow-up.</p>
            )}
          </div>
        ) : (
          <div className="followup-table-wrapper">
            <table className="followup-table">
              <thead>
                <tr>
                  <th>Company / Role</th>
                  <th>Follow-up Date</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {followups.map((followup) => (
                  <tr key={followup.id}>
                    <td>
                      <strong>{followup.company_name}</strong>
                      <span className="followup-job-title">
                        {followup.job_title}
                      </span>
                    </td>

                    <td>{formatDate(followup.followup_date)}</td>

                    <td className="followup-note">
                      {followup.note || '—'}
                    </td>

                    <td>
                      <span
                        className={`followup-status followup-${getFollowupState(
                          followup.followup_date
                        )
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {getFollowupState(followup.followup_date)}
                      </span>
                    </td>

                    <td>
                      <div className="followup-row-actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(followup)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="followup-delete-button"
                          onClick={() => handleDelete(followup)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Followups

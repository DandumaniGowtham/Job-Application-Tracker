
import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import './Interviews.css'

import {CalendarDays} from 'lucide-react'

const emptyForm = {
  application_id: '',
  interview_type: 'Technical',
  scheduled_at: '',
  interviewer: '',
  meeting_link: '',
  status: 'SCHEDULED',
}

function Interviews() {
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadInterviews() {
    try {
      setLoading(true)
      setError('')

      const applicationData = await apiRequest(
        '/applications?page=1&limit=100'
      )

      setApplications(applicationData)

      const interviewGroups = await Promise.all(
        applicationData.map(async (application) => {
          const data = await apiRequest(
            `/applications/${application.id}/interviews`
          )

          return data.map((interview) => ({
            ...interview,
            company_name: application.company_name,
            job_title: application.job_title,
          }))
        })
      )

      const allInterviews = interviewGroups
        .flat()
        .sort(
          (a, b) =>
            new Date(a.scheduled_at) - new Date(b.scheduled_at)
        )

      setInterviews(allInterviews)
    } catch (err) {
      setError(err.message || 'Failed to load interviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInterviews()
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
    setMessage('')
    setError('')
    setShowForm(true)
  }

  function openEditForm(interview) {
    setEditingId(interview.id)
    setForm({
      application_id: String(interview.application_id),
      interview_type: interview.interview_type || 'Technical',
      scheduled_at: interview.scheduled_at || '',
      interviewer: interview.interviewer || '',
      meeting_link: interview.meeting_link || '',
      status: interview.status || 'SCHEDULED',
    })
    setMessage('')
    setError('')
    setShowForm(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const payload = {
        interview_type: form.interview_type,
        scheduled_at: form.scheduled_at,
        interviewer: form.interviewer || null,
        meeting_link: form.meeting_link || null,
        status: form.status,
      }

      if (editingId !== null) {
        await apiRequest(`/interviews/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setMessage('Interview updated successfully.')
      } else {
        if (!form.application_id) {
          setError('Please create an application first.')
          return
        }

        await apiRequest(
          `/applications/${form.application_id}/interviews`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              application_id: Number(form.application_id),
            }),
          }
        )
        setMessage('Interview created successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await loadInterviews()
    } catch (err) {
      setError(err.message || 'Failed to save interview.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(interview) {
    const confirmed = window.confirm(
      `Delete the interview for ${interview.company_name}?`
    )

    if (!confirmed) return

    try {
      setError('')
      setMessage('')

      await apiRequest(`/interviews/${interview.id}`, {
        method: 'DELETE',
      })

      setMessage('Interview deleted successfully.')
      await loadInterviews()
    } catch (err) {
      setError(err.message || 'Failed to delete interview.')
    }
  }

  return (
    <div className="interviews-page">
      <header className="interviews-header">
        <div>
          <p className="interviews-eyebrow">CAREER MANAGEMENT</p>
          <h1>Interviews</h1>
          <p>Organize your upcoming interviews and track your progress.</p>
        </div>

        <button
          type="button"
          className="interview-primary-button"
          onClick={openCreateForm}
          disabled={applications.length === 0 && !loading}
        >
          + Schedule Interview
        </button>
      </header>

      {error && (
        <p className="interview-message error-message" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="interview-message success-message" role="status">
          {message}
        </p>
      )}

      {showForm && (
        <section className="interview-form-card">
          <div className="interview-form-heading">
            <h2>{editingId ? 'Edit Interview' : 'Schedule an Interview'}</h2>
            <button
              type="button"
              className="interview-close-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="interview-form">
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
              Interview Type *
              <select
                name="interview_type"
                value={form.interview_type}
                onChange={handleChange}
                required
              >
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR Interview</option>
                <option value="Coding Round">Coding Round</option>
                <option value="Managerial">Managerial Interview</option>
                <option value="Final Interview">Final Interview</option>
                <option value="Group Discussion">Group Discussion</option>
                <option value="Panel Interview">Panel Interview</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Scheduled Date *
              <input
                type="date"
                name="scheduled_at"
                value={form.scheduled_at}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Interviewer
              <input
                type="text"
                name="interviewer"
                value={form.interviewer}
                onChange={handleChange}
                placeholder="Interviewer name"
              />
            </label>

            <label className="interview-full-width">
              Meeting Link
              <input
                type="url"
                name="meeting_link"
                value={form.meeting_link}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>
            </label>

            <div className="interview-form-actions interview-full-width">
              <button
                type="button"
                className="interview-secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="interview-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Schedule Interview'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="interview-list-card">
        <div className="interview-list-heading">
          <div>
            <h2>All Interviews</h2>
            <p>{interviews.length} interview(s) found</p>
          </div>
        </div>

        {loading ? (
          <p className="interview-empty-message">Loading interviews...</p>
        ) : interviews.length === 0 ? (
          <div className="interview-empty-state">
            <div className="empty-state-icon">
                <CalendarDays size={28} strokeWidth={1.8} />
            </div>
            <h3>No interviews yet</h3>
            <p>
              Schedule an interview to keep track of your job opportunities.
            </p>
            {applications.length > 0 && (
              <button
                type="button"
                className="interview-primary-button"
                onClick={openCreateForm}
              >
                + Schedule Your First Interview
              </button>
            )}
            {applications.length === 0 && (
              <p>Add a job application first, then schedule its interview.</p>
            )}
          </div>
        ) : (
          <div className="interview-table-wrapper">
            <table className="interview-table">
              <thead>
                <tr>
                  <th>Company / Role</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Interviewer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {interviews.map((interview) => (
                  <tr key={interview.id}>
                    <td>
                      <strong>{interview.company_name}</strong>
                      <span className="interview-job-title">
                        {interview.job_title}
                      </span>
                    </td>
                    <td>{interview.scheduled_at || '—'}</td>
                    <td>{interview.interview_type || '—'}</td>
                    <td>{interview.interviewer || '—'}</td>
                    <td>
                      <span className="interview-status">
                        {interview.status || 'SCHEDULED'}
                      </span>
                    </td>
                    <td>
                      <div className="interview-row-actions">
                        {interview.meeting_link && (
                          <a
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Join
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditForm(interview)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="interview-delete-button"
                          onClick={() => handleDelete(interview)}
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

export default Interviews

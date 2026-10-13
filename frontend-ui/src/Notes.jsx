
import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import './Notes.css'

import {NotebookText} from 'lucide-react'


const emptyForm = {
  application_id: '',
  content: '',
}

function Notes() {
  const [applications, setApplications] = useState([])
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadNotes() {
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
            `/applications/${application.id}/notes`
          )

          return data.map((note) => ({
            ...note,
            company_name: application.company_name,
            job_title: application.job_title,
          }))
        })
      )

      const allNotes = groups.flat().sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )

      setNotes(allNotes)
    } catch (err) {
      setError(err.message || 'Failed to load notes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
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

  function openEditForm(note) {
    setEditingId(note.id)
    setForm({
      application_id: String(note.application_id),
      content: note.content,
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

      const content = form.content.trim()

      if (!content) {
        setError('Please enter some note content.')
        return
      }

      if (editingId !== null) {
        await apiRequest(`/notes/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ content }),
        })

        setMessage('Note updated successfully.')
      } else {
        if (!form.application_id) {
          setError('Please create an application first.')
          return
        }

        await apiRequest(
          `/applications/${form.application_id}/notes`,
          {
            method: 'POST',
            body: JSON.stringify({
              application_id: Number(form.application_id),
              content,
            }),
          }
        )

        setMessage('Note created successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)

      await loadNotes()
    } catch (err) {
      setError(err.message || 'Failed to save note.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(note) {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      setError('')
      setMessage('')

      await apiRequest(`/notes/${note.id}`, {
        method: 'DELETE',
      })

      setMessage('Note deleted successfully.')
      await loadNotes()
    } catch (err) {
      setError(err.message || 'Failed to delete note.')
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) return '—'

    return new Date(dateValue).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="notes-page">
      <header className="notes-header">
        <div>
          <p className="notes-eyebrow">CAREER MANAGEMENT</p>
          <h1>Notes</h1>
          <p>Keep important details about your job applications in one place.</p>
        </div>

        <button
          type="button"
          className="notes-primary-button"
          onClick={openCreateForm}
          disabled={applications.length === 0 && !loading}
        >
          + Add Note
        </button>
      </header>

      {error && (
        <p className="notes-message notes-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="notes-message notes-success" role="status">
          {message}
        </p>
      )}

      {showForm && (
        <section className="notes-form-card">
          <div className="notes-form-heading">
            <h2>{editingId !== null ? 'Edit Note' : 'Add Note'}</h2>

            <button
              type="button"
              className="notes-secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <form className="notes-form" onSubmit={handleSubmit}>
            {editingId === null && (
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
                    <option
                      key={application.id}
                      value={application.id}
                    >
                      {application.company_name} — {application.job_title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="notes-full-width">
              Note Content *
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={5}
                maxLength={10000}
                placeholder="Example: HR said the technical interview will focus on Python and SQL..."
                required
              />
            </label>

            <div className="notes-form-actions notes-full-width">
              <button
                type="button"
                className="notes-secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="notes-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Save Changes'
                    : 'Add Note'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="notes-list-card">
        <div className="notes-list-heading">
          <div>
            <h2>All Notes</h2>
            <p>{notes.length} note(s) found</p>
          </div>
        </div>

        {loading ? (
          <p className="notes-empty-message">Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="notes-empty-state">
            <div className="empty-state-icon">
                <NotebookText size={28} strokeWidth={1.8} />
            </div>
            <h3>No notes yet</h3>
            <p>Save important information about your applications here.</p>

            {applications.length > 0 ? (
              <button
                type="button"
                className="notes-primary-button"
                onClick={openCreateForm}
              >
                + Add Your First Note
              </button>
            ) : (
              <p>Create a job application first to add a note.</p>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className="note-card-top">
                    <div className="stat-icon">
                        <NotebookText size={22} strokeWidth={1.8} />
                    </div>

                  <div className="note-actions">
                    <button
                      type="button"
                      onClick={() => openEditForm(note)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="note-delete-button"
                      onClick={() => handleDelete(note)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3>{note.company_name}</h3>
                <p className="note-job-title">{note.job_title}</p>

                <p className="note-content">{note.content}</p>

                <div className="note-card-footer">
                  <span>Created {formatDate(note.created_at)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Notes

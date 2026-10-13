
import './Dashboard.css'
import { useState, useEffect } from 'react'
import Applications from './Applications'
import { apiRequest } from './api'
import Interviews from './Interviews'
import Followups from './Followups'
import Notes from './Notes'

import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  BellRing,
  NotebookText,
  Trophy,
  Bookmark,
  Send,
  Search,
  CheckCircle,
  XCircle,
  CircleMinus,
  LogOut
} from 'lucide-react'


function Dashboard() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')
  const [recentApplications, setRecentApplications] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)
  const [recentError, setRecentError] = useState('')

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setStatsLoading(true)
        setStatsError('')

        const data = await apiRequest('/dashboard')
        setStats(data)
      } catch (error) {
        setStatsError(
          error.message || 'Failed to load dashboard statistics.'
        )
      } finally {
        setStatsLoading(false)
      }
    }

    loadDashboardStats()
  }, [])


  useEffect(() => {
  async function loadRecentApplications() {
    try {
      setRecentLoading(true)
      setRecentError('')

      const data = await apiRequest('/applications?page=1&limit=10')

      const sortedApplications = [...data].sort(
        (a, b) =>
          new Date(b.applied_date) - new Date(a.applied_date)
      )

      setRecentApplications(sortedApplications.slice(0, 5))
    } catch (error) {
      setRecentError(
        error.message || 'Failed to load recent applications.'
      )
    } finally {
      setRecentLoading(false)
    }
  }

  loadRecentApplications()
}, [])



  const navigationItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Applications', icon: BriefcaseBusiness },
  { name: 'Interviews', icon: CalendarDays },
  { name: 'Follow-ups', icon: BellRing },
  { name: 'Notes', icon: NotebookText },
]

  function handleSignOut() {
    localStorage.removeItem('access_token')
    window.location.reload()
  }

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-icon">JT</span>
          <span>Job Tracker</span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="dashboard-nav">
            {navigationItems.map((item) => {
            const Icon = item.icon

            return (
            <button
                key={item.name}
                type="button"
                className={`nav-item ${
                activePage === item.name ? 'active' : ''
                }`}
                onClick={() => setActivePage(item.name)}
            >
                <Icon size={20} strokeWidth={1.8} />
                {item.name}
            </button>
            )
        })}
        </nav>

        <div className="sidebar-bottom">
            <p>Save jobs. Track applications. Stay organized</p>
            <button type="button" onClick={handleSignOut}>
                <LogOut size={18} strokeWidth={1.8} />
                <span>Sign out</span>
            </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {statsError && (
            <p className="dashboard-error" role="alert">
                {statsError}
            </p>
        )}
        
        {activePage === 'Dashboard' && (
          <>
            <header className="dashboard-topbar">
              <div>
                <p className="dashboard-breadcrumb">
                  WORKSPACE / OVERVIEW
                </p>
                <h1>Dashboard</h1>
              </div>

              
            </header>

            <section className="dashboard-welcome">
              <div>
                <p className="welcome-eyebrow">
                  YOUR CAREER JOURNEY
                </p>
                <h2>Welcome back!</h2>
                <p>
                  Keep moving forward. Your next opportunity starts here.
                </p>
              </div>

              <div className="welcome-decoration">↗</div>
            </section>

            

            
            
            <section className="dashboard-stats">
            <article className="stat-card teal-card">
                <div className="stat-icon">
                <BriefcaseBusiness size={22} strokeWidth={1.8} />
                </div>
                <p>Total Applications</p>
                <h3>
                {statsLoading ? '...' : stats?.total_applications ?? 0}
                </h3>
                <span>Track your applications</span>
            </article>

            <article className="stat-card teal-card">
                <div className="stat-icon">
                <Send size={22} strokeWidth={1.8} />
                </div>
                <p>Applied</p>
                <h3>{statsLoading ? '...' : stats?.applied ?? 0}</h3>
                <span>Applications submitted</span>
            </article>

            <article className="stat-card blue-card">
                <div className="stat-icon">
                <Search size={22} strokeWidth={1.8} />
                </div>
                <p>Screening</p>
                <h3>{statsLoading ? '...' : stats?.screening ?? 0}</h3>
                <span>Under consideration</span>
            </article>

            <article className="stat-card blue-card">
                <div className="stat-icon">
                <CalendarDays size={22} strokeWidth={1.8} />
                </div>
                <p>Interviews</p>
                <h3>{statsLoading ? '...' : stats?.interviews ?? 0}</h3>
                <span>Prepare for opportunities</span>
            </article>

            <article className="stat-card purple-card">
                <div className="stat-icon">
                <Trophy size={22} strokeWidth={1.8} />
                </div>
                <p>Offers</p>
                <h3>{statsLoading ? '...' : stats?.offers ?? 0}</h3>
                <span>Celebrate your progress</span>
            </article>

            <article className="stat-card teal-card">
                <div className="stat-icon">
                <CheckCircle size={22} strokeWidth={1.8} />
                </div>
                <p>Accepted</p>
                <h3>{statsLoading ? '...' : stats?.accepted ?? 0}</h3>
                <span>Offers accepted</span>
            </article>

            <article className="stat-card orange-card">
                <div className="stat-icon">
                <XCircle size={22} strokeWidth={1.8} />
                </div>
                <p>Rejected</p>
                <h3>{statsLoading ? '...' : stats?.rejected ?? 0}</h3>
                <span>Applications rejected</span>
            </article>

            <article className="stat-card purple-card">
                <div className="stat-icon">
                <CircleMinus size={22} strokeWidth={1.8} />
                </div>
                <p>Withdrawn</p>
                <h3>{statsLoading ? '...' : stats?.withdrawn ?? 0}</h3>
                <span>Applications withdrawn</span>
            </article>
            </section>



            
            <section className="dashboard-content-card">
            <div className="section-heading">
                <div>
                <h2>Recent Applications</h2>
                <p>Your latest job application activity</p>
                </div>

                <button
                type="button"
                className="primary-small-button"
                onClick={() => setActivePage('Applications')}
                >
                View All
                </button>
            </div>

            {recentLoading ? (
                <p>Loading recent applications...</p>
            ) : recentError ? (
                <p className="dashboard-error" role="alert">
                {recentError}
                </p>
            ) : recentApplications.length === 0 ? (
                <div className="empty-state">
                <div className="empty-state-icon">
                    <BriefcaseBusiness size={28} strokeWidth={1.8} />
                </div>
                <h3>No applications yet</h3>
                <p>Add your first job application to get started.</p>

                <button
                    type="button"
                    className="primary-small-button"
                    onClick={() => setActivePage('Applications')}
                >
                    + Add Application
                </button>
                </div>
            ) : (
                <div className="recent-applications-list">
                {recentApplications.map((application) => (
                    <article
                    className="recent-application-item"
                    key={application.id}
                    >
                    <div>
                        <h3>{application.company_name}</h3>
                        <p>{application.job_title}</p>
                        <span>
                        {application.location} · {application.applied_date}
                        </span>
                    </div>

                    <span className="application-status">
                        {application.status}
                    </span>
                    </article>
                ))}
                </div>
            )}
            </section>

          </>
        )}

        {activePage === 'Applications' && <Applications />}

        {activePage === 'Interviews' && <Interviews />}

        {activePage === 'Follow-ups' && <Followups />}

        {activePage === 'Notes' && <Notes />}

      </main>
    </div>
  )
}

export default Dashboard

import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useProfile } from '../hooks/useProfile'
import { getDiverLevel } from '../lib/levelUtils'

const PADI_CERTS = [
  'Scuba Diver',
  'Open Water Diver',
  'Advanced Open Water Diver',
  'Rescue Diver',
  'Master Scuba Diver',
  'Divemaster',
  'Assistant Instructor',
  'Open Water Scuba Instructor',
  'Master Scuba Diver Trainer',
  'IDC Staff Instructor',
  'Master Instructor',
  'Course Director',
]

export default function ProfilePage() {
  const { profile, diveCount, creatureCount, loading, error, updateProfile } = useProfile()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const fileInputRef = useRef(null)

  function startEdit() {
    setForm({
      name: profile?.name ?? '',
      description: profile?.description ?? '',
      certifications: profile?.certifications ?? [],
    })
    setPreviewUrl(null)
    setPhotoFile(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setForm(null)
    setPreviewUrl(null)
    setPhotoFile(null)
  }

  function toggleCert(cert) {
    setForm(f => ({
      ...f,
      certifications: f.certifications.includes(cert)
        ? f.certifications.filter(c => c !== cert)
        : [...f.certifications, cert],
    }))
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form) return
    try {
      setSaving(true)
      await updateProfile({ ...form, photoFile })
      setEditing(false)
      setForm(null)
      setPreviewUrl(null)
      setPhotoFile(null)
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-400 text-sm">Failed to load profile</p>
      </div>
    )
  }

  const level = getDiverLevel(diveCount)
  const photoSrc = previewUrl || profile?.photo_url || null
  const certs = editing ? (form?.certifications ?? []) : (profile?.certifications ?? [])

  return (
    <div className="flex-1 flex flex-col pb-4 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 pt-8 pb-6 px-6">
        {/* Avatar */}
        <div
          className="relative w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden"
          onClick={editing ? () => fileInputRef.current?.click() : undefined}
          style={editing ? { cursor: 'pointer' } : {}}
        >
          {photoSrc ? (
            <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          )}
          {editing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />

        {/* Name */}
        {editing ? (
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className="bg-gray-800 text-white text-xl font-semibold text-center rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        ) : (
          <h1 className="text-white text-xl font-semibold">{profile?.name || 'Your Name'}</h1>
        )}

        {/* Level badge */}
        <span className="text-xs font-semibold text-teal-400 bg-teal-900/40 px-3 py-1 rounded-full">
          {level}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex divide-x divide-gray-800 mx-6 mb-6 bg-gray-900 rounded-xl overflow-hidden">
        <div className="flex-1 flex flex-col items-center py-4 gap-1">
          <span className="text-white text-2xl font-bold">{diveCount}</span>
          <span className="text-gray-400 text-xs uppercase tracking-wide">Dives</span>
        </div>
        <div className="flex-1 flex flex-col items-center py-4 gap-1">
          <span className="text-white text-2xl font-bold">{creatureCount}</span>
          <span className="text-gray-400 text-xs uppercase tracking-wide">Creatures</span>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 mb-5">
        <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-2">About</h2>
        {editing ? (
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Write something about yourself..."
            rows={3}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        ) : (
          <p className="text-gray-300 text-sm">
            {profile?.description || <span className="text-gray-600 italic">No description yet</span>}
          </p>
        )}
      </div>

      {/* Certifications */}
      <div className="px-6 mb-6">
        <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-3">Certifications</h2>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            {PADI_CERTS.map(cert => {
              const selected = form.certifications.includes(cert)
              return (
                <button
                  key={cert}
                  onClick={() => toggleCert(cert)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selected
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {cert}
                </button>
              )
            })}
          </div>
        ) : certs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {certs.map(cert => (
              <span
                key={cert}
                className="text-xs px-3 py-1.5 rounded-full bg-teal-900/40 text-teal-400 border border-teal-800"
              >
                {cert}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm italic">No certifications added yet</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-6 flex flex-col gap-3">
        {editing ? (
          <div className="flex gap-3">
            <button
              onClick={cancelEdit}
              className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="py-3 rounded-xl border border-gray-600 text-gray-300 text-sm font-medium hover:border-teal-500 hover:text-teal-400 transition-colors"
          >
            Edit Profile
          </button>
        )}

        <button
          onClick={() => supabase.auth.signOut()}
          className="text-gray-500 text-sm hover:text-gray-300 underline py-2 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

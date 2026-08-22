import { Camera, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/storage'

export function Settings() {
  const { user, isArtist } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [profilePicUrl, setProfilePicUrl] = useState('')
  const [venmoHandle, setVenmoHandle] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isArtist) {
      navigate('/')
      return
    }
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setProfilePicUrl(user.profile_pic_url || '')
      setVenmoHandle(user.venmo_handle || '')
      setPaypalEmail(user.paypal_email || '')
    }
  }, [user, isArtist, navigate])

  async function handleProfilePicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const { url, source } = await uploadImage('profiles', file, user.id)
      setProfilePicUrl(url)
      setMessage({ 
        type: 'success', 
        text: source === 'supabase' ? 'Profile picture uploaded!' : 'Preview set (will upload on save)' 
      })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload image' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          bio: bio.trim() || null,
          profile_pic_url: profilePicUrl || null,
          venmo_handle: venmoHandle.trim() || null,
          paypal_email: paypalEmail.trim() || null,
        })
        .eq('id', user.id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Settings saved!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl text-stone-900 sm:text-3xl">Settings</h1>
      <p className="mt-2 text-stone-600">Update your profile and payment information</p>

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {/* Profile Section */}
        <section className="space-y-4">
          <h2 className="font-medium text-stone-900">Profile</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 font-serif text-2xl text-amber-800">
                  {name.charAt(0) || '?'}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-stone-900 text-white hover:bg-stone-800">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="text-sm text-stone-500">
              {uploading ? 'Uploading...' : 'Click the camera to change your photo'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
              placeholder="Tell visitors about yourself..."
            />
          </div>
        </section>

        {/* Payment Section */}
        <section className="space-y-4">
          <h2 className="font-medium text-stone-900">Payment Info</h2>
          <p className="text-sm text-stone-500">
            Customers will be directed to pay you directly via Venmo or PayPal.
          </p>

          <div>
            <label className="block text-sm font-medium text-stone-700">Venmo Handle</label>
            <div className="mt-1 flex rounded-lg border border-stone-300 focus-within:border-stone-500 focus-within:ring-1 focus-within:ring-stone-500">
              <span className="flex items-center pl-3 text-stone-500">@</span>
              <input
                type="text"
                value={venmoHandle}
                onChange={(e) => setVenmoHandle(e.target.value.replace('@', ''))}
                className="block w-full rounded-r-lg border-0 px-2 py-2 focus:outline-none"
                placeholder="YourVenmoUsername"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">PayPal Email</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
              placeholder="your@email.com"
            />
          </div>
        </section>

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-white hover:bg-stone-800 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

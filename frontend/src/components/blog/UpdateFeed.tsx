import { useRef, useState, type FormEvent } from 'react'
import { mediaKindFromFile } from '../../lib/storage'
import { formatDate } from '../../lib/utils'
import type { MediaItem, UpdatePost } from '../../types'
import { ThreadAuthor } from './ThreadAuthor'

type PendingMedia = {
  file: File
  previewUrl: string
  kind: MediaItem['kind']
}

export type FeedAuthor = {
  name: string
  username: string
  photoUrl?: string
}

type Props = {
  posts: UpdatePost[]
  canEdit: boolean
  author: FeedAuthor
  onCreate: (input: { text: string; files: File[] }) => Promise<void>
  onEdit: (post: UpdatePost, input: { text: string }) => Promise<void>
  onDelete: (post: UpdatePost) => Promise<void>
}

export function UpdateFeed({ posts, canEdit, author, onCreate, onEdit, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSaveEdit(post: UpdatePost) {
    setSaving(true)
    try {
      await onEdit(post, { text: editText })
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-3">
      {canEdit && <UpdateComposer author={author} onCreate={onCreate} />}

      {posts.length === 0 && (
        <div className="frame-inset text-stone-400">Nothing posted yet.</div>
      )}

      {posts.map((post) => (
        <article key={post.id} className="group frame-inset">
          {editingId === post.id ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                rows={3}
                className="input-line w-full"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveEdit(post)}
                  className="btn-a"
                >
                  {saving ? 'saving…' : 'save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="btn-c"
                >
                  cancel
                </button>
              </div>
            </div>
          ) : (
            <ThreadAuthor
              name={author.name}
              username={author.username}
              photoUrl={author.photoUrl}
              time={formatDate(post.created_at)}
            >
              {post.text && (
                <p className="mt-2 whitespace-pre-wrap text-stone-900">{post.text}</p>
              )}
              {post.media.length > 0 && (
                <MediaGrid media={post.media} className="mt-3" />
              )}
              {canEdit && (
                <div className="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(post.id)
                      setEditText(post.text)
                    }}
                    className="btn-c"
                  >
                    edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(post)}
                    className="btn-c"
                  >
                    remove
                  </button>
                </div>
              )}
            </ThreadAuthor>
          )}
        </article>
      ))}
    </section>
  )
}

function UpdateComposer({
  author,
  onCreate,
}: {
  author: FeedAuthor
  onCreate: (input: { text: string; files: File[] }) => Promise<void>
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [pending, setPending] = useState<PendingMedia[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addFiles(files: FileList | null) {
    if (!files?.length) return
    const next = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      kind: mediaKindFromFile(file),
    }))
    setPending((current) => [...current, ...next])
  }

  function removePending(index: number) {
    setPending((current) => {
      const target = current[index]
      if (target) URL.revokeObjectURL(target.previewUrl)
      return current.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() && pending.length === 0) {
      setError('Write something, or add a photo or video.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onCreate({ text, files: pending.map((item) => item.file) })
      pending.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      setText('')
      setPending([])
      if (fileInput.current) fileInput.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="frame-inset">
      <ThreadAuthor
        name={author.name}
        username={author.username}
        photoUrl={author.photoUrl}
      >
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder="a short note..."
          className="input-line mt-2"
        />

        {pending.length > 0 && (
          <MediaGrid
            media={pending.map((item) => ({ url: item.previewUrl, kind: item.kind }))}
            className="mt-3"
            onRemove={removePending}
          />
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="btn-c"
            >
              photo / video
            </button>
          </div>
          <button type="submit" disabled={saving} className="btn-a">
            {saving ? 'posting…' : 'post'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </ThreadAuthor>
    </form>
  )
}

function MediaGrid({
  media,
  className = '',
  onRemove,
}: {
  media: MediaItem[]
  className?: string
  onRemove?: (index: number) => void
}) {
  const columns = media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className={`grid gap-1 overflow-hidden rounded-2xl ${columns} ${className}`}>
      {media.map((item, index) => (
        <div key={`${item.url}-${index}`} className="relative bg-stone-100">
          {item.kind === 'video' ? (
            <video
              src={item.url}
              controls
              playsInline
              className="max-h-96 w-full bg-black object-contain"
            />
          ) : (
            <img src={item.url} alt="" className="max-h-96 w-full object-cover" />
          )}
          {onRemove && (
            <button type="button" onClick={() => onRemove(index)} className="btn-c absolute top-2 right-2">
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

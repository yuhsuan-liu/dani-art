import type { RoomCarpetTone, RoomDecor, RoomFloorStyle, RoomWallStyle } from '../../types'

type Props = {
  decor: RoomDecor
  onChange: (decor: RoomDecor) => void
}

export function RoomDecorControls({ decor, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
      <span className="font-medium text-stone-700">Room look</span>

      <label className="inline-flex items-center gap-1.5">
        Walls
        <select
          value={decor.wall_style}
          onChange={(event) =>
            onChange({
              ...decor,
              wall_style: event.target.value as RoomWallStyle,
            })
          }
          className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
        >
          <option value="warm">Warm</option>
          <option value="neutral">Neutral</option>
        </select>
      </label>

      <label className="inline-flex items-center gap-1.5">
        Floor
        <select
          value={decor.floor_style}
          onChange={(event) =>
            onChange({
              ...decor,
              floor_style: event.target.value as RoomFloorStyle,
            })
          }
          className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
        >
          <option value="oak">Wood</option>
          <option value="plain">Plain</option>
        </select>
      </label>

      <label className="inline-flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={decor.carpet.enabled}
          onChange={(event) =>
            onChange({
              ...decor,
              carpet: { ...decor.carpet, enabled: event.target.checked },
            })
          }
          className="rounded border-stone-300"
        />
        Carpet
      </label>

      {decor.carpet.enabled && (
        <select
          value={decor.carpet.tone}
          onChange={(event) =>
            onChange({
              ...decor,
              carpet: {
                ...decor.carpet,
                tone: event.target.value as RoomCarpetTone,
              },
            })
          }
          className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
          aria-label="Carpet color"
        >
          <option value="sand">Sand</option>
          <option value="rose">Rose</option>
          <option value="slate">Slate</option>
        </select>
      )}
    </div>
  )
}

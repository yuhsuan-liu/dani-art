type Option<T extends string> = {
  id: T
  label: string
}

export function ViewSwitch<T extends string>({
  value,
  onChange,
  options,
  label,
  compact = false,
}: {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  label: string
  compact?: boolean
}) {
  return (
    <div
      className={compact ? 'view-switch-compact' : 'view-switch'}
      role="tablist"
      aria-label={label}
    >
      {options.map((option) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={selected ? 'view-switch-tab-active' : 'view-switch-tab'}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

import Popover from './Popover';

export interface Option { value: string; label: string; hint?: string }

/** Styled dropdown that matches the studio (replaces the browser's native select). */
export default function Select({ value, options, onChange, ariaLabel, width, align = 'left' }: {
  value: string; options: Option[]; onChange: (v: string) => void; ariaLabel?: string; width?: number | string; align?: 'left' | 'right';
}) {
  const current = options.find(o => o.value === value) ?? options[0];
  return (
    <Popover align={align} matchWidth className="select-pop" trigger={
      <span className="select-btn" style={{ width }} aria-label={ariaLabel}>
        <span className="select-value">{current?.label}</span>
        {current?.hint && <span className="select-hint">{current.hint}</span>}
        <span className="chev" aria-hidden="true" />
      </span>
    }>
      {close => (
        <div className="select-menu">
          {options.map(o => (
            <button key={o.value} className={`menu-item ${o.value === value ? 'current' : ''}`} onClick={() => { close(); onChange(o.value); }}>
              <span className="select-value">{o.label}</span>
              {o.hint && <span className="select-hint">{o.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}

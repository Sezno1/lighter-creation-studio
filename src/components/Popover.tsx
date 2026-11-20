import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Click-to-open menu rendered above everything (never clipped by cards or scroll areas).
 *  Opens below the trigger, or above it when there isn't room. Closes on outside click, Esc, scroll or resize. */
export default function Popover({ trigger, children, className = '', align = 'right', matchWidth = false }: {
  trigger: ReactNode; children: (close: () => void) => ReactNode; className?: string; align?: 'left' | 'right'; matchWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const wrap = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useLayoutEffect(() => {
    if (!open || !wrap.current || !menu.current) return;
    const r = wrap.current.getBoundingClientRect();
    const m = menu.current.getBoundingClientRect();
    const gap = 6, pad = 8;
    const below = window.innerHeight - r.bottom - pad >= m.height + gap;
    const up = className.includes('up') || !below;
    const top = up ? Math.max(pad, r.top - gap - m.height) : r.bottom + gap;
    const w = matchWidth ? Math.max(m.width, r.width) : m.width;
    let left = align === 'left' ? r.left : r.right - w;
    left = Math.min(Math.max(pad, left), window.innerWidth - w - pad);
    setPos({ top, left, visibility: 'visible', ...(matchWidth ? { minWidth: r.width } : {}) });
  }, [open, align, className, matchWidth]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { const n = e.target as Node; if (!wrap.current?.contains(n) && !menu.current?.contains(n)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    const onMove = (e: Event) => { if (!menu.current?.contains(e.target as Node)) close(); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <div className={`popover ${className} ${open ? 'open' : ''}`} ref={wrap} onClick={e => e.stopPropagation()}>
      <button type="button" className="popover-trigger" onClick={() => { setPos({ visibility: 'hidden' }); setOpen(o => !o); }} aria-expanded={open}>{trigger}</button>
      {open && createPortal(
        <div className="menu" ref={menu} style={{ position: 'fixed', ...pos }} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
          {children(close)}
        </div>,
        document.body
      )}
    </div>
  );
}

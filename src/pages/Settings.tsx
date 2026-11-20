import { PROVIDERS } from '../data';
import { useStore } from '../store';
import type { Key } from '../i18n';

const ROLE_KEYS: { role: keyof typeof PROVIDERS; key: Key }[] = [
  { role: 'draft', key: 'role_draft' }, { role: 'final', key: 'role_final' }, { role: 'views', key: 'role_views' }, { role: 'brain', key: 'role_brain' }
];

export default function Settings() {
  const { s, d, t } = useStore();
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">⚙️ {t('settingsTitle')}</h1>
          <p className="page-sub">{t('settingsSub')}</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {ROLE_KEYS.map(r => (
          <section className="card" key={r.role}>
            <h3 className="panel-title" style={{ padding: '24px 24px 0', marginBottom: 8 }}>🤖 {t(r.key)} · <span className="hint" style={{ fontWeight: 400 }}>{t('backupOrder')}</span></h3>
            <table className="table fixed">
              <colgroup><col style={{ width: 56 }} /><col /><col style={{ width: 160 }} /><col style={{ width: 120 }} /></colgroup>
              <tbody>
                {PROVIDERS[r.role].map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ width: 48 }} className="hint">#{i + 1}</td>
                    <td><b>{p.origin === 'CN' ? '🇨🇳' : '🌐'} {p.label}</b>{s.roles[r.role] === p.id && <span className="badge b-brass" style={{ marginLeft: 8 }}>{t('defaultModel')}</span>}</td>
                    <td className="hint">{p.perImageCny ? `¥${p.perImageCny} / ${s.lang === 'zh' ? '张' : 'image'}` : ''}</td>
                    <td style={{ textAlign: 'right' }}><span className={`badge ${p.connected ? 'b-ok' : 'b-neutral'}`}>{p.connected ? t('connected') : t('notConnected')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
        <section className="card panel">
          <h3 className="panel-title">💰 {t('monthlyCap')}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', maxWidth: 320 }}>
            <span>¥</span>
            <input className="input" type="number" min={0} step={50} value={s.capCny} onChange={e => d({ type: 'cap', cap: Math.max(0, +e.target.value) })} />
          </div>
        </section>
      </div>
    </div>
  );
}

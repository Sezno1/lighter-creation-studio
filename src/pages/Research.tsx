import { RESEARCH_SOURCES } from '../data';
import { useStore } from '../store';
import ResearchBadge from '../components/ResearchBadge';

export default function Research() {
  const { s, t } = useStore();
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">🔎 {t('researchTitle')}</h1>
          <p className="page-sub">{t('researchSub')}</p>
        </div>
      </div>
      <section className="card">
        <table className="table">
          <thead><tr><th>{t('source')}</th><th>{t('method')}</th><th>{t('status')}</th><th>{t('lastRun')}</th><th /></tr></thead>
          <tbody>
            {RESEARCH_SOURCES.map(r => (
              <tr key={r.id}>
                <td><b>{r[s.lang]}</b></td>
                <td>{r.method === 'auto' ? `🤖 ${t('auto')}` : `🧑‍💼 ${t('assisted')}`}</td>
                <td><ResearchBadge status={r.status} /></td>
                <td className="hint">{r.last}</td>
                <td style={{ textAlign: 'right' }}><button className="btn sm">▶️ {s.lang === 'zh' ? '开始' : 'Run'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

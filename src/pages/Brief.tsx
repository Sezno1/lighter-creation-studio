import { useState } from 'react';
import { MARKETS } from '../data';
import { useStore } from '../store';

const TYPES = [
  { id: 'windproof', en: 'Windproof flip-top', zh: '防风翻盖', e: '🧥' },
  { id: 'torch', en: 'Torch / jet', zh: '喷枪', e: '🔥' },
  { id: 'arc', en: 'USB arc / plasma', zh: 'USB电弧', e: '⚡' },
  { id: 'utility', en: 'Candle / BBQ', zh: '点火枪', e: '🕯️' },
  { id: 'disposable', en: 'Disposable', zh: '一次性', e: '♻️' }
];

export default function Brief() {
  const { s, d, t } = useStore();
  const [type, setType] = useState('windproof');
  const [markets, setMarkets] = useState<string[]>(['us', 'eu']);
  const toggle = (id: string) => setMarkets(m => (m.includes(id) ? m.filter(x => x !== id) : [...m, id]));
  const L = (zh: string, en: string) => (s.lang === 'zh' ? zh : en);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">📝 {t('briefTitle')}</h1>
          <p className="page-sub">{t('briefSub')}</p>
        </div>
        <span className="badge b-warn no-dot">⏳ {t('pending')}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section className="card panel">
          <h3 className="panel-title">🔥 {t('productType')}</h3>
          <div className="chips">
            {TYPES.map(x => <button key={x.id} className={`chip ${type === x.id ? 'on' : ''}`} onClick={() => setType(x.id)}>{x.e} {x[s.lang]}</button>)}
          </div>
        </section>

        <section className="card panel">
          <div className="grid-2">
            <div className="field"><label>⚙️ {t('mechanism')}</label><input className="input" defaultValue={L('翻盖、铰链、砂轮点火、可拆内胆', 'Flip lid, hinge, flint wheel, removable insert')} /></div>
            <div className="field"><label>📏 {t('size')}</label><input className="input" defaultValue="38 × 57 × 13 mm" /></div>
            <div className="field"><label>🧪 {t('materials')}</label><input className="input" defaultValue={L('锌合金、黄铜;电镀、拉丝、激光雕刻', 'Zinc alloy, brass; plating, brushing, laser engraving')} /></div>
            <div className="field"><label>🎨 {t('styleNotes')}</label><input className="input" defaultValue={L('高端礼品感,简洁,有质感', 'Premium gift feel, clean, tactile')} /></div>
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>🚫 {t('avoid')}</label>
            <textarea className="textarea" defaultValue={L('不模仿任何品牌的外形或标志;不做武器造型。', 'No copying any brand’s shape or logo; no weapon shapes.')} />
          </div>
        </section>

        <section className="card panel">
          <h3 className="panel-title">🌍 {t('markets')}</h3>
          <div className="chips">
            {MARKETS.map(m => <button key={m.id} className={`chip ${markets.includes(m.id) ? 'on' : ''}`} onClick={() => toggle(m.id)}>{m.flag} {m[s.lang]}</button>)}
          </div>
          {(markets.includes('us') || markets.includes('eu')) && (
            <div className="notice" style={{ marginTop: 16 }}><span>🛡️</span><span><b>{t('safety')}</b> · {t('safetyNote')}</span></div>
          )}
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={() => d({ type: 'page', page: 'generate' })}>✨ {t('nav_generate')}</button>
          <button className="btn primary" onClick={() => d({ type: 'toast', text: `✓ ${t('saved')}` })}>💾 {t('save')}</button>
        </div>
      </div>
    </div>
  );
}

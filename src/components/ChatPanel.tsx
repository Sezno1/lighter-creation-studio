import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import ConceptImage from './ConceptImage';

const SUGGEST = {
  zh: ['🎨 换三种配色', '🏷️ 起几个英文和中文名字', '🔀 把这两个结合起来', '🧪 换成黄铜材质'],
  en: ['🎨 Try three new palettes', '🏷️ Suggest names in EN and 中文', '🔀 Combine these two', '🧪 Switch to brass']
};

export default function ChatPanel() {
  const { s, d, t } = useStore();
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const ctx = s.concepts.filter(c => s.selected.includes(c.id));

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' }); }, [s.chat.length, typing]);

  const send = (msg: string) => {
    const m = msg.trim(); if (!m) return;
    d({ type: 'chatSend', text: m }); setText(''); setTyping(true);
    const names = ctx.map(c => c.name[s.lang]).join(s.lang === 'zh' ? '、' : ', ');
    // Mock reply until the real assistant is connected. ?tour=1 uses a scripted designer reply for preview videos.
    const tour = new URLSearchParams(location.search).has('tour');
    setTimeout(() => {
      setTyping(false);
      if (tour) {
        d({ type: 'chatReply', refs: s.selected, text: `好的,给「${names || '这个方案'}」推荐三种高端配色:\n\n1. 枪色 + 玫瑰金:沉稳,又有一点亮色\n2. 哑光黑 + 黄铜:经典礼品感\n3. 钛灰 + 宝蓝色带:更年轻、更有科技感\n\n需要的话,我可以按这三种配色各生成一张。` });
        return;
      }
      d({ type: 'chatReply', refs: s.selected, text: s.lang === 'zh'
        ? `(演示回复)收到。${names ? `针对 ${names}:` : ''}接上AI后,这里会根据选中的方案和设计卡给出具体建议,并可以一键生成新版本。`
        : `(Demo reply) Got it.${names ? ` For ${names}:` : ''} Once the AI is connected, it answers using the selected concepts and their design cards, and can generate new revisions in one click.` });
    }, 900);
  };

  return (
    <aside className="chat" aria-hidden={!s.chatOpen}>
      <div className="chat-inner">
        <div className="chat-head">
          <span>💬 {t('chat')}</span>
          <button className="icon-btn" onClick={() => d({ type: 'chatOpen', open: false })} aria-label="close">✕</button>
        </div>
        <div className="chat-context">
          <div className="ctx-label">{ctx.length ? `${t('inContext')} · ${ctx.length}` : t('noneSelected')}</div>
          {ctx.length > 0 && (
            <div className="ctx-list">
              {ctx.map(c => (
                <span key={c.id} className="ctx">
                  <span className="ctx-thumb"><ConceptImage c={c} /></span>{c.code}
                  <button onClick={() => d({ type: 'toggleSelect', id: c.id })} aria-label="remove">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="chat-log" ref={log}>
          {s.chat.length === 0 && !typing && <div className="chat-empty"><div className="big">🪄</div>{t('chatEmpty')}</div>}
          {s.chat.map(m => <div key={m.id} className={`msg ${m.role}`}>{m.text}</div>)}
          {typing && <div className="msg assistant typing"><i /><i /><i /></div>}
        </div>
        {s.chat.length === 0 && (
          <div className="chat-suggest">{SUGGEST[s.lang].map(x => <button key={x} className="chip" onClick={() => send(x)}>{x}</button>)}</div>
        )}
        <form className="chat-compose" onSubmit={e => { e.preventDefault(); send(text); }}>
          <input className="input" value={text} onChange={e => setText(e.target.value)} placeholder={t('chatPlaceholder')} />
          <button className="btn primary" disabled={!text.trim()}>{t('send')}</button>
        </form>
      </div>
    </aside>
  );
}

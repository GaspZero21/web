// pages/Chat.jsx
import { useState, useRef, useEffect } from 'react';

const INIT = [
  { id:1, from:'bot', text:'Hello Admin! 👋 3 new food listings are pending your review.', time:'09:15' },
  { id:2, from:'admin', text:"Thanks! I'll review them shortly.", time:'09:17' },
  { id:3, from:'bot', text:'Donor Sara Ahmed made 2 donations this week — 14 meals total 🌿', time:'09:18' },
];

const REPLIES = [
  'Got it! Processing now. 🌿',
  "Thanks for the update! I'll keep monitoring.",
  '✅ Done! Anything else you need?',
  '🌱 All systems operational. 14 pending donations to review.',
];

export default function Chat() {
  const [msgs, setMsgs] = useState(INIT);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    setMsgs(p => [...p, { id: Date.now(), from:'admin', text, time: now }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, { id: Date.now()+1, from:'bot', text: REPLIES[Math.floor(Math.random()*REPLIES.length)], time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }]);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      <div className="bg-white rounded-2xl border border-[#e2ece8] flex flex-col flex-1 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e2ece8] bg-[#FAF9F7] rounded-t-2xl">
          <div className="w-9 h-9 rounded-full bg-[#C96E4A] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">FS</div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-[#1a2e2e]">Food Saver Bot</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-[#6b8a82]">Online</span>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-[#6b8a82]">
            <span>🌱 87 meals/wk</span>
            <span>📦 3 pending</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col flex-1 gap-4 px-5 py-4 overflow-y-auto">
          <div className="text-center">
            <span className="text-xs text-[#6b8a82] bg-[#F5F0E8] px-3 py-1 rounded-full border border-[#e2ece8]">Today</span>
          </div>
          {msgs.map(m => (
            <div key={m.id} className={`flex items-end gap-2 ${m.from==='admin' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${m.from==='bot' ? 'bg-[#C96E4A]' : 'bg-[#0F5C5C]'}`}>
                {m.from==='bot' ? 'FS' : 'AD'}
              </div>
              <div className="max-w-[65%]">
                <div className={`px-4 py-2.5 text-sm leading-relaxed ${m.from==='admin' ? 'bg-[#0F5C5C] text-white rounded-2xl rounded-br-sm' : 'bg-[#e8f0ec] text-[#1a2e2e] rounded-2xl rounded-bl-sm'}`}>
                  {m.text}
                </div>
                <p className={`text-[10px] text-[#6b8a82] mt-1 ${m.from==='admin' ? 'text-right' : 'text-left'}`}>{m.time}</p>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-[#C96E4A] flex items-center justify-center text-white text-xs font-semibold">FS</div>
              <div className="bg-[#e8f0ec] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8FB0A1]" style={{ animation:`bounce 1s infinite ${i*0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#e2ece8] bg-[#FAF9F7] rounded-b-2xl flex gap-3">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Type a message… (Enter to send)"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm border border-[#e2ece8] bg-white text-[#1a2e2e] outline-none placeholder-[#6b8a82]"
          />
          <button onClick={send}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold border-none cursor-pointer"
            style={{ background: input.trim() ? '#0F5C5C' : '#e2ece8', color: input.trim() ? 'white' : '#6b8a82' }}>
            ↑
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}
import { useState, useRef, useEffect, useCallback } from 'react';
import { useUsers } from '../context/UsersContext';
import { useAuth } from '../context/AuthContext';
import { chatApi, donationsApi, createSocket } from '../api/api';

// ── helpers ──────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function fmtTime(date) {
  return (date ? new Date(date) : new Date())
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ROLE_COLORS = {
  FOOD_SAVER: '#d4a56a', ADMIN: '#7c1a10', DONATOR: '#0F5C5C',
  BENEFICIARY: '#C96E4A', COLLECTIVITE: '#3b3b8b', USER: '#8FB0A1',
};

const ROLE_LABELS = {
  FOOD_SAVER: 'Food Saver', ADMIN: 'Admin', DONATOR: 'Donor',
  BENEFICIARY: 'Beneficiary', COLLECTIVITE: 'Association', USER: 'User',
};

// ── Message bubble ────────────────────────────────────────────────
function Bubble({ msg, isOwn, adminId }) {
  const text = msg.content ?? msg.text ?? '';
  const color = isOwn ? '#C96E4A' : (msg.avatarColor ?? '#0F5C5C');
  const av = msg.avatar ?? initials(msg.senderName ?? msg.sender?.name ?? '?');

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
        style={{ background: color }}>
        {av}
      </div>
      <div className="max-w-[70%]">
        {!isOwn && (msg.senderName ?? msg.sender?.name) && (
          <p className="text-[10px] text-[#6b8a82] mb-1 ml-1">
            {msg.senderName ?? msg.sender?.name}
          </p>
        )}
        <div className={`px-4 py-2.5 text-sm leading-relaxed ${
          msg.hidden
            ? 'bg-[#fde8dc] text-[#8b3d1e] italic rounded-2xl'
            : isOwn
            ? 'bg-[#0F5C5C] text-white rounded-2xl rounded-br-sm'
            : 'bg-[#e8f0ec] text-[#1a2e2e] rounded-2xl rounded-bl-sm'
        }`}>
          {msg.hidden ? '🚫 Hidden by moderator' : text}
        </div>
        <p className={`text-[10px] text-[#6b8a82] mt-1 ${isOwn ? 'text-right' : ''}`}>
          {fmtTime(msg.createdAt ?? msg.time)}
          {msg.failed && <span className="text-[#C96E4A] ml-1">· failed</span>}
        </p>
      </div>
    </div>
  );
}

// ── User row in sidebar ───────────────────────────────────────────
function UserRow({ u, isActive, lastMsg, getRole, getStatus, getId, onClick }) {
  const id = getId(u);
  const name = u.name ?? u.fullName ?? u.email ?? 'User';
  const role = getRole(u);
  const status = getStatus(u);
  const color = ROLE_COLORS[role] ?? '#8FB0A1';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left border-none cursor-pointer border-b border-[#e2ece8] transition-colors"
      style={{ background: isActive ? '#e8f0ec' : 'transparent' }}
    >
      <div className="relative flex-shrink-0">
        <div className="flex items-center justify-center text-xs font-semibold text-white rounded-full w-9 h-9"
          style={{ background: color }}>
          {initials(name)}
        </div>
        {status === 'active' && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-medium text-[#1a2e2e] truncate">{name}</p>
          {lastMsg && (
            <span className="text-[9px] text-[#b0c4bc] flex-shrink-0">
              {fmtTime(lastMsg.createdAt ?? lastMsg.time)}
            </span>
          )}
        </div>
        <p className="text-xs text-[#6b8a82] truncate">
          {lastMsg
            ? (lastMsg.content ?? lastMsg.text ?? '').slice(0, 32) + '…'
            : u.email ?? ROLE_LABELS[role] ?? 'User'}
        </p>
      </div>
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function Chat() {
  const { users, loading: usersLoading, getRole, getStatus, getId } = useUsers();
  const { user: adminUser } = useAuth();

  // Sidebar
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users'); // 'users' | 'flagged'

  // Active conversation
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeReservationId, setActiveReservationId] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [resLoading, setResLoading] = useState(false);

  // Messages
  const [conversations, setConversations] = useState({});
  const [convLoading, setConvLoading] = useState(false);
  const [convError, setConvError] = useState('');

  // Flagged
  const [flagged, setFlagged] = useState([]);
  const [flaggedLoading, setFlaggedLoading] = useState(false);

  const [input, setInput] = useState('');

  const socketRef = useRef(null);
  const currentRoomRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeReservationId]);

  // ── Socket.io ──────────────────────────────────────────────────
  useEffect(() => {
    let socket;
    const loadSocketIO = () => {
      return new Promise(resolve => {
        if (window.io) return resolve(window.io);
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.min.js';
        s.onload = () => resolve(window.io);
        document.head.appendChild(s);
      });
    };

    loadSocketIO().then(() => {
      try {
        socket = createSocket();
        socketRef.current = socket;
        socket.on('joined', ({ room }) => console.log('[Socket] joined room:', room));
        socket.on('new_message', (msg) => {
          const room = currentRoomRef.current;
          if (!room) return;
          setConversations(prev => {
            const list = prev[room] ?? [];
            if (list.some(m => (m._id ?? m.id) === (msg._id ?? msg.id))) return prev;
            return { ...prev, [room]: [...list, msg] };
          });
        });
      } catch (e) {
        console.warn('[Socket] could not connect:', e.message);
      }
    });

    return () => socket?.disconnect();
  }, []);

  // ── Join room ──────────────────────────────────────────────────
  const joinRoom = useCallback(async (reservationId) => {
    if (!reservationId) return;
    if (currentRoomRef.current && currentRoomRef.current !== reservationId) {
      socketRef.current?.emit('leave_conversation', { reservationId: currentRoomRef.current });
    }
    currentRoomRef.current = reservationId;
    socketRef.current?.emit('join_conversation', { reservationId });

    if (conversations[reservationId]) return;

    setConvLoading(true);
    setConvError('');
    try {
      const { messages } = await chatApi.getConversation(reservationId);
      setConversations(prev => ({ ...prev, [reservationId]: messages ?? [] }));
    } catch (e) {
      if (!e.message?.includes('404')) setConvError('Could not load messages.');
      setConversations(prev => ({ ...prev, [reservationId]: [] }));
    } finally {
      setConvLoading(false);
    }
  }, [conversations]);

  // ── Select user ────────────────────────────────────────────────
  const selectUser = useCallback(async (u) => {
    const uid = getId(u);
    setActiveUserId(uid);
    setActiveReservationId(null);
    setReservations([]);
    setConvError('');
    setTab('users');
    setResLoading(true);

    try {
      const all = await donationsApi.getAll(1, 200);
      const userDonations = all.filter(d => {
        const donorId = d.donor?._id ?? d.donor?.id ?? d.donor;
        const recipientId = d.recipient?._id ?? d.recipient?.id ?? d.recipient ?? d.requestedBy?._id ?? d.requestedBy?.id;
        const createdById = d.createdBy?._id ?? d.createdBy?.id ?? d.createdBy ?? d.user?._id ?? d.user?.id;
        return [donorId, recipientId, createdById].some(id => id && String(id) === String(uid));
      });

      setReservations(userDonations);

      const confirmed = userDonations.find(d =>
        ['confirmed', 'active', 'in_progress', 'completed', 'delivered'].includes((d.status ?? '').toLowerCase())
      ) ?? userDonations[0];

      if (confirmed) {
        const rid = confirmed._id ?? confirmed.id;
        setActiveReservationId(rid);
        await joinRoom(rid);
      }
    } catch (e) {
      console.warn('[Chat] reservations:', e.message);
      setReservations([]);
    } finally {
      setResLoading(false);
    }
  }, [getId, joinRoom]);

  // ── Load flagged ─────────────────────────────────────────────── (Improved)
  const loadFlagged = useCallback(async () => {
    setFlaggedLoading(true);
    try {
      const res = await chatApi.getFlagged();
      
      // Debug: See exactly what the backend returns
      console.log('🔍 Flagged API response:', res);

      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && typeof res === 'object') {
        list = res.data || res.messages || res.flagged || res.results || [];
      }

      setFlagged(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load flagged messages:', err);
      setFlagged([]);
    } finally {
      setFlaggedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'flagged') loadFlagged();
  }, [tab, loadFlagged]);

  // ── Send message ───────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || !activeUser) return;
    setInput('');

    const reservationIdToUse = activeReservationId || `admin_${activeUserId}`;

    const opt = {
      _id: `opt_${Date.now()}`,
      from: 'admin',
      avatar: initials(adminUser?.name ?? 'AD'),
      avatarColor: '#C96E4A',
      senderName: adminUser?.name ?? 'Admin',
      sender: { _id: adminUser?._id ?? adminUser?.id },
      content: text,
      createdAt: new Date().toISOString(),
    };

    setConversations(prev => ({
      ...prev,
      [reservationIdToUse]: [...(prev[reservationIdToUse] ?? []), opt],
    }));

    try {
      const sent = await chatApi.sendMessage(reservationIdToUse, text);
      setConversations(prev => ({
        ...prev,
        [reservationIdToUse]: (prev[reservationIdToUse] ?? []).map(m =>
          m._id === opt._id ? (sent?.data ?? sent ?? opt) : m
        ),
      }));
    } catch {
      setConversations(prev => ({
        ...prev,
        [reservationIdToUse]: (prev[reservationIdToUse] ?? []).map(m =>
          m._id === opt._id ? { ...m, failed: true } : m
        ),
      }));
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  async function handleModerate(msg) {
    const action = msg.hidden ? 'restore' : 'hide';
    try {
      await chatApi.moderate(msg._id ?? msg.id, action);
      if (activeReservationId) {
        setConversations(prev => ({
          ...prev,
          [activeReservationId]: (prev[activeReservationId] ?? []).map(m =>
            (m._id ?? m.id) === (msg._id ?? msg.id) ? { ...m, hidden: !msg.hidden } : m
          ),
        }));
      }
      if (tab === 'flagged') loadFlagged();
    } catch (e) {
      alert('Moderate failed: ' + e.message);
    }
  }

  // ── Derived ────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (u?.name ?? u?.fullName ?? '').toLowerCase().includes(q) ||
           (u?.email ?? '').toLowerCase().includes(q);
  });

  const activeUser = activeUserId
    ? (users.find(u => String(getId(u)) === String(activeUserId)) ?? null)
    : null;

  const activeRole = activeUser ? getRole(activeUser) : null;
  const activeName = activeUser
    ? (activeUser.name ?? activeUser.fullName ?? activeUser.email ?? 'User')
    : '';

  const reservationIdToUse = activeReservationId || (activeUser ? `admin_${activeUserId}` : null);
  const currentMsgs = reservationIdToUse ? (conversations[reservationIdToUse] ?? []) : [];

  const canSend = activeUser && input.trim();

  return (
    <div className="flex h-[calc(100vh-128px)] overflow-hidden rounded-2xl border border-[#e2ece8] bg-white"
      style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>

      {/* LEFT SIDEBAR */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-[#e2ece8] bg-[#FAF9F7]">
        <div className="px-4 py-4 border-b border-[#e2ece8]">
          <p className="text-sm font-semibold text-[#1a2e2e] mb-3" style={{ fontFamily: 'DM Serif Display, serif' }}>
            Messages
          </p>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-xl px-3 py-2 text-xs border border-[#e2ece8] bg-white text-[#1a2e2e] outline-none"
          />
        </div>

        <div className="flex border-b border-[#e2ece8]">
          {[{ id: 'users', label: 'Users' }, { id: 'flagged', label: '⚑ Flagged' }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 text-xs font-medium border-none cursor-pointer transition-colors"
              style={{
                background: tab === t.id ? 'white' : 'transparent',
                color: tab === t.id ? '#0F5C5C' : '#6b8a82',
                borderBottom: tab === t.id ? '2px solid #0F5C5C' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'flagged' ? (
            flaggedLoading ? (
              <div className="py-8 text-center text-xs text-[#6b8a82]">Loading flagged messages…</div>
            ) : !Array.isArray(flagged) || flagged.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6b8a82]">No flagged messages yet.</div>
            ) : (
              flagged.map((msg, i) => (
                <div key={msg._id ?? msg.id ?? i} className="px-4 py-3 border-b border-[#e2ece8]">
                  <p className="text-xs text-[#1a2e2e] truncate font-medium">
                    {msg.content ?? msg.text ?? '—'}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#6b8a82]">
                      {msg.sender?.name ?? msg.senderName ?? 'Unknown'}
                    </span>
                    <button
                      onClick={() => handleModerate(msg)}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded border-none cursor-pointer"
                      style={{ 
                        background: msg.hidden ? '#d6ebe5' : '#fde0dc', 
                        color: msg.hidden ? '#0F5C5C' : '#7c1a10' 
                      }}
                    >
                      {msg.hidden ? 'Restore' : 'Hide'}
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            /* Users List */
            usersLoading ? (
              <div className="py-8 text-center text-xs text-[#6b8a82]">Loading users…</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6b8a82]">No users found.</div>
            ) : (
              filteredUsers.map(u => {
                const uid = getId(u);
                const msgs = activeUserId === uid && activeReservationId
                  ? (conversations[activeReservationId] ?? [])
                  : [];
                return (
                  <UserRow
                    key={uid}
                    u={u}
                    isActive={activeUserId === uid}
                    lastMsg={msgs[msgs.length - 1] ?? null}
                    getRole={getRole}
                    getStatus={getStatus}
                    getId={getId}
                    onClick={() => selectUser(u)}
                  />
                );
              })
            )
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Same as before */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e2ece8] bg-[#FAF9F7] flex-shrink-0">
          {tab === 'flagged' ? (
            <>
              <div className="w-9 h-9 rounded-full bg-[#fde0dc] flex items-center justify-center text-lg">⚑</div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1a2e2e]">Flagged Messages</p>
                <p className="text-xs text-[#6b8a82]">Admin moderation</p>
              </div>
              <button onClick={loadFlagged}
                className="text-xs px-3 py-1.5 rounded-xl border border-[#e2ece8] bg-white text-[#6b8a82] cursor-pointer">
                ↻ Refresh
              </button>
            </>
          ) : (
            <>
              <div className="relative flex-shrink-0">
                <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-9 h-9"
                  style={{ background: ROLE_COLORS[activeRole] ?? '#8FB0A1' }}>
                  {initials(activeName)}
                </div>
                {activeUser && getStatus(activeUser) === 'active' && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1a2e2e]">
                  {activeName || 'Select a user'}
                </p>
                <p className="text-xs text-[#6b8a82] mt-0.5 truncate">
                  {activeUser ? `${ROLE_LABELS[activeRole] ?? activeRole} · ${activeUser.email ?? ''}` : 'Click a user on the left'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex flex-col flex-1 gap-3 px-5 py-4 overflow-y-auto">
          {tab === 'flagged' ? (
            flaggedLoading ? (
              <div className="text-center py-16 text-sm text-[#6b8a82]">Loading…</div>
            ) : flagged.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                <div className="text-3xl">✅</div>
                <p className="text-sm font-medium text-[#1a2e2e]">No flagged messages</p>
                <p className="text-xs text-[#6b8a82]">All messages are clean.</p>
              </div>
            ) : (
              flagged.map((msg, i) => (
                <div key={msg._id ?? i} className="bg-[#FAF9F7] rounded-2xl p-4 border border-[#e2ece8]">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#C96E4A] flex items-center justify-center text-white text-[10px] font-semibold">
                        {initials(msg.sender?.name ?? '?')}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1a2e2e]">{msg.sender?.name ?? 'Unknown'}</p>
                        <p className="text-[10px] text-[#6b8a82]">{fmtTime(msg.createdAt)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleModerate(msg)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer flex-shrink-0"
                      style={{ background: msg.hidden ? '#d6ebe5' : '#fde0dc', color: msg.hidden ? '#0F5C5C' : '#7c1a10' }}
                    >
                      {msg.hidden ? '✓ Restore' : '🚫 Hide'}
                    </button>
                  </div>
                  <p className={`text-sm ${msg.hidden ? 'italic text-[#b0c4bc]' : 'text-[#1a2e2e]'}`}>
                    {msg.hidden ? '[Hidden by moderator]' : (msg.content ?? msg.text)}
                  </p>
                </div>
              ))
            )
          ) : (
            /* Normal Chat Area */
            <>
              <div className="text-center">
                <span className="text-xs text-[#6b8a82] bg-[#F5F0E8] px-3 py-1 rounded-full border border-[#e2ece8]">Today</span>
              </div>

              {!activeUser && (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
                  <div className="text-4xl">👥</div>
                  <p className="text-sm font-semibold text-[#1a2e2e]">Select a user</p>
                  <p className="text-xs text-[#6b8a82]">Choose a user from the left to start chatting</p>
                </div>
              )}

              {activeUser && resLoading && (
                <div className="flex flex-col items-center justify-center flex-1 gap-2">
                  <div className="text-2xl">🔍</div>
                  <p className="text-xs text-[#6b8a82]">Looking for conversations...</p>
                </div>
              )}

              {activeUser && !resLoading && reservations.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                  <div className="text-3xl">💬</div>
                  <p className="text-sm font-medium text-[#1a2e2e]">Admin Chat Mode</p>
                  <p className="text-xs text-[#6b8a82]">You can chat directly with {activeName}</p>
                </div>
              )}

              {!convLoading && currentMsgs.map(m => (
                <Bubble
                  key={m._id ?? m.id}
                  msg={m}
                  isOwn={m.from === 'admin' || String(m.sender?._id ?? '') === String(adminUser?._id ?? '')}
                  adminId={adminUser?._id}
                />
              ))}

              {!convLoading && currentMsgs.length === 0 && activeUser && (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                  <div className="text-3xl">💬</div>
                  <p className="text-sm font-medium text-[#1a2e2e]">No messages yet</p>
                  <p className="text-xs text-[#6b8a82]">Send the first message below.</p>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {tab !== 'flagged' && (
          <div className="px-4 py-3 border-t border-[#e2ece8] bg-[#FAF9F7] flex-shrink-0 flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={!canSend}
              placeholder={activeUser ? `Message ${activeName}…` : 'Select a user first…'}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm border border-[#e2ece8] bg-white text-[#1a2e2e] outline-none placeholder-[#6b8a82] disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!canSend}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-colors"
              style={{
                background: canSend ? '#0F5C5C' : '#e2ece8',
                color: canSend ? 'white' : '#6b8a82',
              }}
            >
              ↑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
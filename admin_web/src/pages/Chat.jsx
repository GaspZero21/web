import { useState, useRef, useEffect, useCallback } from 'react';
import { useUsers } from '../context/UsersContext';
import { useAuth } from '../context/AuthContext';
import { chatApi, donationsApi, createSocket, normaliseMessage } from '../api/api';

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
function Bubble({ msg, isOwn, onModerate }) {
  const text  = msg.content ?? msg.text ?? '';
  const color = isOwn ? '#C96E4A' : (msg.avatarColor ?? '#0F5C5C');
  const av    = msg.avatar ?? initials(msg.senderName ?? msg.sender?.name ?? '?');

  /**
   * A message can be in three visual states:
   *  1. Normal — show content
   *  2. Flagged (isFlagged=true, hidden=false) — show with red border + label
   *  3. Hidden by moderator (hidden=true) — show muted italic placeholder
   */
  const isFlagged = msg.isFlagged ?? false;
  const isHidden  = msg.hidden    ?? false;

  let bubbleBg    = isOwn ? '#0F5C5C' : '#e8f0ec';
  let bubbleColor = isOwn ? '#fff'    : '#1a2e2e';
  let bubbleBorder = 'none';
  let displayText  = text;

  if (isHidden) {
    bubbleBg     = '#fde8dc';
    bubbleColor  = '#8b3d1e';
    displayText  = '🚫 Hidden by moderator';
  } else if (isFlagged) {
    bubbleBg     = isOwn ? '#7c1a10' : '#fff5f5';
    bubbleColor  = isOwn ? '#fff'    : '#7c1a10';
    bubbleBorder = '1px solid #f5b8b8';
  }

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

        {/* Flagged label shown above the bubble */}
        {isFlagged && !isHidden && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#7c1a10',
              background: '#fde0dc', padding: '2px 8px', borderRadius: 10,
            }}>
              ⚑ Flagged
            </span>
            {onModerate && (
              <button
                onClick={() => onModerate(msg)}
                style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  border: 'none', cursor: 'pointer',
                  background: '#f0e8f5', color: '#6b2d8b',
                }}>
                Hide
              </button>
            )}
          </div>
        )}

        <div style={{
          padding: '10px 16px', fontSize: 14, lineHeight: 1.5, borderRadius: '16px',
          background: bubbleBg, color: bubbleColor, border: bubbleBorder,
          borderBottomRightRadius: isOwn ? 4 : 16,
          borderBottomLeftRadius:  isOwn ? 16 : 4,
          fontStyle: isHidden ? 'italic' : 'normal',
        }}>
          {displayText}
        </div>

        <p className={`text-[10px] text-[#6b8a82] mt-1 ${isOwn ? 'text-right' : ''}`}>
          {fmtTime(msg.createdAt ?? msg.time)}
          {msg.failed && <span className="text-[#C96E4A] ml-1">· failed</span>}
          {isFlagged && !isHidden && <span className="text-[#C96E4A] ml-1">· flagged</span>}
          {isHidden  && <span className="text-[#8b3d1e] ml-1">· hidden</span>}
        </p>

        {/* Restore button shown below a hidden bubble */}
        {isHidden && onModerate && (
          <button
            onClick={() => onModerate(msg)}
            style={{
              marginTop: 4, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 10,
              border: 'none', cursor: 'pointer', background: '#d6ebe5', color: '#0F5C5C',
              float: isOwn ? 'right' : 'left',
            }}>
            ✓ Restore
          </button>
        )}
      </div>
    </div>
  );
}

// ── User row in sidebar ───────────────────────────────────────────
function UserRow({ u, isActive, lastMsg, getRole, getStatus, getId, onClick }) {
  const name   = u.name ?? u.fullName ?? u.email ?? 'User';
  const role   = getRole(u);
  const status = getStatus(u);
  const color  = ROLE_COLORS[role] ?? '#8FB0A1';

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

// ── Flagged message card (right panel) ───────────────────────────
function FlaggedCard({ msg, onModerate }) {
  const isHidden = msg.hidden ?? false;
  const senderName = msg.sender?.name ?? msg.senderName ?? 'Unknown';

  return (
    <div style={{
      background: isHidden ? '#FAF9F7' : '#fff5f5',
      borderRadius: 16, padding: 16,
      border: isHidden ? '1px solid #e2ece8' : '1px solid #f5b8b8',
      transition: 'background 0.3s, border 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: isHidden ? '#b0c4bc' : '#C96E4A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700,
          }}>
            {initials(senderName)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#1a2e2e' }}>{senderName}</p>
            <p style={{ margin: 0, fontSize: 10, color: '#6b8a82' }}>{fmtTime(msg.createdAt)}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Status badge */}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
            background: isHidden ? '#f0e8f5' : '#fde0dc',
            color:      isHidden ? '#6b2d8b' : '#7c1a10',
          }}>
            {isHidden ? '🚫 Hidden' : '⚑ Flagged'}
          </span>

          {/* Action button */}
          <button
            onClick={() => onModerate(msg)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: isHidden ? '#d6ebe5' : '#fde0dc',
              color:      isHidden ? '#0F5C5C' : '#7c1a10',
            }}>
            {isHidden ? '✓ Restore' : '🚫 Hide'}
          </button>
        </div>
      </div>

      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.5,
        color:      isHidden ? '#b0c4bc' : '#1a2e2e',
        fontStyle:  isHidden ? 'italic'  : 'normal',
      }}>
        {isHidden
          ? '[Hidden by moderator]'
          : (msg.content ?? msg.text ?? '—')}
      </p>

      {/* Conversation link */}
      {(msg.conversationId ?? msg.reservationId) && (
        <p style={{ margin: '8px 0 0', fontSize: 10, color: '#b0c4bc' }}>
          Conversation: {msg.conversationId ?? msg.reservationId}
        </p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function Chat() {
  const { users, loading: usersLoading, getRole, getStatus, getId } = useUsers();
  const { user: adminUser } = useAuth();

  const [search, setSearch] = useState('');
  const [tab,    setTab]    = useState('users'); // 'users' | 'flagged'

  const [activeUserId,       setActiveUserId]       = useState(null);
  const [activeReservationId,setActiveReservationId] = useState(null);
  const [reservations,       setReservations]        = useState([]);
  const [resLoading,         setResLoading]          = useState(false);

  const [conversations, setConversations] = useState({});
  const [convLoading,   setConvLoading]   = useState(false);
  const [convError,     setConvError]     = useState('');

  const [flagged,        setFlagged]        = useState([]);
  const [flaggedLoading, setFlaggedLoading] = useState(false);
  const [flaggedError,   setFlaggedError]   = useState('');
  const [flaggedPagination, setFlaggedPagination] = useState(null);

  /**
   * canViewFlagged: set to false only after a confirmed 403.
   * Prevents hammering a forbidden endpoint.
   */
  const [canViewFlagged, setCanViewFlagged] = useState(true);

  const [input, setInput] = useState('');

  const socketRef       = useRef(null);
  const currentRoomRef  = useRef(null);
  const bottomRef       = useRef(null);
  const inputRef        = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeReservationId]);

  // ── Socket.io ──────────────────────────────────────────────────
  useEffect(() => {
    let socket;
    const loadSocketIO = () => new Promise(resolve => {
      if (window.io) return resolve(window.io);
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.min.js';
      s.onload = () => resolve(window.io);
      document.head.appendChild(s);
    });

    loadSocketIO().then(() => {
      try {
        socket = createSocket();
        socketRef.current = socket;
        socket.on('joined', ({ room }) => console.log('[Socket] joined room:', room));
        socket.on('new_message', (rawMsg) => {
          const room = currentRoomRef.current;
          if (!room) return;
          const msg = normaliseMessage(rawMsg);  // normalise incoming socket messages too
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
      // messages are already normalised inside chatApi.getConversation()
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
    setResLoading(true);

    try {
      const all = await donationsApi.getAll();
      const userDonations = all.filter(d => {
        const donorId     = d.donor?._id ?? d.donor?.id ?? d.donor;
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

  // ── Load flagged messages ──────────────────────────────────────
  const loadFlagged = useCallback(async () => {
    if (!canViewFlagged) return;
    setFlaggedLoading(true);
    setFlaggedError('');
    try {
      /**
       * chatApi.getFlagged() now returns { messages, pagination, raw }
       * where each message is already normalised (isFlagged + hidden fields set).
       *
       * The API Swagger shows the shape:
       * { success, data: { messages: [...], pagination: { total, page, limit, totalPages } } }
       *
       * The normaliseMessage() in api.js maps:
       *   isVisible === false  →  hidden = true
       *   isFlagged            →  isFlagged = true
       */
      const { messages, pagination } = await chatApi.getFlagged();
      setFlagged(messages);
      setFlaggedPagination(pagination);
    } catch (err) {
      const statusCode = parseInt(err.message?.slice(0, 3), 10);
      if (statusCode === 403) {
        // Admin token doesn't have the required role — don't retry
        setCanViewFlagged(false);
        setFlagged([]);
      } else {
        console.error('[Chat] Failed to load flagged messages:', err.message);
        setFlaggedError('Failed to load flagged messages: ' + err.message);
        setFlagged([]);
      }
    } finally {
      setFlaggedLoading(false);
    }
  }, [canViewFlagged]);

  // Fire loadFlagged when the tab is switched to 'flagged'
  useEffect(() => {
    if (tab === 'flagged') loadFlagged();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

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
      isFlagged: false,
      hidden: false,
    };

    setConversations(prev => ({
      ...prev,
      [reservationIdToUse]: [...(prev[reservationIdToUse] ?? []), opt],
    }));

    try {
      const sent = await chatApi.sendMessage(reservationIdToUse, text);
      const normSent = sent ? normaliseMessage(sent?.data ?? sent) : opt;
      setConversations(prev => ({
        ...prev,
        [reservationIdToUse]: (prev[reservationIdToUse] ?? []).map(m =>
          m._id === opt._id ? normSent : m
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  /**
   * Moderate a message (hide or restore).
   * Updates both the flagged list AND the active conversation optimistically
   * so the admin sees the change immediately.
   */
  async function handleModerate(msg) {
    const msgId  = msg._id ?? msg.id;
    const action = msg.hidden ? 'restore' : 'hide';
    const newHidden = !msg.hidden;

    // Optimistic update for flagged list
    setFlagged(prev => prev.map(m =>
      (m._id ?? m.id) === msgId ? { ...m, hidden: newHidden } : m
    ));

    // Optimistic update for active conversation (if the message lives there too)
    if (activeReservationId) {
      setConversations(prev => ({
        ...prev,
        [activeReservationId]: (prev[activeReservationId] ?? []).map(m =>
          (m._id ?? m.id) === msgId ? { ...m, hidden: newHidden } : m
        ),
      }));
    }

    try {
      await chatApi.moderate(msgId, action);
      // Re-fetch flagged list to get server-confirmed state
      if (tab === 'flagged') loadFlagged();
    } catch (e) {
      // Revert optimistic updates on error
      setFlagged(prev => prev.map(m =>
        (m._id ?? m.id) === msgId ? { ...m, hidden: msg.hidden } : m
      ));
      if (activeReservationId) {
        setConversations(prev => ({
          ...prev,
          [activeReservationId]: (prev[activeReservationId] ?? []).map(m =>
            (m._id ?? m.id) === msgId ? { ...m, hidden: msg.hidden } : m
          ),
        }));
      }
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

  const activeRole  = activeUser ? getRole(activeUser) : null;
  const activeName  = activeUser
    ? (activeUser.name ?? activeUser.fullName ?? activeUser.email ?? 'User')
    : '';

  const reservationIdToUse = activeReservationId || (activeUser ? `admin_${activeUserId}` : null);
  const currentMsgs        = reservationIdToUse ? (conversations[reservationIdToUse] ?? []) : [];
  const canSend            = activeUser && input.trim();

  // Count of unflagged-but-not-hidden flagged messages (for badge)
  const pendingFlaggedCount = flagged.filter(m => !m.hidden).length;

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
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-xl px-3 py-2 text-xs border border-[#e2ece8] bg-white text-[#1a2e2e] outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e2ece8]">
          {[
            { id: 'users',   label: 'Users' },
            {
              id: 'flagged',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⚑ Flagged
                  {pendingFlaggedCount > 0 && (
                    <span style={{
                      background: '#C96E4A', color: '#fff',
                      fontSize: 9, fontWeight: 700,
                      borderRadius: 10, padding: '1px 5px',
                      lineHeight: 1.4,
                    }}>
                      {pendingFlaggedCount}
                    </span>
                  )}
                </span>
              ),
            },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 text-xs font-medium border-none cursor-pointer transition-colors"
              style={{
                background:   tab === t.id ? 'white' : 'transparent',
                color:        tab === t.id ? '#0F5C5C' : '#6b8a82',
                borderBottom: tab === t.id ? '2px solid #0F5C5C' : '2px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'flagged' ? (
            /* ── Flagged tab sidebar ── */
            !canViewFlagged ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-[#6b8a82]">Access denied.</p>
                <p className="text-[10px] text-[#b0c4bc] mt-1">Your account needs the ADMIN role to view flagged messages.</p>
              </div>
            ) : flaggedLoading ? (
              <div className="py-8 text-center text-xs text-[#6b8a82]">Loading flagged messages…</div>
            ) : flagged.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6b8a82]">No flagged messages yet.</div>
            ) : (
              flagged.map((msg, i) => (
                <div
                  key={msg._id ?? msg.id ?? i}
                  className="px-4 py-3 border-b border-[#e2ece8]"
                  style={{ background: msg.hidden ? 'transparent' : '#fff5f5' }}
                >
                  <p className="text-xs text-[#1a2e2e] truncate font-medium">
                    {msg.hidden ? '[Hidden]' : (msg.content ?? msg.text ?? '—')}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#6b8a82]">
                      {msg.sender?.name ?? msg.senderName ?? 'Unknown'}
                    </span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {!msg.hidden && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#7c1a10', background: '#fde0dc', padding: '1px 6px', borderRadius: 8 }}>
                          ⚑
                        </span>
                      )}
                      <button onClick={() => handleModerate(msg)}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded border-none cursor-pointer"
                        style={{ background: msg.hidden ? '#d6ebe5' : '#fde0dc', color: msg.hidden ? '#0F5C5C' : '#7c1a10' }}>
                        {msg.hidden ? 'Restore' : 'Hide'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            /* ── Users tab sidebar ── */
            usersLoading ? (
              <div className="py-8 text-center text-xs text-[#6b8a82]">Loading users…</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6b8a82]">No users found.</div>
            ) : (
              filteredUsers.map(u => {
                const uid  = getId(u);
                const msgs = activeUserId === uid && activeReservationId
                  ? (conversations[activeReservationId] ?? []) : [];
                return (
                  <UserRow key={uid} u={u} isActive={activeUserId === uid}
                    lastMsg={msgs[msgs.length - 1] ?? null}
                    getRole={getRole} getStatus={getStatus} getId={getId}
                    onClick={() => selectUser(u)} />
                );
              })
            )
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e2ece8] bg-[#FAF9F7] flex-shrink-0">
          {tab === 'flagged' ? (
            <>
              <div className="w-9 h-9 rounded-full bg-[#fde0dc] flex items-center justify-center text-lg">⚑</div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1a2e2e]">
                  Flagged Messages
                  {pendingFlaggedCount > 0 && (
                    <span style={{
                      marginLeft: 8, fontSize: 11, fontWeight: 700,
                      background: '#C96E4A', color: '#fff',
                      padding: '2px 8px', borderRadius: 10,
                    }}>
                      {pendingFlaggedCount} pending
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#6b8a82]">
                  {flaggedPagination
                    ? `${flaggedPagination.total} total · page ${flaggedPagination.page}/${flaggedPagination.totalPages}`
                    : 'Admin moderation'}
                </p>
              </div>
              {canViewFlagged && (
                <button onClick={loadFlagged}
                  disabled={flaggedLoading}
                  className="text-xs px-3 py-1.5 rounded-xl border border-[#e2ece8] bg-white text-[#6b8a82] cursor-pointer">
                  {flaggedLoading ? '…' : '↻ Refresh'}
                </button>
              )}
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
                <p className="font-semibold text-sm text-[#1a2e2e]">{activeName || 'Select a user'}</p>
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
            !canViewFlagged ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                <div className="text-3xl">🔒</div>
                <p className="text-sm font-medium text-[#1a2e2e]">Access Denied</p>
                <p className="text-xs text-[#6b8a82]">Your account requires the ADMIN role to moderate flagged messages.</p>
              </div>
            ) : flaggedLoading ? (
              <div className="text-center py-16 text-sm text-[#6b8a82]">Loading flagged messages…</div>
            ) : flaggedError ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                <div className="text-3xl">⚠️</div>
                <p className="text-sm font-medium text-[#1a2e2e]">Error loading flagged messages</p>
                <p className="text-xs text-[#6b8a82]">{flaggedError}</p>
                <button onClick={loadFlagged}
                  className="mt-2 text-xs px-4 py-2 rounded-xl border border-[#e2ece8] bg-white text-[#6b8a82] cursor-pointer">
                  ↻ Try again
                </button>
              </div>
            ) : flagged.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                <div className="text-3xl">✅</div>
                <p className="text-sm font-medium text-[#1a2e2e]">No flagged messages</p>
                <p className="text-xs text-[#6b8a82]">All messages are clean.</p>
              </div>
            ) : (
              /* ── Render flagged message cards ── */
              flagged.map((msg, i) => (
                <FlaggedCard key={msg._id ?? msg.id ?? i} msg={msg} onModerate={handleModerate} />
              ))
            )
          ) : (
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

              {convError && (
                <p className="text-xs text-[#C96E4A] text-center">{convError}</p>
              )}

              {!convLoading && currentMsgs.map(m => (
                <Bubble
                  key={m._id ?? m.id}
                  msg={m}
                  isOwn={m.from === 'admin' || String(m.sender?._id ?? '') === String(adminUser?._id ?? '')}
                  onModerate={handleModerate}
                />
              ))}

              {!convLoading && currentMsgs.length === 0 && activeUser && !resLoading && (
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
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              disabled={!canSend}
              placeholder={activeUser ? `Message ${activeName}…` : 'Select a user first…'}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm border border-[#e2ece8] bg-white text-[#1a2e2e] outline-none placeholder-[#6b8a82] disabled:opacity-50"
            />
            <button onClick={send} disabled={!canSend}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-colors"
              style={{ background: canSend ? '#0F5C5C' : '#e2ece8', color: canSend ? 'white' : '#6b8a82' }}>
              ↑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// components/DonationDetailModal.jsx
import { useState, useEffect } from 'react';
import { donationsApi } from '../api/api';

function getName(obj) {
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  return obj.name ?? obj.fullName ?? obj.email ?? obj._id ?? null;
}

function formatDate(raw) {
  if (!raw) return '—';
  try {
    return new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function Avatar({ name, color = '#0F5C5C', size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, flexShrink: 0,
    }}>
      {name ? name.slice(0, 2).toUpperCase() : '?'}
    </div>
  );
}

const STATUS_COLORS = {
  pending:      { bg: '#fef3cd', text: '#7c5c10' },
  completed:    { bg: '#d6ebe5', text: '#0F5C5C' },
  delivered:    { bg: '#d6ebe5', text: '#0F5C5C' },
  cancelled:    { bg: '#fde0dc', text: '#7c1a10' },
  'in transit': { bg: '#e8f0ec', text: '#0F5C5C' },
  active:       { bg: '#d6ebe5', text: '#0F5C5C' },
  approved:     { bg: '#d6ebe5', text: '#0F5C5C' },
  rejected:     { bg: '#fde0dc', text: '#7c1a10' },
};

function RequesterRow({ reservation, onApprove, onReject, busy }) {
  const user = reservation?.user ?? reservation?.beneficiary ?? reservation?.requestedBy;
  const name = getName(user) ?? 'Unknown user';
  const resStatus = (reservation?.status ?? '').toLowerCase();
  const statusC = STATUS_COLORS[resStatus] ?? { bg: '#F5F0E8', text: '#6b8a82' };
  const resId = reservation?._id ?? reservation?.id;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0ece4' }}>
      <Avatar name={name} color="#8FB0A1" size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a2e2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
        {reservation?.createdAt && (
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b8a82' }}>Requested {formatDate(reservation.createdAt)}</p>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: statusC.bg, color: statusC.text, textTransform: 'capitalize', flexShrink: 0 }}>
        {resStatus || 'pending'}
      </span>
      {(resStatus === 'pending' || !resStatus) && (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button disabled={busy === resId} onClick={() => onApprove(resId)}
            style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#d6ebe5', color: '#0F5C5C', fontWeight: 600, fontSize: 12 }}>
            {busy === resId ? '…' : '✓ Approve'}
          </button>
          <button disabled={busy === resId} onClick={() => onReject(resId)}
            style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fde0dc', color: '#7c1a10', fontWeight: 600, fontSize: 12 }}>
            {busy === resId ? '…' : '✕ Reject'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DonationDetailModal({ donation: d, reservations: allReservations = [], onClose, onAction }) {
  const [reservations, setReservations] = useState([]);
  const [resBusy, setResBusy] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [localHidden, setLocalHidden] = useState(null);

  const id = d?._id ?? d?.id ?? null;
  const food = d?.foodType ?? d?.food ?? d?.title ?? d?.description ?? '—';
  const qty = d?.quantity != null ? `${d.quantity}${d?.unit ? ' ' + d.unit : ''}` : (d?.qty ?? '—');
  const status = (d?.status ?? 'pending').toLowerCase();
  const statusC = STATUS_COLORS[status] ?? { bg: '#F5F0E8', text: '#6b8a82' };
  const photoUrl = d?.image ?? d?.photo ?? d?.imageUrl ?? d?.img ?? d?.picture ?? null;

  // ✅ isHidden: use localHidden for optimistic UI, fall back to donation data
  const isHidden = localHidden !== null
    ? localHidden
    : (d?.isHidden ?? d?.hidden ?? (d?.visibility === false) ?? false);

  const postedBy = getName(d?.donor ?? d?.user ?? d?.postedBy ?? d?.createdBy ?? d?.owner ?? d?.author);
  const deliveredBy = getName(d?.deliveredBy ?? d?.volunteer ?? d?.foodSaver ?? d?.courier ?? d?.assignedTo);

  useEffect(() => {
    setLocalHidden(null);
    setConfirmCancel(false);
    setActionBusy(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReservations(allReservations.filter(r =>
      (r.donation ?? r.donationId) === id ||
      (r.donation?._id ?? r.donation?.id) === id
    ));
  }, [allReservations, id]);

  if (!d) return null;

  // ✅ FIXED hide/unhide logic:
  // isHidden = true  → donation is currently hidden → we want to UNHIDE → send isHidden: false
  // isHidden = false → donation is currently visible → we want to HIDE  → send isHidden: true
  // The new target state is always the OPPOSITE of the current state.
  async function handleToggleVisibility() {
    if (!id) return;

    const newHiddenState = !isHidden;   // flip: visible→hidden, hidden→visible
    setLocalHidden(newHiddenState);      // optimistic UI update immediately
    setActionBusy(true);

    try {
      // API: PATCH /api/v1/admin/donations/{id}/visibility  { isHidden: true|false }
      // We pass `currentlyHidden = isHidden` so toggleVisibility sends !isHidden = newHiddenState
      await donationsApi.toggleVisibility(id, isHidden);
      await onAction?.();   // refresh parent list so Visibility column updates
    } catch (e) {
      setLocalHidden(isHidden);   // revert on error
      alert('Failed to update visibility: ' + e.message);
    } finally {
      setActionBusy(false);
    }
  }

  async function act(fn) {
    setActionBusy(true);
    try {
      await fn();
      await onAction?.();
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionBusy(false);
      setConfirmCancel(false);
    }
  }

  async function handleApprove(resId) {
    setResBusy(resId);
    try {
      const token = localStorage.getItem('madad_access_token');
      await fetch(`https://gasp-test-production.up.railway.app/api/v1/reservations/${resId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'approved' }),
      });
      await onAction?.();
      setReservations(prev => prev.map(r => ((r._id ?? r.id) === resId ? { ...r, status: 'approved' } : r)));
    } catch (e) { alert(e.message); }
    finally { setResBusy(null); }
  }

  async function handleReject(resId) {
    setResBusy(resId);
    try {
      const token = localStorage.getItem('madad_access_token');
      await fetch(`https://gasp-test-production.up.railway.app/api/v1/reservations/${resId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'rejected' }),
      });
      await onAction?.();
      setReservations(prev => prev.map(r => ((r._id ?? r.id) === resId ? { ...r, status: 'rejected' } : r)));
    } catch (e) { alert(e.message); }
    finally { setResBusy(null); }
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 40,
        background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(3px)',
      }} />

      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(15,92,92,0.20)',
          pointerEvents: 'auto', overflow: 'hidden',
        }}>
          {photoUrl && (
            <div style={{ position: 'relative', height: 200, background: '#f0ece4', flexShrink: 0 }}>
              <img src={photoUrl} alt={food}
                onError={e => { e.currentTarget.parentNode.style.display = 'none'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button onClick={onClose} style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 10,
                width: 34, height: 34, cursor: 'pointer', fontSize: 16, color: '#1a2e2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
              }}>✕</button>
            </div>
          )}

          <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #e2ece8', display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: '#6b8a82', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DONATION DETAIL</p>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a2e2e', margin: 0 }}>{food}</h2>
              {d.category && <p style={{ fontSize: 14, color: '#6b8a82', margin: '4px 0 0' }}>{d.category}</p>}
            </div>
            {!photoUrl && (
              <button onClick={onClose} style={{
                background: '#F5F0E8', border: 'none', borderRadius: 10, width: 34, height: 34,
                cursor: 'pointer', fontSize: 16, color: '#6b8a82',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>✕</button>
            )}
          </div>

          {/* Status Badges */}
          <div style={{ padding: '12px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #e2ece8', flexShrink: 0 }}>
            <span style={{
              fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 9999,
              background: statusC.bg, color: statusC.text, textTransform: 'capitalize',
            }}>
              {status}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 9999,
              background: isHidden ? '#f0e8f5' : '#e8f0ec',
              color: isHidden ? '#6b2d8b' : '#0F5C5C',
            }}>
              {isHidden ? '🚫 Hidden from users' : '✓ Visible to users'}
            </span>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            <p style={{ fontSize: 11, color: '#6b8a82', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DETAILS</p>
            <div style={{ borderRadius: 14, border: '1px solid #e2ece8', padding: '4px 16px', marginBottom: 20 }}>
              {[
                ['QUANTITY', qty],
                ['CATEGORY', d.category],
                ['PICKUP ADDR', d.pickupAddress ?? d.address ?? d.location],
                ['CREATED', formatDate(d.createdAt ?? d.date ?? d.donatedAt)],
              ].map(([label, value]) => value && value !== '—' ? (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0ece4' }}>
                  <span style={{ fontSize: 13, color: '#6b8a82', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ fontSize: 14, color: '#1a2e2e', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                </div>
              ) : null)}
            </div>

            <p style={{ fontSize: 11, color: '#6b8a82', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              REQUESTS ({reservations.length})
            </p>
            <div style={{ borderRadius: 14, border: '1px solid #e2ece8', padding: '4px 16px', marginBottom: 8 }}>
              {reservations.length === 0 ? (
                <p style={{ fontSize: 14, color: '#b0c4bc', fontStyle: 'italic', padding: '20px 0', margin: 0, textAlign: 'center' }}>
                  No requests yet for this donation.
                </p>
              ) : reservations.map(r => (
                <RequesterRow key={r._id ?? r.id} reservation={r} onApprove={handleApprove} onReject={handleReject} busy={resBusy} />
              ))}
            </div>

            <p style={{ fontSize: 11, color: '#b0c4bc', margin: '12px 0 0' }}>ID: {id}</p>
          </div>

          {/* ✅ Footer — button text and color always reflect the CURRENT state */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2ece8', background: '#FAFAF8' }}>
            <button
              disabled={actionBusy}
              onClick={handleToggleVisibility}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                cursor: actionBusy ? 'not-allowed' : 'pointer',
                background: isHidden ? '#e8f0ec' : '#f3e8f5',
                color: isHidden ? '#0F5C5C' : '#9f4a8f',
                fontWeight: 700, fontSize: 15,
                opacity: actionBusy ? 0.7 : 1,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {actionBusy
                ? 'Updating...'
                : isHidden
                  ? '👁 Make visible to users'
                  : '🚫 Hide from users'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
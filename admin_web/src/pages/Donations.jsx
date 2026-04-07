// pages/Donations.jsx — fully dynamic from /api/v1/donations
import { useState, useEffect, useCallback } from 'react';
import { donationsApi, reservationsApi } from '../api/api'; // ✅ fixed import

const STATUS_STYLES = {
  pending:    'bg-[#fef3cd] text-[#7c5c10]',
  completed:  'bg-[#d6ebe5] text-[#0F5C5C]',
  delivered:  'bg-[#d6ebe5] text-[#0F5C5C]',
  cancelled:  'bg-[#fde0dc] text-[#7c1a10]',
  'in transit':'bg-[#e8f0ec] text-[#0F5C5C]',
  active:     'bg-[#d6ebe5] text-[#0F5C5C]',
};

function statusStyle(s = '') {
  return STATUS_STYLES[s.toLowerCase()] ?? 'bg-[#F5F0E8] text-[#6b8a82]';
}

function getName(obj) {
  if (!obj) return '—';
  if (typeof obj === 'string') return obj;
  return obj.name ?? obj.fullName ?? obj.email ?? obj._id ?? '—';
}

function formatDate(raw) {
  if (!raw) return '—';
  try { return new Date(raw).toISOString().slice(0, 10); }
  catch { return '—'; }
}

export default function Donations() {
  const [donations,    setDonations]    = useState([]);
  const [reservations, setReservations] = useState([]); // ✅ grouped with other state
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('All');
  const [confirm,      setConfirm]      = useState(null);
  const [actionLoad,   setActionLoad]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [donationsList, reservationsList] = await Promise.all([
        donationsApi.getAll(),
        reservationsApi.getAll(), // ✅ now works — properly imported
      ]);
      setDonations(donationsList);
      setReservations(reservationsList);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCancel(id) {
    setActionLoad(id);
    try {
      await donationsApi.cancel(id);
      await load();
    } catch (e) {
      alert('Failed to cancel: ' + e.message);
    } finally {
      setActionLoad(null);
      setConfirm(null);
    }
  }

  async function handleComplete(id) {
    setActionLoad(id);
    try {
      await donationsApi.complete(id);
      await load();
    } catch (e) {
      alert('Failed to complete: ' + e.message);
    } finally {
      setActionLoad(null);
    }
  }

  const statuses = ['All', 'pending', 'completed', 'cancelled', 'in transit'];

  const filtered = donations.filter(d => {
    const donor     = getName(d.donor ?? d.user ?? d.postedBy ?? d.createdBy ?? d.owner ?? d.author);
    const recipient = getName(d.requestedBy ?? d.requestor ?? d.beneficiary ?? d.recipient);
    const food      = d.foodType ?? d.food ?? d.title ?? d.description ?? '';
    const status    = (d.status ?? '').toLowerCase();
    const q         = search.toLowerCase();
    const matchQ    = donor.toLowerCase().includes(q) || food.toLowerCase().includes(q) || recipient.toLowerCase().includes(q);
    const matchF    = filter === 'All' || status === filter.toLowerCase();
    return matchQ && matchF;
  });

  const counts = { All: donations.length };
  statuses.slice(1).forEach(s => {
    counts[s] = donations.filter(d => (d.status ?? '').toLowerCase() === s).length;
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a2e2e]"
            style={{ fontFamily: 'DM Serif Display, serif' }}>Donations</h1>
          <p className="text-sm text-[#6b8a82] mt-0.5">
            {loading ? 'Loading…' : `${donations.length} total donations`}
          </p>
        </div>
        <button onClick={load}
          className="px-3 py-2.5 rounded-xl text-sm border border-[#e2ece8] bg-white text-[#6b8a82] cursor-pointer">
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 text-sm rounded-xl"
          style={{ background: '#fde8dc', color: '#8b3d1e', border: '1px solid #f5c6a8' }}>
          ⚠ {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2ece8] flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by donor, food, or recipient…"
          className="flex-1 min-w-[180px] rounded-xl px-4 py-2 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-2 text-xs font-medium capitalize border-none cursor-pointer rounded-xl"
              style={{
                background: filter === s ? '#0F5C5C' : '#F5F0E8',
                color:      filter === s ? 'white'   : '#6b8a82',
              }}>
              {s} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        {loading ? (
          <div className="text-center py-16 text-sm text-[#6b8a82]">Loading donations…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F5F0E8]">
                  {['Food / Type', 'Posted By', 'Requested By', 'Delivered By', 'Qty', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const id   = d._id ?? d.id;
                  const food = d.foodType ?? d.food ?? d.title ?? d.description ?? '—';
                  const qty  = d.quantity != null ? `${d.quantity}${d.unit ? ' ' + d.unit : ''}` : (d.qty ?? '—');
                  const status = d.status ?? 'pending';
                  const date   = formatDate(d.createdAt ?? d.date ?? d.donatedAt);

                  const postedBy    = getName(d.donor ?? d.user ?? d.postedBy ?? d.createdBy ?? d.owner ?? d.author);
                  const deliveredBy = getName(d.deliveredBy ?? d.volunteer ?? d.foodSaver ?? d.courier ?? d.assignedTo);

                  // ✅ Try donation fields first, then fall back to matched reservation
                  const rawRequestedBy = getName(d.requestedBy ?? d.requestor ?? d.beneficiary ?? d.recipient);
                  const reservation    = reservations.find(r =>
                    (r.donation ?? r.donationId) === id ||
                    (r.donation?._id ?? r.donation?.id) === id
                  );
                  const requestedBy = rawRequestedBy !== '—'
                    ? rawRequestedBy
                    : getName(reservation?.user ?? reservation?.beneficiary ?? reservation?.requestedBy ?? reservation?.createdBy);

                  const isBusy = actionLoad === id;

                  return (
                    <tr key={id} className="border-t border-[#e2ece8] hover:bg-[#FAF9F7]">
                      {/* Food */}
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-[#1a2e2e]">{food}</p>
                        {d.category && (
                          <p className="text-xs text-[#6b8a82] mt-0.5">{d.category}</p>
                        )}
                      </td>

                      {/* Posted by */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#0F5C5C] flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0">
                            {postedBy !== '—' ? postedBy.slice(0, 2).toUpperCase() : '?'}
                          </div>
                          <span className="text-sm text-[#1a2e2e] truncate max-w-[120px]">{postedBy}</span>
                        </div>
                      </td>

                      {/* Requested by */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#8FB0A1] flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0">
                            {requestedBy !== '—' ? requestedBy.slice(0, 2).toUpperCase() : '?'}
                          </div>
                          <span className="text-sm text-[#1a2e2e] truncate max-w-[120px]">{requestedBy}</span>
                        </div>
                      </td>

                      {/* Delivered by */}
                      <td className="px-5 py-3">
                        {deliveredBy !== '—' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#d4a56a] flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0">
                              {deliveredBy.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm text-[#1a2e2e] truncate max-w-[120px]">{deliveredBy}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#b0c4bc] italic">Not assigned</span>
                        )}
                      </td>

                      {/* Qty */}
                      <td className="px-5 py-3 text-sm text-[#6b8a82] whitespace-nowrap">{qty}</td>

                      {/* Date */}
                      <td className="px-5 py-3 text-xs text-[#6b8a82] whitespace-nowrap">{date}</td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyle(status)}`}>
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {status === 'pending' && (
                            <button
                              onClick={() => handleComplete(id)}
                              disabled={isBusy}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border-none cursor-pointer"
                              style={{ background: '#d6ebe5', color: '#0F5C5C' }}>
                              {isBusy ? '…' : '✓ Complete'}
                            </button>
                          )}
                          {(status === 'pending' || status === 'active') && (
                            <button
                              onClick={() => setConfirm(id)}
                              disabled={isBusy}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border-none cursor-pointer"
                              style={{ background: '#fef3cd', color: '#7c5c10' }}>
                              Cancel
                            </button>
                          )}
                          {(status === 'completed' || status === 'cancelled') && (
                            <span className="text-xs text-[#b0c4bc] italic">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-[#6b8a82]">
            {donations.length === 0 ? 'No donations recorded yet.' : 'No donations match your search.'}
          </div>
        )}
      </div>

      {/* Cancel confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setConfirm(null)}>
          <div className="text-center bg-white shadow-2xl rounded-2xl p-7 w-72"
            onClick={e => e.stopPropagation()}>
            <div className="mb-3 text-3xl">⚠️</div>
            <h3 className="font-semibold text-[#1a2e2e] mb-2">Cancel donation?</h3>
            <p className="text-sm text-[#6b8a82] mb-5">This will mark the donation as cancelled.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2 rounded-xl border border-[#e2ece8] text-sm text-[#6b8a82] cursor-pointer bg-white">
                Go Back
              </button>
              <button onClick={() => handleCancel(confirm)}
                className="flex-1 py-2 text-sm font-semibold text-white border-none cursor-pointer rounded-xl"
                style={{ background: '#C96E4A' }}>
                Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
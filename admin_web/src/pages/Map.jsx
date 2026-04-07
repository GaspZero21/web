// pages/Map.jsx — dynamic donations map, matches platform design system
import { useState, useEffect, useRef } from 'react';
import { donationsApi } from '../api/api';

const STATUS_STYLES = {
  pending:   { bg: '#fef3cd', color: '#7c5c10',  dot: '#f0a500' },
  completed: { bg: '#d6ebe5', color: '#0F5C5C',  dot: '#0F5C5C' },
  delivered: { bg: '#d6ebe5', color: '#0F5C5C',  dot: '#0F5C5C' },
  cancelled: { bg: '#fde0dc', color: '#7c1a10',  dot: '#C96E4A' },
  active:    { bg: '#d6ebe5', color: '#0F5C5C',  dot: '#0F5C5C' },
};

function statusStyle(s = '') {
  return STATUS_STYLES[s.toLowerCase()] ?? { bg: '#F5F0E8', color: '#6b8a82', dot: '#8FB0A1' };
}

function getName(obj) {
  if (!obj) return '—';
  if (typeof obj === 'string') return obj;
  return obj.name ?? obj.fullName ?? obj.email ?? '—';
}

function formatDate(raw) {
  if (!raw) return '—';
  try { return new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

// ── Leaflet map component (loaded dynamically) ────────────────────
function LeafletMap({ donations }) {
  const mapRef    = useRef(null);
  const instanceRef = useRef(null);
  const markersRef  = useRef([]);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id  = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    function initMap(L) {
      if (instanceRef.current) return; // already initialised

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true })
        .setView([36.7, 3.1], 6); // Algeria default

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      instanceRef.current = map;
    }

    if (window.L) {
      initMap(window.L);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => initMap(window.L);
      document.head.appendChild(script);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  // Add/update markers whenever donations change
  useEffect(() => {
    const L = window.L;
    const map = instanceRef.current;
    if (!L || !map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const validPins = [];

    donations.forEach(d => {
      const lat = d.location?.lat ?? d.location?.latitude  ?? d.lat ?? d.latitude;
      const lng = d.location?.lng ?? d.location?.longitude ?? d.lng ?? d.longitude;
      if (!lat || !lng) return;

      const status  = d.status ?? 'pending';
      const sc      = statusStyle(status);
      const food    = d.foodType ?? d.food ?? d.title ?? 'Donation';
      const donor   = getName(d.requestedBy ?? d.donor ?? d.createdBy ?? d.user);

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:${sc.dot};border:2px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
            transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
          ">
            <span style="transform:rotate(45deg);font-size:13px;">🍱</span>
          </div>`,
        iconSize:   [32, 32],
        iconAnchor: [16, 32],
        popupAnchor:[0, -34],
      });

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`
          <div style="font-family:system-ui;min-width:180px;padding:4px 0">
            <p style="font-weight:600;font-size:13px;color:#1a2e2e;margin:0 0 4px">${food}</p>
            <p style="font-size:11px;color:#6b8a82;margin:0 0 2px">👤 ${donor}</p>
            <p style="font-size:11px;color:#6b8a82;margin:0 0 6px">📅 ${formatDate(d.createdAt ?? d.date)}</p>
            <span style="
              font-size:10px;font-weight:600;padding:2px 8px;border-radius:99px;
              background:${sc.bg};color:${sc.color};text-transform:capitalize;
            ">${status}</span>
          </div>
        `, { maxWidth: 220 })
        .addTo(map);

      markersRef.current.push(marker);
      validPins.push([lat, lng]);
    });

    // Fit map to markers if any
    if (validPins.length > 0) {
      try { map.fitBounds(validPins, { padding: [40, 40], maxZoom: 13 }); }
      catch (_) {}
    }
  }, [donations]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

// ── Main page ────────────────────────────────────────────────────
export default function Map() {
  const [donations,  setDonations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [selected,   setSelected]   = useState(null);
  const [filterStatus, setFilter]   = useState('All');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const list = await donationsApi.getAll(1, 500);
      setDonations(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const statuses = ['All', 'pending', 'completed', 'cancelled'];

  const filtered = donations.filter(d =>
    filterStatus === 'All' || (d.status ?? '').toLowerCase() === filterStatus
  );

  // Donations that have coordinates — shown on map
  const mappable = filtered.filter(d => {
    const lat = d.location?.lat ?? d.location?.latitude  ?? d.lat ?? d.latitude;
    const lng = d.location?.lng ?? d.location?.longitude ?? d.lng ?? d.longitude;
    return lat && lng;
  });

  const counts = { All: donations.length };
  statuses.slice(1).forEach(s => {
    counts[s] = donations.filter(d => (d.status ?? '').toLowerCase() === s).length;
  });

  return (
    <div className="flex flex-col h-full gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a2e2e]"
            style={{ fontFamily: 'DM Serif Display, serif' }}>Donations Map</h1>
          <p className="text-sm text-[#6b8a82] mt-0.5">
            {loading ? 'Loading…' : `${mappable.length} of ${donations.length} donations have location data`}
          </p>
        </div>
        <button onClick={load}
          className="px-3 py-2.5 rounded-xl text-sm border border-[#e2ece8] bg-white text-[#6b8a82] cursor-pointer">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm rounded-xl"
          style={{ background: '#fde8dc', color: '#8b3d1e', border: '1px solid #f5c6a8' }}>
          ⚠ {error}
        </div>
      )}

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {statuses.map(s => {
          const sc = s !== 'All' ? statusStyle(s) : null;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-none cursor-pointer rounded-xl capitalize"
              style={{
                background: filterStatus === s ? '#0F5C5C' : '#F5F0E8',
                color:      filterStatus === s ? 'white'   : '#6b8a82',
              }}>
              {sc && <span className="flex-shrink-0 w-2 h-2 rounded-full" style={{ background: filterStatus === s ? 'white' : sc.dot }} />}
              {s} ({counts[s] ?? 0})
            </button>
          );
        })}
      </div>

      {/* Map + sidebar */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3" style={{ minHeight: 480 }}>

        {/* Map panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2ece8] overflow-hidden relative"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)', minHeight: 400 }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAF9F7]">
              <div className="text-center">
                <div className="mb-2 text-3xl">🗺</div>
                <p className="text-sm text-[#6b8a82]">Loading map…</p>
              </div>
            </div>
          ) : mappable.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAF9F7]">
              <div className="px-6 text-center">
                <div className="mb-2 text-3xl">📍</div>
                <p className="text-sm font-medium text-[#1a2e2e]">No location data</p>
                <p className="text-xs text-[#6b8a82] mt-1">
                  Donations will appear here once they include GPS coordinates.
                </p>
              </div>
            </div>
          ) : (
            <LeafletMap donations={mappable} />
          )}
        </div>

        {/* Sidebar — donation list */}
        <div className="bg-white rounded-2xl border border-[#e2ece8] flex flex-col overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <div className="px-5 py-4 border-b border-[#e2ece8] bg-[#FAF9F7]">
            <p className="text-sm font-semibold text-[#1a2e2e]">All Donations</p>
            <p className="text-xs text-[#6b8a82] mt-0.5">{filtered.length} entries</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#e2ece8]">
            {loading ? (
              <div className="py-10 text-center text-sm text-[#6b8a82]">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#6b8a82]">No donations found.</div>
            ) : filtered.map(d => {
              const id       = d._id ?? d.id;
              const food     = d.foodType ?? d.food ?? d.title ?? 'Donation';
              const donor    = getName(d.requestedBy ?? d.donor ?? d.createdBy ?? d.user);
              const status   = d.status ?? 'pending';
              const sc       = statusStyle(status);
              const hasCoords = !!(d.location?.lat ?? d.lat ?? d.latitude);

              return (
                <div key={id}
                  onClick={() => setSelected(selected === id ? null : id)}
                  className="px-5 py-3 cursor-pointer hover:bg-[#FAF9F7] transition-colors"
                  style={{ background: selected === id ? '#f0f7f5' : undefined }}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.dot }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a2e2e] truncate">{food}</p>
                      <p className="text-xs text-[#6b8a82] truncate">👤 {donor}</p>
                      <p className="text-xs text-[#6b8a82]">📅 {formatDate(d.createdAt ?? d.date)}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 gap-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: sc.bg, color: sc.color }}>{status}</span>
                      {!hasCoords && (
                        <span className="text-[9px] text-[#b0c4bc]">no GPS</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selected === id && (
                    <div className="mt-3 pt-3 border-t border-[#e2ece8] grid grid-cols-2 gap-2">
                      {[
                        { label: 'Qty',          val: d.quantity != null ? `${d.quantity}${d.unit ? ' '+d.unit : ''}` : (d.qty ?? '—') },
                        { label: 'Delivered by', val: getName(d.deliveredBy ?? d.volunteer ?? d.foodSaver ?? d.assignedTo) },
                        { label: 'Category',     val: d.category ?? '—' },
                        { label: 'Location',     val: hasCoords ? `${(d.location?.lat ?? d.lat).toFixed(4)}, ${(d.location?.lng ?? d.lng).toFixed(4)}` : 'No GPS' },
                      ].map(row => (
                        <div key={row.label}>
                          <p className="text-[9px] text-[#6b8a82] uppercase tracking-wider">{row.label}</p>
                          <p className="text-xs text-[#1a2e2e] font-medium truncate">{row.val}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
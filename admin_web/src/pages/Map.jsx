// pages/Map.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LOCATIONS = [
  { id:1, name:'Ahmed Benali', role:'Donor',       position:[33.3561,6.8632] },
  { id:2, name:'Sara Toumi',   role:'Beneficiary', position:[33.350, 6.870]  },
  { id:3, name:'Ali Meziani',  role:'Donor',       position:[33.360, 6.860]  },
];

export default function Map() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1a2e2e]" style={{ fontFamily: 'DM Serif Display, serif' }}>Donations Map</h1>
        <p className="text-sm text-[#6b8a82] mt-0.5">Live donor & beneficiary locations</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[['🤲','Active Donors','3'],['🍽','Beneficiaries','2'],['📍','Covered Areas','1']].map(([icon,label,val])=>(
          <div key={label} className="bg-white rounded-2xl px-5 py-4 border border-[#e2ece8] flex items-center gap-3"
            style={{ boxShadow: '0 2px 8px rgba(15,92,92,0.05)' }}>
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-lg font-bold text-[#0F5C5C]" style={{ fontFamily: 'DM Serif Display, serif' }}>{val}</p>
              <p className="text-xs text-[#6b8a82]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-[#e2ece8]"
        style={{ height: 480, boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <MapContainer center={[33.3561,6.8632]} zoom={13} style={{ height:'100%', width:'100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {LOCATIONS.map(loc => (
            <Marker key={loc.id} position={loc.position}>
              <Popup>
                <strong>{loc.name}</strong><br />{loc.role}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
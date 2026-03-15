import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Example locations
const locations = [
  {
    id: 1,
    name: "Donor Ahmed",
    role: "Donor",
    position: [33.3561, 6.8632], // Example location (Algeria area)
  },
  {
    id: 2,
    name: "Sara",
    role: "Beneficiary",
    position: [33.35, 6.87],
  },
  {
    id: 3,
    name: "Ali",
    role: "Donor",
    position: [33.36, 6.86],
  },
];

export default function Map() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Donations Map</h1>

      <div className="h-[500px] rounded-lg overflow-hidden shadow">

        <MapContainer
          center={[33.3561, 6.8632]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((loc) => (
            <Marker key={loc.id} position={loc.position}>
              <Popup>
                <strong>{loc.name}</strong>
                <br />
                {loc.role}
              </Popup>
            </Marker>
          ))}

        </MapContainer>

      </div>
    </div>
  );
}
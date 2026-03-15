// pages/Donations.jsx
const DONATIONS = [
  { id:1, donor:'Ahmed Benali', food:'Bread & Pastries', qty:'5 kg',  status:'Delivered', date:'2024-06-10' },
  { id:2, donor:'Nadia Saad',   food:'Rice & Lentils',  qty:'10 kg', status:'Pending',   date:'2024-06-12' },
  { id:3, donor:'Karim Bouri',  food:'Vegetables',      qty:'3 kg',  status:'Delivered', date:'2024-06-13' },
  { id:4, donor:'Sara Ahmed',   food:'Canned Goods',    qty:'8 cans',status:'In Transit', date:'2024-06-14' },
];

const STATUS = {
  Delivered:   'bg-[#d6ebe5] text-[#0F5C5C]',
  Pending:     'bg-[#fef3cd] text-[#7c5c10]',
  'In Transit':'bg-[#e8f0ec] text-[#0F5C5C]',
};

export default function Donations() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1a2e2e]" style={{ fontFamily: 'DM Serif Display, serif' }}>Donations</h1>
        <p className="text-sm text-[#6b8a82] mt-0.5">Track all food donations</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F5F0E8]">
              {['Donor','Food','Qty','Date','Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DONATIONS.map((d, i) => (
              <tr key={d.id} className="border-t border-[#e2ece8] hover:bg-[#FAF9F7]">
                <td className="px-5 py-3 text-sm font-medium text-[#1a2e2e]">{d.donor}</td>
                <td className="px-5 py-3 text-sm text-[#6b8a82]">{d.food}</td>
                <td className="px-5 py-3 text-sm text-[#6b8a82]">{d.qty}</td>
                <td className="px-5 py-3 text-xs text-[#6b8a82]">{d.date}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS[d.status] || ''}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-xl p-6">

      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <p className="text-3xl font-bold text-primary mt-2">
        {value}
      </p>

    </div>
  );
}
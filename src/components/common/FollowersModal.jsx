export default function FollowersModal({ open, onClose }) {
  if (!open) return null;

  const followers = ["Sarah", "Max", "Charlie", "Rocky"];

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white w-80 rounded-xl p-4">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold">Followers</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-2">
          {followers.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

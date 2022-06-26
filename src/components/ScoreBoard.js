const Stat = ({ label, value }) => (
  <div className="rounded-md bg-[#bbada0] px-4 py-2 text-center text-[#f9f6f2]">
    <div className="text-xs uppercase tracking-wide">{label}</div>
    <div className="text-xl font-bold">{value}</div>
  </div>
)

export default function ScoreBoard({ score, best }) {
  return (
    <div className="flex gap-2">
      <Stat label="Score" value={score} />
      <Stat label="Best" value={best} />
    </div>
  )
}

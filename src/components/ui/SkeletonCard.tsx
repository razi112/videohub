export default function SkeletonCard() {
  return (
    <div className="bg-[#16161e] rounded-2xl overflow-hidden border border-[#2a2a3a] animate-pulse">
      <div className="aspect-video bg-[#2a2a3a]" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-[#2a2a3a] rounded w-4/5" />
        <div className="h-3 bg-[#2a2a3a] rounded w-3/5" />
      </div>
    </div>
  )
}

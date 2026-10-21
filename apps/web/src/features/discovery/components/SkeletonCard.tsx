export function SkeletonCard() {
  return (
    <div className="absolute inset-0 animate-pulse overflow-hidden rounded-[28px] border border-[#eee] bg-white">
      <div className="absolute inset-x-5 bottom-6 space-y-3">
        <div className="h-3 w-28 rounded-full bg-[#F2EDE8]" />
        <div className="h-7 w-3/4 rounded-lg bg-[#F2EDE8]" />
        <div className="h-4 w-full rounded-lg bg-[#F2EDE8]" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-6 w-16 rounded-full bg-[#F2EDE8]" />
          <div className="h-6 w-20 rounded-full bg-[#F2EDE8]" />
        </div>
      </div>
    </div>
  )
}

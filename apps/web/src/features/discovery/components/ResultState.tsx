interface ResultStateProps {
  titleId: string
  title: string
  subtitle: string
  action?: React.ReactNode
  children: React.ReactNode
}

/** Loading / error / not-enough-likes placeholder inside the result overlay. */
export function ResultState({ titleId, title, subtitle, action, children }: ResultStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 pb-12 pt-16 text-center">
      {children}
      <h2 id={titleId} className="mt-1 text-lg font-bold text-[#1a1a1a]">
        {title}
      </h2>
      <p className="max-w-xs text-sm text-[#888]">{subtitle}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

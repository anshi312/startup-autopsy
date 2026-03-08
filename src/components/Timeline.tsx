interface TimelineEvent {
  month: number
  headline: string
  description: string
}

interface Props {
  timeline: TimelineEvent[]
}

// Interpolate from yellow → orange → red as index progresses
function getEscalationColor(index: number, total: number): string {
  const t = total <= 1 ? 1 : index / (total - 1)
  if (t < 0.5) return 'border-yellow-500'
  if (t < 0.8) return 'border-orange-500'
  return 'border-red-500'
}

function getDotColor(index: number, total: number): string {
  const t = total <= 1 ? 1 : index / (total - 1)
  if (t < 0.5) return 'bg-yellow-500'
  if (t < 0.8) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function Timeline({ timeline }: Props) {
  const total = timeline.length

  return (
    <div className="relative pl-8">
      {/* vertical spine */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-zinc-200" />

      <div className="flex flex-col gap-8">
        {timeline.map((event, i) => {
          const isLast = i === total - 1
          const borderColor = getEscalationColor(i, total)
          const dotColor = getDotColor(i, total)

          return (
            <div key={i} className="relative">
              {/* dot on the spine */}
              <span
                className={`absolute -left-[1.35rem] top-1.5 w-3 h-3 rounded-full ring-2 ring-white ${dotColor} ${isLast ? 'w-4 h-4 -left-6 top-1' : ''}`}
              />

              <div
                className={`border-l-2 pl-4 ${borderColor} ${isLast ? 'pb-1' : ''}`}
              >
                <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${isLast ? 'text-red-600' : 'text-zinc-400'}`}>
                  Month {event.month}
                </p>
                <p className={`font-semibold text-zinc-900 leading-snug ${isLast ? 'text-xl' : 'text-base'}`}>
                  {event.headline}
                </p>
                <p className={`mt-1 leading-relaxed text-sm ${isLast ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  {event.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

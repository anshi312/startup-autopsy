interface Props {
  earlyWarnings: string[]
}

export default function WarningSignals({ earlyWarnings }: Props) {
  return (
    <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400 pl-5 pr-5 py-5 rounded-r-lg">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-700">
          Early Warning Signals
        </h3>
      </div>

      <ul className="flex flex-col gap-3">
        {earlyWarnings.map((warning, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 12 12" fill="currentColor">
              <path d="M5.134 1.993a1 1 0 011.732 0l4.5 7.794A1 1 0 0110.5 11.5h-9a1 1 0 01-.866-1.713l4.5-7.794z" />
            </svg>
            <span className="text-sm text-amber-900 leading-snug">{warning}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

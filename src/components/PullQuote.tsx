interface Props {
  quote: { text: string; attribution: string }
}

export default function PullQuote({ quote }: Props) {
  return (
    <div className="bg-white border border-zinc-200 border-l-4 border-l-red-500 pl-6 pr-5 py-5 rounded-r-lg shadow-sm">
      <span className="block text-4xl sm:text-6xl text-red-200 leading-none -mb-4 font-serif">
        &ldquo;
      </span>
      <p className="font-serif text-lg italic text-zinc-700 leading-relaxed">
        {quote.text}
      </p>
      <p className="mt-3 text-sm text-zinc-400 text-right">
        &mdash; {quote.attribution}
      </p>
    </div>
  )
}

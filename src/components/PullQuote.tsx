interface Props {
  quote: { text: string; attribution: string }
}

export default function PullQuote({ quote }: Props) {
  return (
    <div className="bg-gray-800 border-l-4 border-red-500 pl-6 pr-5 py-5 rounded-r-lg">
      <span className="block text-4xl sm:text-6xl text-white opacity-30 leading-none -mb-4 font-serif">
        &ldquo;
      </span>
      <p className="font-serif text-lg italic text-gray-200 leading-relaxed">
        {quote.text}
      </p>
      <p className="mt-3 text-sm text-gray-400 text-right">
        &mdash; {quote.attribution}
      </p>
    </div>
  )
}

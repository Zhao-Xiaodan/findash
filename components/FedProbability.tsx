'use client'

interface Meeting {
  date: string
  cut25: number
  hold: number
  hike25: number
}

function ProbCell({ value }: { value: number }) {
  const dominant = value > 50
  return (
    <td className={`text-center text-sm tabular-nums py-2.5 px-3 ${dominant ? 'bg-blue-500/15 text-blue-400 font-semibold' : 'text-gray-400'}`}>
      {value}%
    </td>
  )
}

export function FedProbability({ meetings }: { meetings: Meeting[] }) {
  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 font-normal">FOMC Meeting</th>
            <th className="text-center py-2 font-normal">-25bp</th>
            <th className="text-center py-2 font-normal">Hold</th>
            <th className="text-center py-2 font-normal">+25bp</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((m, i) => (
            <tr key={i} className="border-b border-gray-800/50 last:border-0">
              <td className="text-sm py-2.5 text-gray-300 pr-4">{m.date}</td>
              <ProbCell value={m.cut25} />
              <ProbCell value={m.hold} />
              <ProbCell value={m.hike25} />
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-600 mt-3">Source: CME FedWatch</p>
    </div>
  )
}

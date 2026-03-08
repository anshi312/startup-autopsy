const STEPS = [
  'Analyzing Inputs',
  'Extracting Profile',
  'Identifying Risks',
  'Simulating Failures',
  'Creating Visuals',
]

interface ProgressStepperProps {
  currentStep: number // 1-5
}

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <div className="flex items-start justify-center w-full max-w-2xl mx-auto">
      {STEPS.map((label, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div key={label} className="flex items-start flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-green-600'
                    : isCurrent
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-gray-700'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-gray-500'}`} />
                )}
              </div>
              <span
                className={`hidden sm:block text-xs text-center leading-tight px-1 ${
                  isCompleted ? 'text-green-400' : isCurrent ? 'text-red-400' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 self-start mt-4 ${
                  stepNum < currentStep ? 'bg-green-600' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

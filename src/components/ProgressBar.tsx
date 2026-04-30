interface ProgressBarProps {
  progress: number
  label?: string
  showPercentage?: boolean
}

export default function ProgressBar({ progress, label, showPercentage = true }: ProgressBarProps) {
  const safeProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercentage && <span className="text-sm font-bold text-blue-600">{safeProgress}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  )
}
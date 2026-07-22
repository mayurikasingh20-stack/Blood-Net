function StepProgress({ step, totalSteps, labels, percent }) {
  const displayPercent = percent !== undefined ? percent : (step / totalSteps) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-red-800">
          Step {step} of {totalSteps}: {labels[step - 1]}
        </span>
        <span className="text-sm text-stone-500">{Math.round(displayPercent)}% Complete</span>
      </div>
      <div className="w-full bg-stone-200 h-2 rounded-full">
        <div className="bg-red-800 h-2 rounded-full transition-all duration-300" style={{ width: `${displayPercent}%` }} />
      </div>
    </div>
  );
}

export default StepProgress;
import { getEligibility } from "../../utils/donationCycles";

function EligibilityClock({ lastDonation }) {
  const { eligible, nextEligibleDate, daysLeft } = getEligibility(lastDonation);

  return (
    <div className={`rounded-[22px] p-7 flex flex-col justify-between ${eligible ? "bg-green/10" : "bg-ink text-white"}`}>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${eligible ? "text-green" : "text-white/60"}`}>
          Eligibility Status
        </p>
        {eligible ? (
          <>
            <p className="font-serif text-2xl font-semibold text-green">You're eligible to donate!</p>
            <p className="text-sm text-ink-soft mt-2">Your donation cycle is complete.</p>
          </>
        ) : (
          <>
            <p className="font-serif text-2xl font-semibold">{daysLeft} days to go</p>
            <p className="text-sm text-white/70 mt-2">
              Next eligible date: {nextEligibleDate.toDateString()} (based on your last {lastDonation.component} donation)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default EligibilityClock;
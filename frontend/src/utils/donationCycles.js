export const DONATION_CYCLES = {
  "Whole Blood": 56,
  "Platelets": 7,
  "Plasma": 28,
  "Double Red Cells": 112,
  "Bone Marrow": 365,
};

// Given the donor's most recent donation, figures out if they're past the required gap
export function getEligibility(lastDonation) {
  if (!lastDonation) return { eligible: true, nextEligibleDate: null, daysLeft: 0 };

  const cycleDays = DONATION_CYCLES[lastDonation.component] || 56;
  const last = new Date(lastDonation.date);
  const nextEligibleDate = new Date(last);
  nextEligibleDate.setDate(nextEligibleDate.getDate() + cycleDays);

  const today = new Date();
  const daysLeft = Math.ceil((nextEligibleDate - today) / (1000 * 60 * 60 * 24));

  return { eligible: daysLeft <= 0, nextEligibleDate, daysLeft };
}
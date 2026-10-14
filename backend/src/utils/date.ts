/** Age in completed years on the reference date. */
export function calculateAge(dateOfBirth: Date, referenceDate: Date = new Date()): number {
  let age = referenceDate.getFullYear() - dateOfBirth.getFullYear();
  const hasHadBirthdayThisYear =
    referenceDate.getMonth() > dateOfBirth.getMonth() ||
    (referenceDate.getMonth() === dateOfBirth.getMonth() &&
      referenceDate.getDate() >= dateOfBirth.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function endOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function padWithZeroes(number, digits) {
  const numberString = number.toString();
  const paddingLength = Math.max(digits - numberString.length, 0);
  return "0".repeat(paddingLength) + numberString;
}

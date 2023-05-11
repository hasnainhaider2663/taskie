export default function padWithZeroes(number:number, digits:number) {
  const numberString = number.toString();
  let paddingLength = Math.max(digits - numberString.length, 0);

  return "0".repeat(paddingLength) + numberString;
}

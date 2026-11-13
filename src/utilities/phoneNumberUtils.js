export function format(str) {
  // 1. Remove all non-digit characters
  const cleaned = ('' + str).replace(/\D/g, '');
  
  // 2. Match the 10 digits into groups of 3, 3, and 4
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return str; // Return original if it doesn't match a 10-digit pattern
}

export const humanizeSegmentTerms = (text) => {
  if (!text) return text
  const replacements = {
    'churn_risk': 'Churn Risk',
    'lapsed_6m': 'Lapsed (6m+)',
    'lapsed': 'Lapsed',
    'high_value': 'High Value',
    'ipl_buyer': 'IPL Buyer',
    'first_timer': 'First Timer',
    'lapsed_high_value': 'Lapsed High Value',
    'academy_coach': 'Academy Coach',
    'club_player': 'Club Player',
    'bulk_buyer': 'Bulk Buyer',
    'gifter': 'Gifter',
    'recreational': 'Recreational'
  }
  let result = text
  for (const [key, value] of Object.entries(replacements)) {
    // Replace the quoted term or the raw boundary term with the unquoted value
    result = result.replace(new RegExp(`'${key}'|"${key}"|\\b${key}\\b`, 'gi'), value)
  }

  // General fallback: convert any remaining snake_case words to Title Case words
  result = result.replace(/\b([a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)+)\b/g, (match) => {
    return match
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  });

  // Final pass: strip any remaining stray quotes around words/phrases
  result = result.replace(/['"]([A-Za-z0-9][^'"]*?)['"]/g, '$1')
  return result
}

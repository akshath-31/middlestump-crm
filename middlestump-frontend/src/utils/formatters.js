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
  return result
}

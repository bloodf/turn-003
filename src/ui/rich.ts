// *emphasis* as the campaigns write it
export const rich = (t: string) => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!)).replace(/\*([^*\n]{1,300})\*/g, '<em>$1</em>')

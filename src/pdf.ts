// Reading a character sheet out of a PDF: the form's fields if it has any, else its words.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
export async function readPdf(data: Uint8Array): Promise<{ fields: Record<string, string>; text: string; pages: number }> {
  const lib = await import('pdfjs-dist'); lib.GlobalWorkerOptions.workerSrc = workerUrl; const task = lib.getDocument({ data }); const doc = await task.promise; const fields: Record<string, string> = {}; let text = ''
  for (let p = 1; p <= Math.min(doc.numPages, 12); p++) {
    const page = await doc.getPage(p); for (const a of await page.getAnnotations() as any[]) { if (!a.fieldName) continue; const v = a.checkBox || a.radioButton ? (a.fieldValue && a.fieldValue !== 'Off' && (!a.exportValue || a.fieldValue === a.exportValue || a.checkBox) ? 'Yes' : '') : Array.isArray(a.fieldValue) ? a.fieldValue.join(', ') : a.fieldValue ?? ''; if (String(v).trim()) fields[a.fieldName] = String(v).replace(/\r\n?/g, '\n') }
    const c = await page.getTextContent(); const rows: { y: number; x: number; s: string }[] = []; for (const it of c.items as any[]) if (it.str?.trim()) rows.push({ y: Math.round(it.transform[5] / 3) * 3, x: it.transform[4], s: it.str }); rows.sort((a, b) => b.y - a.y || a.x - b.x); let y = NaN; for (const r of rows) { text += r.y === y ? ' ' + r.s : (text ? '\n' : '') + r.s; y = r.y }
  }
  await task.destroy(); return { fields, text, pages: doc.numPages }
}

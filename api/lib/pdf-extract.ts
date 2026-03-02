export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { extractText } = await import("unpdf");
  const data = new Uint8Array(buffer);
  const { text } = await extractText(data, { mergePages: true });
  return text;
}

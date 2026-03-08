export function pdfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the "data:application/pdf;base64," prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function imageToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // result is "data:<mimeType>;base64,<data>"
      const [prefix, base64] = result.split(',')
      const mimeType = prefix.split(':')[1].split(';')[0]
      resolve({ base64, mimeType })
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

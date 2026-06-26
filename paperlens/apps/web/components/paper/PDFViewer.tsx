'use client'

interface Props {
  pdfPath: string
}

export function PDFViewer({ pdfPath }: Props) {
  // 简单的 PDF 预览器实现
  // 实际项目中可以使用 react-pdf 或 PDF.js
  
  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">PDF 预览</span>
        <a 
          href={pdfPath} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          在新窗口打开
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-32 mx-auto bg-white rounded shadow-lg flex items-center justify-center mb-4">
            <span className="text-4xl text-indigo-600">PDF</span>
          </div>
          <p className="text-gray-500 text-sm">{pdfPath}</p>
          <p className="text-gray-400 text-xs mt-1">点击上方链接查看完整 PDF</p>
        </div>
      </div>
    </div>
  )
}
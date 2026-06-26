export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              PaperLens — 基于 Papers We Love 仓库构建
            </p>
            <p className="text-xs mt-1 text-gray-500">
              AI 驱动的论文探索平台
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a 
              href="https://github.com/papers-we-love/papers-we-love" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Papers We Love
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

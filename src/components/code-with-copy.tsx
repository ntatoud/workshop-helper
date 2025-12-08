import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CodeWithCopy({ code }: { code: string }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // Reset after 2s
    } catch (err) {
      console.error('Failed to copy!', err)
    }
  }

  return (
    <div className="relative group/code">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded-md bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all opacity-0 group-hover/code:opacity-100 focus:opacity-100"
        aria-label="Copy code"
        title="Copy to clipboard"
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      <pre className="p-4 pt-10 sm:pt-4 bg-slate-950 text-slate-50 text-sm overflow-x-auto font-mono border-b border-slate-100 rounded-t-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

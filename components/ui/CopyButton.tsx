'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
}

export function CopyButton({ text, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${copied ? 'text-green-600' : 'text-gray-500 hover:text-blue-600'} ${className}`}
      title={copied ? 'Copied!' : `Copy ${label ?? 'link'}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type PreviewMode = 'desktop' | 'mobile'

const MOBILE_WIDTH_PX = 390

export function PreviewFrame({
  mode,
  children,
}: {
  mode: PreviewMode
  children: React.ReactNode
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    function syncDocument() {
      const doc = iframe?.contentDocument
      if (!doc) return

      doc.head.querySelectorAll('link[rel="stylesheet"], style').forEach(node => node.remove())
      document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
        doc.head.appendChild(node.cloneNode(true))
      })

      doc.documentElement.className = document.documentElement.className
      Array.from(document.documentElement.attributes).forEach(attr => {
        if (attr.name !== 'class') doc.documentElement.setAttribute(attr.name, attr.value)
      })

      doc.body.style.margin = '0'
      setMountNode(doc.body)
    }

    if (iframe.contentDocument?.readyState === 'complete') syncDocument()
    iframe.addEventListener('load', syncDocument)
    return () => iframe.removeEventListener('load', syncDocument)
  }, [])

  return (
    <div
      className="h-full mx-auto transition-[width] duration-200"
      style={{ width: mode === 'mobile' ? `${MOBILE_WIDTH_PX}px` : '100%' }}
    >
      <iframe ref={iframeRef} title="სთორის გადახედვა" className="w-full h-full border-0 block" />
      {mountNode && createPortal(children, mountNode)}
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { Button } from '@/components/ui/button'
import { CodeWithCopy } from '@/components/code-with-copy'

// Components you want to use inside MDX
const mdxComponents = {
  Button,
  Code: CodeWithCopy,
}

export function MarkdownRenderer({ content }: { content: string }) {
  const [Content, setContent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    ;(async () => {
      const result = await evaluate(content, {
        ...runtime,
        // This wires your components into MDX
        useMDXComponents: () => mdxComponents,
      })

      // result.default is the MDX React component
      setContent(() => result.default as React.ComponentType)
    })()
  }, [])

  if (!Content) return <p>Loading MDX…</p>

  return <Content />
}

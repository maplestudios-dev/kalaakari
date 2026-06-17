import { useRef, useState } from 'react'

/** Move an item within a list, returning a new array. */
export function reorder(list, from, to) {
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/**
 * Native HTML5 drag-and-drop reordering for table rows (no dependencies).
 * `onCommit(fromIndex, toIndex)` fires on drop. Spread `dragProps(index)` on
 * each row; `overIndex` is the row currently hovered for visual feedback.
 */
export function useRowDrag(onCommit) {
  const from = useRef(null)
  const [overIndex, setOverIndex] = useState(null)

  const dragProps = (index) => ({
    draggable: true,
    onDragStart: (e) => { from.current = index; e.dataTransfer.effectAllowed = 'move' },
    onDragOver: (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (overIndex !== index) setOverIndex(index)
    },
    onDragLeave: () => setOverIndex((v) => (v === index ? null : v)),
    onDrop: (e) => {
      e.preventDefault()
      const f = from.current
      if (f != null && f !== index) onCommit(f, index)
      from.current = null
      setOverIndex(null)
    },
    onDragEnd: () => { from.current = null; setOverIndex(null) }
  })

  return { dragProps, overIndex }
}

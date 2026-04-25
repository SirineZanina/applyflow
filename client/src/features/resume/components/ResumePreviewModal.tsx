 import { useEffect } from 'react'
 import { createPortal } from 'react-dom'
 import { Button } from '@/components/ui/button'
 import type { ResumeDocument } from '@/types/resume'
 
 interface ResumePreviewModalProps {
   open: boolean
   onClose: () => void
   resume: ResumeDocument
   url: string | null
   isLoading: boolean
   error: string | null
 }
 
 export function ResumePreviewModal({
   open,
   onClose,
   resume,
   url,
   isLoading,
   error,
 }: ResumePreviewModalProps) {
   useEffect(() => {
     if (!open) return
 
     const onKeyDown = (event: KeyboardEvent) => {
       if (event.key === 'Escape') onClose()
     }
 
     document.addEventListener('keydown', onKeyDown)
     document.body.style.overflow = 'hidden'
 
     return () => {
       document.removeEventListener('keydown', onKeyDown)
       document.body.style.overflow = ''
     }
   }, [open, onClose])
 
   if (!open) return null
 
   return createPortal(
     <div
       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
       onClick={onClose}
     >
       <div
         className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg 
bg-background shadow-xl"
         onClick={(e) => e.stopPropagation()}
       >
         <div className="flex items-center justify-between border-b px-4 py-3">
           <h2 className="text-sm font-semibold">
             {resume.label ?? 'Untitled resume'}
           </h2>
           <Button size="sm" variant="outline" onClick={onClose}>
             Close
           </Button>
         </div>
 
         <div className="flex-1 p-4">
           {isLoading && <p className="text-sm text-muted-foreground">Loading 
preview...</p>}
           {!isLoading && error && <p className="text-sm text-destructive">{error}</p>}
 
           {!isLoading && !error && url && resume.mimeType === 'application/pdf' && (
             <iframe
               title="Resume preview"
               src={url}
               className="h-full w-full rounded border"
             />
           )}
 
           {!isLoading && !error && url && resume.mimeType !== 'application/pdf' && (
             <div className="space-y-3">
               <p className="text-sm text-muted-foreground">
                 Inline preview best for PDF. This file can be opened in new tab.
               </p>
               <a
                 href={url}
                 target="_blank"
                 rel="noreferrer"
                 className="text-sm font-medium text-primary underline"
               >
                 Open file
               </a>
             </div>
           )}
         </div>
       </div>
     </div>,
     document.body,
   )
 }
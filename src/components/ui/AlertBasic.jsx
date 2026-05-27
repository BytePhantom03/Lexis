import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2Icon } from "lucide-react"

export function AlertBasic({title,desc}) {
  return (
    <Alert className="max-w-md bg-[#34D399]    p-2 -top-3/12 mt-2  sm:bottom-2 sm:top-auto sm:right-2  sm:ml-20 ml-12 sm:animate-[fadeIn_0.3s_ease-out_forwards] animate-[fadeOut_0.3s_ease-out_forwards] opacity-0">
      <CheckCircle2Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className='p-0'>
     {desc}
      </AlertDescription>
    </Alert>
  )
}

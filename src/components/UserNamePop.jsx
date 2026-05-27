

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function UserNamePop({trigger,name}) {
  return (
    <div className="flex flex-wrap gap-2">
        <Tooltip >
          <TooltipTrigger asChild>
           {trigger}
          </TooltipTrigger>
          <TooltipContent side={"bottom"}>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
    </div>
  )
}


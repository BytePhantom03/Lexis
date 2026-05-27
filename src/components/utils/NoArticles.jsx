import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NoArticles() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
      
        </EmptyMedia>
        <EmptyTitle>No article published yet.</EmptyTitle>
        <EmptyDescription>
         You can publish your own article by clciking on the button available on the bottom left.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
       
      </EmptyContent>
    </Empty>
  )
}

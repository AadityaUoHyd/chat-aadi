import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, MessageCircleDashed, Sparkle } from "lucide-react"

export default function Header() {
  return (
    <header className="p-2 flex items-center justify-between">
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center text-lg outline-0 cursor-pointer font-mediu, rounded-md hover:bg-gray-100 p-2">
            ChatAadi
            <ChevronDown height={25} width={25} className="text-gray-400" strokeWidth={1.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <Button variant="outline" className="text-[#5d5bd0] border-0 bg-[#f1f1fb] hover:text-[#5d5bd0] hover:bg-[#f1f1fb] cursor-pointer">
          <Sparkle/>
          Upgrade to Go
        </Button>
      </div>
      <div >
        <button className="rounded-[100%] hover:bg-gray-100 p-2 cursor-pointer">
        <MessageCircleDashed width={20} height={20} className="text-gray-700" />
        </button>
      </div>
    </header>
  )
}
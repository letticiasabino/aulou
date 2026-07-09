import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input className="pl-10" type="search" {...props} />
    </div>
  );
}

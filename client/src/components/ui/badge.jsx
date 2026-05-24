import { cn } from "@/lib/utils";

const sizeClasses = {
  sm:  "text-xs px-2 py-0.5",
  md:  "text-sm px-2.5 py-1",
  lg:  "text-sm px-3 py-1.5",
};

const variantClasses = {
  default:   "bg-neutral-900 text-white border-transparent",
  outline:   "bg-transparent border border-current text-neutral-700",
  secondary: "bg-neutral-100 text-neutral-900 border-transparent",
};

export function Badge({ className, size = "md", variant = "default", children, ...props }) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center font-medium whitespace-nowrap",
        sizeClasses[size] ?? sizeClasses.md,
        variantClasses[variant] ?? variantClasses.default,
        className,
      )}
    >
      {children}
    </span>
  );
}

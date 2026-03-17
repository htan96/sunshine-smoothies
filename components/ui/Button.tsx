import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "white";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-orange)] text-white shadow-sm hover:bg-[var(--color-orange-dark)]",
  outline: "border-2 border-[var(--color-orange)] text-[var(--color-orange)] hover:bg-[var(--color-orange)] hover:text-white",
  ghost: "border border-neutral-200 text-[var(--color-charcoal)] hover:border-neutral-300",
  white: "bg-white text-[var(--color-orange-dark)] font-semibold hover:bg-[var(--color-orange-light)]",
};

export function Button({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const base =
    "rounded-3xl px-7 py-3.5 transition-all duration-200 active:scale-95 cursor-pointer font-medium inline-block text-center";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, variantStyles[variant], className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={cn(base, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

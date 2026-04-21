import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-500",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400",
  ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild) {
      const child = props.children as React.ReactElement;
      return {
        ...child,
        props: { ...child.props, className: cn(classes, child.props?.className) },
      } as unknown as React.ReactElement;
    }

    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";

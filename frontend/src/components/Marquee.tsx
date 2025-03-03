import React, { useRef, useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "card";
}

const Marquee: React.FC<MarqueeProps> = ({
  children,
  speed = 50,
  direction = "left",
  pauseOnHover = true,
  className = "",
  containerClassName = "",
  contentClassName = "",
  variant = "default",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Create a unique ID for this marquee instance's animation
  const [uniqueId] = useState(() => Math.floor(Math.random() * 10000));
  const animationName = `marquee-${direction}-${uniqueId}`;

  useEffect(() => {
    // Dynamically create a stylesheet for this animation
    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);

    // Define the keyframes based on direction
    if (direction === "left") {
      styleEl.sheet?.insertRule(
        `@keyframes ${animationName} {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }`,
        0,
      );
    } else {
      styleEl.sheet?.insertRule(
        `@keyframes ${animationName} {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }`,
        0,
      );
    }

    return () => {
      // Clean up the style element when component unmounts
      document.head.removeChild(styleEl);
    };
  }, [direction, animationName]);

  const defaultStyle: React.CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    position: "relative",
    width: "100%",
  };

  const contentStyle: React.CSSProperties = {
    display: "inline-flex",
    whiteSpace: "nowrap",
    animation: `${animationName} ${30 / speed}s linear infinite`,
    animationPlayState: isPaused ? "paused" : "running",
    // No need for initial transform as we're using a different animation approach
  };

  const WrapperComponent =
    variant === "card"
      ? ({ children }: { children: ReactNode }) => (
          <Card className={cn("p-4", className)}>{children}</Card>
        )
      : ({ children }: { children: ReactNode }) => (
          <div className={className}>{children}</div>
        );

  return (
    <WrapperComponent>
      <div
        ref={containerRef}
        className={cn("marquee-container", containerClassName)}
        style={defaultStyle}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        <div
          className={cn("marquee-content", contentClassName)}
          style={contentStyle}
        >
          {/* Duplicate the content to create the continuous loop effect */}
          <div className="mr-4">{children}</div>
          <div>{children}</div>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default Marquee;

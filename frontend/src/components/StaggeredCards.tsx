"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface CardInfo {
  id: number;
  title: string;
  description: string;
  image?: string;
}

interface StaggeredCardStackProps {
  cards: CardInfo[];
}

const StaggeredCardStack: React.FC<StaggeredCardStackProps> = ({ cards }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="relative h-[500px] w-full">
      {cards.map((card, index) => {
        // Calculate initial position based on index
        const offsetClasses = [
          index === 0 ? "top-0 right-10" : "",
          index === 1 ? "-top-10 -left-24" : "",
          index === 2 ? "top-10 left-32" : "",
          index === 3 ? "top-16 left-32" : "",
        ].join(" ");

        // Random rotation for visual interest
        const rotation = ["rotate-2", "-rotate-3", "rotate-8", "rotate-1"][
          index % 4
        ];

        // Determine if this card is being hovered
        const isHovered = hoveredCard === card.id;

        // Dynamic z-index: highest when hovered, otherwise based on position in stack
        const zIndex = isHovered ? 50 : 30 - index * 10;

        return (
          <Card
            key={card.id}
            className={`absolute rounded-lg shadow-xl bg-card p-6 ${offsetClasses} ${rotation} cursor-pointer transform transition-all duration-400 ease-out`}
            style={{
              zIndex,
              transform: isHovered
                ? `translateY(-2rem) scale(1.05) rotate(0deg)`
                : `rotate(${parseInt(rotation.split("-")[1]) || 0}deg)`,
              boxShadow: isHovered
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {card.image && (
              <div className="h-72 bg-muted rounded-md overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover rounded-md transition-transform duration-500"
                  style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                  width={700}
                  height={500}
                />
              </div>
            )}
            <div className="transition-opacity max-w-[500px] duration-300 mt-4">
              <h3 className="text-xl font-bold">{card.title}</h3>
              <p className="text-muted-foreground mt-2">{card.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Usage example
const StaggeredCards: React.FC = () => {
  const cardData: CardInfo[] = [
    {
      id: 1,
      title: "Fast and Reliable",
      description:
        "With our state-of-the-art tracking and management systems provide you with updates.",
      image: "/bg_landing3.png",
    },
    {
      id: 3,
      title: "Unmatched Experience",
      description:
        "With over 1.5 billion packages delivered, we have the expertise to handle your parcels with care and efficiency.",
      image: "/bg_landing2.png",
    },

    {
      id: 2,
      title: "National Coverage",
      description:
        "An all-in-one starter kit for high-performance e-commerce delivery system.",
      image: "/bg_landing.png",
    },

    // Add more cards as needed
  ];

  return (
    <div className="container mx-auto py-16 hidden md:block">
      <StaggeredCardStack cards={cardData} />
    </div>
  );
};

export default StaggeredCards;

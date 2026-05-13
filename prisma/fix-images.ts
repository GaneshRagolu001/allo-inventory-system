import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Reliable Unsplash static image URLs (no API key needed)
const imageMap: Record<string, string> = {
  "iPhone 15":
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=400&fit=crop&auto=format",
  "MacBook Air":
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&auto=format",
};

// Fallback: assign images by index if name doesn't match
const fallbackImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&h=400&fit=crop&auto=format",
];

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products`);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imageUrl =
      imageMap[product.name] ||
      fallbackImages[i % fallbackImages.length];

    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl },
    });

    console.log(`Updated "${product.name}" → ${imageUrl}`);
  }

  console.log("\n All product images updated successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

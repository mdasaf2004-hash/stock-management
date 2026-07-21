import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {

  const w1 = await prisma.warehouse.create({
    data: { name: "Central Warehouse", location: "Delhi" },
  });

  const w2 = await prisma.warehouse.create({
    data: { name: "Mumbai Distribution Center", location: "Mumbai" },
  });

  // Create materials
  const m1 = await prisma.material.create({
    data: {
      sku: "STL-001",
      name: "Steel rod 12mm",
      category: "Steel",
      unit: "ton",
      unitPrice: 62000,
      reorderLevel: 10,
      reorderQuantity: 50,
    },
  });

  const m2 = await prisma.material.create({
    data: {
      sku: "COP-001",
      name: "Copper Wire 2.5mm",
      category: "Electrical",
      unit: "kg",
      unitPrice: 850,
      reorderLevel: 100,
      reorderQuantity: 200,
    },
  });

  const m3 = await prisma.material.create({
    data: {
      sku: "PVC-001",
      name: "PVC Pipe 4 inch",
      category: "Plumbing",
      unit: "meter",
      unitPrice: 120,
      reorderLevel: 200,
      reorderQuantity: 500,
    },
  });

  // Create stock
  await prisma.stock.create({
    data: { warehouseId: w1.id, materialId: m1.id, quantity: 120 },
  });

  await prisma.stock.create({
    data: { warehouseId: w1.id, materialId: m2.id, quantity: 450 },
  });

  await prisma.stock.create({
    data: { warehouseId: w2.id, materialId: m3.id, quantity: 800 },
  });

  // Create batches
  await prisma.batch.create({
    data: {
      batchNumber: "BATCH-001",
      materialId: m1.id,
      warehouseId: w1.id,
      quantity: 60,
      manufacturingDate: new Date("2026-01-15"),
      expiryDate: new Date("2027-01-15"),
    },
  });

  await prisma.batch.create({
    data: {
      batchNumber: "BATCH-002",
      materialId: m2.id,
      warehouseId: w1.id,
      quantity: 200,
      manufacturingDate: new Date("2026-06-01"),
    },
  });

  // Create a wholesaler/supplier
  const ws1 = await prisma.wholesaler.create({
    data: {
      name: "ABC Steel Traders",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@abctraders.com",
      phone: "+91 98765 43210",
      creditLimit: 500000,
    },
  });

  // Create a user
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash("password123", 12);

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@stockpro.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Report type is required. Use ?type=valuation|dead-stock|low-stock|expiring" },
        { status: 400 }
      );
    }

    switch (type) {
      case "valuation": {
        const stockItems = await prisma.stock.findMany({
          include: {
            material: true,
            warehouse: true,
          },
        });

        const enriched = stockItems.map((item) => ({
          id: item.id,
          warehouseId: item.warehouseId,
          warehouseName: item.warehouse.name,
          materialId: item.materialId,
          materialName: item.material.name,
          category: item.material.category,
          quantity: Number(item.quantity),
          unitPrice: Number(item.material.unitPrice),
          totalValue: Number(item.quantity) * Number(item.material.unitPrice),
        }));

        const groupedByWarehouse = enriched.reduce(
          (acc: Record<string, { warehouseName: string; items: typeof enriched; totalValue: number }>, item) => {
            if (!acc[item.warehouseId]) {
              acc[item.warehouseId] = {
                warehouseName: item.warehouseName,
                items: [],
                totalValue: 0,
              };
            }
            acc[item.warehouseId].items.push(item);
            acc[item.warehouseId].totalValue += item.totalValue;
            return acc;
          },
          {} as Record<string, { warehouseName: string; items: typeof enriched; totalValue: number }>
        );

        const groupedByCategory = enriched.reduce(
          (acc: Record<string, { items: typeof enriched; totalValue: number }>, item) => {
            if (!acc[item.category]) {
              acc[item.category] = {
                items: [],
                totalValue: 0,
              };
            }
            acc[item.category].items.push(item);
            acc[item.category].totalValue += item.totalValue;
            return acc;
          },
          {} as Record<string, { items: typeof enriched; totalValue: number }>
        );

        return NextResponse.json({
          type: "valuation",
          totalValue: enriched.reduce((sum, item) => sum + item.totalValue, 0),
          byWarehouse: groupedByWarehouse,
          byCategory: groupedByCategory,
          items: enriched,
        });
      }

      case "dead-stock": {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const materialsWithMovements = await prisma.material.findMany({
          where: {
            stockMovements: {
              some: {
                createdAt: {
                  gte: ninetyDaysAgo,
                },
              },
            },
          },
          select: { id: true },
        });

        const activeMaterialIds = materialsWithMovements.map((m) => m.id);

        const deadStockMaterials = await prisma.material.findMany({
          where: {
            id: { notIn: activeMaterialIds },
          },
          include: {
            stock: true,
          },
        });

        return NextResponse.json({
          type: "dead-stock",
          materials: deadStockMaterials,
          count: deadStockMaterials.length,
        });
      }

      case "low-stock": {
        const stockItems = await prisma.stock.findMany({
          include: {
            material: true,
            warehouse: true,
          },
        });

        const lowStockItems = stockItems
          .filter((item) => Number(item.quantity) <= item.material.reorderLevel)
          .map((item) => ({
            id: item.id,
            warehouseName: item.warehouse.name,
            materialName: item.material.name,
            sku: item.material.sku,
            quantity: Number(item.quantity),
            reorderLevel: item.material.reorderLevel,
            reorderQuantity: item.material.reorderQuantity,
          }));

        return NextResponse.json({
          type: "low-stock",
          items: lowStockItems,
          count: lowStockItems.length,
        });
      }

      case "expiring": {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const materials = await prisma.material.findMany({
          where: {
            expiryDate: {
              not: null,
              lte: thirtyDaysFromNow,
            },
          },
          include: {
            stock: {
              include: { warehouse: true },
            },
          },
        });

        const batches = await prisma.batch.findMany({
          where: {
            expiryDate: {
              not: null,
              lte: thirtyDaysFromNow,
            },
          },
          include: {
            material: true,
            warehouse: true,
          },
        });

        return NextResponse.json({
          type: "expiring",
          materials,
          batches,
          materialCount: materials.length,
          batchCount: batches.length,
        });
      }

      default:
        return NextResponse.json(
          { error: `Invalid report type: "${type}". Use valuation, dead-stock, low-stock, or expiring.` },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

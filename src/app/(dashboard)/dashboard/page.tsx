import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Warehouse,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  ClipboardList,
  Clock,
} from "lucide-react";
import { StockChart } from "@/components/charts/stock-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stockItems: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let purchaseOrders: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wholesalers: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let warehouses: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentMovements: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let batches: any[] = [];

  try {
    [stockItems, orders, purchaseOrders, wholesalers, warehouses, recentMovements, batches] =
      await Promise.all([
        prisma.stock.findMany({ include: { material: true, warehouse: true } }),
        prisma.order.findMany({
          include: { wholesaler: true, warehouse: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.purchaseOrder.findMany({
          include: { wholesaler: true, warehouse: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.wholesaler.findMany(),
        prisma.warehouse.findMany(),
        prisma.stockMovement.findMany({
          include: { material: true, warehouse: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.batch.findMany({
          include: { material: true },
        }),
      ]);
  } catch (error) {
    console.error("Dashboard query failed:", error);
    throw new Error(
      `Failed to load dashboard data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  const totalStockValue = stockItems.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.material.unitPrice),
    0
  );

  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const confirmedOrdersCount = orders.filter(
    (o) => o.status === "CONFIRMED"
  ).length;

  const pendingPOCount = purchaseOrders.filter((po) => po.status === "PENDING").length;

  const lowStockItems = stockItems.filter(
    (item) => Number(item.quantity) <= item.material.reorderLevel
  );

  const totalCapacity = warehouses.reduce(
    (acc, w) => acc + (w.capacity ?? 0),
    0
  );

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const expiringBatches = batches.filter((b) => {
    if (!b.expiryDate) return false;
    const daysUntil = Math.ceil(
      (new Date(b.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 30 && daysUntil >= 0;
  });

  const chartData = stockItems.reduce(
    (acc, item) => {
      const cat = item.material.category;
      const existing = acc.find((d: { category: string; value: number }) => d.category === cat);
      if (existing) {
        existing.value += Number(item.quantity) * Number(item.material.unitPrice);
      } else {
        acc.push({
          category: cat,
          value: Number(item.quantity) * Number(item.material.unitPrice),
        });
      }
      return acc;
    },
    [] as { category: string; value: number }[]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Real-time overview of your inventory operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Value
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              ₹
              {totalStockValue.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">
                {stockItems.length} items tracked
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales Orders
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {orders.length}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {pendingOrdersCount} pending · {confirmedOrdersCount} confirmed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Purchase Orders
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {purchaseOrders.length}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {pendingPOCount} pending
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alerts
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-amber-500">
              {lowStockItems.length + expiringBatches.length}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {lowStockItems.length + expiringBatches.length > 0 ? (
                <span className="text-xs text-amber-500">
                  {lowStockItems.length} low stock · {expiringBatches.length} expiring
                </span>
              ) : (
                <span className="text-xs text-emerald-500">All good</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second row KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Warehouses
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Warehouse className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {warehouses.length}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {totalCapacity.toLocaleString()} m³ capacity
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suppliers
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {wholesalers.length}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                Active partners
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-rose-500">
              {expiringBatches.length}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {expiringBatches.length > 0 ? (
                <span className="text-xs text-rose-500">
                  Within 30 days
                </span>
              ) : (
                <span className="text-xs text-emerald-500">None expiring</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Activity */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Stock by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <StockChart data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                No stock data to chart yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMovements.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No recent stock movements
              </div>
            ) : (
              recentMovements.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      m.type === "INBOUND"
                        ? "bg-emerald-500/10"
                        : m.type === "OUTBOUND"
                        ? "bg-red-500/10"
                        : "bg-blue-500/10"
                    }`}
                  >
                    {m.type === "INBOUND" ? (
                      <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                    ) : m.type === "OUTBOUND" ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <Package className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {m.material.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.warehouse.name} ·{" "}
                      {new Date(m.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      m.type === "INBOUND"
                        ? "default"
                        : m.type === "OUTBOUND"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs shrink-0"
                  >
                    {m.type}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{item.material.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.warehouse.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-500">
                      {Number(item.quantity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      min: {item.material.reorderLevel} · reorder: {item.material.reorderQuantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

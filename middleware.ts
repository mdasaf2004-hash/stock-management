import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLES_HIERARCHY: Record<string, number> = {
  ADMIN: 4,
  WAREHOUSE_STAFF: 3,
  USER: 2,
  VIEWER: 1,
};

const READONLY_METHODS = ["GET", "HEAD", "OPTIONS"];

const ROLE_RESTRICTIONS: Record<string, Record<string, string[]>> = {
  "/api/warehouses": {
    POST: ["ADMIN", "WAREHOUSE_STAFF"],
    PUT: ["ADMIN", "WAREHOUSE_STAFF"],
    DELETE: ["ADMIN"],
  },
  "/api/materials": {
    POST: ["ADMIN", "WAREHOUSE_STAFF"],
    PUT: ["ADMIN", "WAREHOUSE_STAFF"],
    DELETE: ["ADMIN"],
  },
  "/api/stock": {
    POST: ["ADMIN", "WAREHOUSE_STAFF"],
  },
  "/api/orders": {
    POST: ["ADMIN", "WAREHOUSE_STAFF"],
  },
  "/api/purchase-orders": {
    POST: ["ADMIN", "WAREHOUSE_STAFF"],
  },
  "/api/wholesalers": {
    POST: ["ADMIN"],
    PUT: ["ADMIN"],
    DELETE: ["ADMIN"],
  },
  "/api/batches": {
    POST: ["ADMIN", "WAREHOUSE_STAFF"],
  },
  "/api/serial-numbers": {
    POST: ["ADMIN", "WAREHOUSE_STAFF"],
  },
};

function matchRoleRestriction(
  pathname: string,
  method: string
): string[] | null {
  if (READONLY_METHODS.includes(method)) return null;

  for (const [path, restrictions] of Object.entries(ROLE_RESTRICTIONS)) {
    if (pathname.startsWith(path) && restrictions[method]) {
      return restrictions[method];
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("next-auth.session-token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let userRole = "USER";
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    userRole = payload.role || "USER";
  } catch {
    // If token parsing fails, allow with default role
  }

  const allowedRoles = matchRoleRestriction(pathname, request.method);
  if (allowedRoles) {
    const userLevel = ROLES_HIERARCHY[userRole] || 0;
    const hasAccess = allowedRoles.some(
      (role) => (ROLES_HIERARCHY[role] || 0) <= userLevel
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-user-role", userRole);
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/stock/:path*",
    "/warehouses/:path*",
    "/materials/:path*",
    "/orders/:path*",
    "/purchase-orders/:path*",
    "/shipments/:path*",
    "/wholesalers/:path*",
    "/stock-movements/:path*",
    "/reports/:path*",
    "/activity-logs/:path*",
    "/api/warehouses/:path*",
    "/api/materials/:path*",
    "/api/stock/:path*",
    "/api/orders/:path*",
    "/api/purchase-orders/:path*",
    "/api/wholesalers/:path*",
    "/api/batches/:path*",
    "/api/serial-numbers/:path*",
    "/employees/:path*",
    "/work-hours/:path*",
    "/api/employees/:path*",
    "/api/worklogs/:path*",
  ],
};

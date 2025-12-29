import { NextResponse } from "next/server";

export async function proxy(request) {
  try {
    // console.log("from proxy",request)
    const session = request.cookies.get("session")?.value;
    if (!session) return NextResponse.redirect(new URL("/", request.url));
    const apiUrl = new URL("/api/auth/verify", request.url);
    const result = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ token: session }),
    });
    const userRole = await result.json();
    const { pathname } = request.nextUrl;
    if (userRole == null)
      return NextResponse.redirect(new URL("/", request.url));
    if (userRole === "admin" && !pathname.startsWith("/dashboard/admin"))
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    if (userRole === "client" && !pathname.startsWith("/dashboard/client"))
      return NextResponse.redirect(new URL("/dashboard/client", request.url));
    if (userRole === "employee" && !pathname.startsWith("/dashboard/employee"))
      return NextResponse.redirect(new URL("/dashboard/employee", request.url));
    else return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: "/dashboard/:path*",
};

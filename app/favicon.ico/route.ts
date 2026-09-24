export function GET(request: Request) {
  return Response.redirect(new URL("/apartmanos-icon.png", request.url), 307);
}

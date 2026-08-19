export function checkAdmin(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

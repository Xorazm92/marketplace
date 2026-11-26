import "server-only";

// Brauzer → Next → backend. rewrites ishlatilmaydi: ularning manzili build paytida
// routes-manifest.json ga qotib qoladi va bitta image boshqa muhitda eski backend'ga
// murojaat qilardi. Bu yerda API_URL har so'rovda o'qiladi.
// Prod'da nginx /api va /uploads ni to'g'ridan-to'g'ri backend'ga yuboradi (docs/DEPLOYMENT.md).
const PASS_REQUEST = ["authorization", "content-type", "accept", "accept-language", "user-agent"];
const DROP_RESPONSE = ["content-encoding", "content-length", "transfer-encoding", "connection"];

export async function forward(request: Request, prefix: "/api" | "/uploads", path: string[]): Promise<Response> {
  const base = process.env.API_URL || "http://localhost:4000";
  const url = new URL(request.url);
  const target = `${base}${prefix}/${path.map(encodeURIComponent).join("/")}${url.search}`;

  const headers = new Headers();
  for (const name of PASS_REQUEST) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Backend so'rov cheklovlarini (kirish urinishlari, OTP) X-Forwarded-For dagi IP bo'yicha
  // hisoblaydi. Bu sarlavhani brauzer ham yubora oladi va Next uni o'zgartirmaydi — unga
  // ishonilsa, har so'rovda boshqa "IP" yuborib barcha cheklovlarni aylanib o'tish mumkin edi.
  // Shuning uchun u faqat oldimizda ishonchli proksi (nginx) turganda uzatiladi va faqat
  // proksining o'zi qo'shgan oxirgi manzil olinadi. Aks holda backend barcha so'rovni shu
  // server manzilidan ko'radi: cheklovlar umumiy bo'ladi, lekin aylanib o'tilmaydi.
  if (process.env.TRUST_PROXY_HEADERS === "true") {
    const clientIp = (request.headers.get("x-forwarded-for") ?? "").split(",").map((hop) => hop.trim()).filter(Boolean).at(-1);
    if (clientIp) headers.set("x-forwarded-for", clientIp);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Oqimli so'rov tanasi (rasm yuklash) uchun Node fetch talabi.
      ...(hasBody ? { duplex: "half" } : {}),
      redirect: "manual",
      cache: "no-store",
    } as RequestInit);
  } catch {
    return Response.json({ message: "Server vaqtincha javob bermayapti" }, { status: 502 });
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const name of DROP_RESPONSE) responseHeaders.delete(name);
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

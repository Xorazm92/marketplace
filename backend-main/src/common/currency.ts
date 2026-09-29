import { PrismaService } from '../prisma/prisma.service';

// Do'kon faqat so'mda savdo qiladi. Valyutani mijozdan olish narxni boshqa
// valyutada talqin qilishga yo'l ochardi, shuning uchun u serverda tanlanadi.
export async function defaultCurrencyId(prisma: PrismaService): Promise<number> {
  const currency = await prisma.currency.upsert({
    where: { code: 'UZS' },
    create: { code: 'UZS', name: "O'zbek so'mi", symbol: "so'm" },
    update: {},
    select: { id: true },
  });
  return currency.id;
}

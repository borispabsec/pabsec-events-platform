import { PrismaClient, EventStatus, DocumentCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.upsert({
    where: { slug: "pabsec-general-assembly-2025" },
    update: {},
    create: {
      slug: "pabsec-general-assembly-2025",
      status: EventStatus.PUBLISHED,
      startDate: new Date("2025-10-15T09:00:00Z"),
      endDate: new Date("2025-10-17T18:00:00Z"),
      location: "Istanbul, Turkey",
      translations: {
        create: [
          {
            locale: "en",
            title: "PABSEC General Assembly 2025",
            description:
              "The annual General Assembly of the Parliamentary Assembly of the Black Sea Economic Cooperation.",
            agenda: "Day 1: Opening ceremony\nDay 2: Plenary sessions\nDay 3: Closing ceremony",
          },
          {
            locale: "ru",
            title: "Генеральная Ассамблея ПАЧЭС 2025",
            description:
              "Ежегодная Генеральная Ассамблея Парламентской Ассамблеи Черноморского Экономического Сотрудничества.",
            agenda:
              "День 1: Открытие\nДень 2: Пленарные заседания\nДень 3: Закрытие",
          },
          {
            locale: "tr",
            title: "PABSEC Genel Kurul 2025",
            description:
              "Karadeniz Ekonomik İşbirliği Parlamenter Asamblesi'nin yıllık Genel Kurul toplantısı.",
            agenda:
              "Gün 1: Açılış töreni\nGün 2: Genel oturumlar\nGün 3: Kapanış töreni",
          },
        ],
      },
    },
  });

  console.log("Seeded event:", event.slug);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

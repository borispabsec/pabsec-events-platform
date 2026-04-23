import { PrismaClient, EventStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 67th GA — existing seed
  const ga67 = await prisma.event.upsert({
    where: { slug: "pabsec-67th-general-assembly" },
    update: {},
    create: {
      slug: "pabsec-67th-general-assembly",
      status: EventStatus.PUBLISHED,
      startDate: new Date("2026-06-29T09:00:00Z"),
      endDate: new Date("2026-07-01T18:00:00Z"),
      location: "Tbilisi, Georgia",
      heroTextColor: "auto",
      translations: {
        create: [
          {
            locale: "en",
            title: "67th Ordinary Session of the PABSEC General Assembly",
            description:
              "The 67th Ordinary Session of the General Assembly of the Parliamentary Assembly of the Black Sea Economic Cooperation.",
          },
          {
            locale: "ru",
            title: "67-я Обычная сессия Генеральной Ассамблеи ПАЧЭС",
            description:
              "67-я Обычная сессия Генеральной Ассамблеи Парламентской Ассамблеи Черноморского Экономического Сотрудничества.",
          },
          {
            locale: "tr",
            title: "PABSEC Genel Kurulunun 67. Olağan Oturumu",
            description:
              "Karadeniz Ekonomik İşbirliği Parlamenter Asamblesi Genel Kurulunun 67. Olağan Oturumu.",
          },
        ],
      },
    },
  });

  // 68th GA — stored in DB so it is editable via admin panel
  const ga68 = await prisma.event.upsert({
    where: { slug: "pabsec-68th-general-assembly" },
    update: {},
    create: {
      slug: "pabsec-68th-general-assembly",
      status: EventStatus.DRAFT,
      startDate: new Date("2026-11-01T09:00:00Z"),
      endDate: new Date("2026-11-03T18:00:00Z"),
      location: "Athens, Hellenic Republic",
      heroTextColor: "auto",
      translations: {
        create: [
          {
            locale: "en",
            title: "68th General Assembly",
            description:
              "The 68th Ordinary Session of the General Assembly of the Parliamentary Assembly of the Black Sea Economic Cooperation.",
          },
          {
            locale: "ru",
            title: "68-я Генеральная Ассамблея",
            description:
              "68-я Обычная сессия Генеральной Ассамблеи Парламентской Ассамблеи Черноморского Экономического Сотрудничества.",
          },
          {
            locale: "tr",
            title: "68. Genel Kurul",
            description:
              "Karadeniz Ekonomik İşbirliği Parlamenter Asamblesi Genel Kurulunun 68. Olağan Oturumu.",
          },
        ],
      },
    },
  });

  console.log("Seeded:", ga67.slug, ga68.slug);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

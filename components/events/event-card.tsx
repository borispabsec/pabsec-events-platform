import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    status: string;
    startDate: Date;
    endDate: Date;
    location: string;
    translations: { title: string }[];
  };
  locale: string;
}

export function EventCard({ event, locale }: EventCardProps) {
  const title = event.translations[0]?.title ?? event.slug;
  const isUpcoming = event.endDate > new Date();

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <Badge variant={isUpcoming ? "default" : "secondary"} className="mb-3 self-start">
          {isUpcoming ? "Upcoming" : "Past"}
        </Badge>
        <h3 className="font-semibold text-gray-900 line-clamp-2">{title}</h3>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-gray-500 space-y-1">
        <p>{formatDateRange(event.startDate, event.endDate, locale)}</p>
        <p>{event.location}</p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/${locale}/events/${event.slug}`}
          className="text-sm text-brand-700 font-medium hover:underline"
        >
          View details →
        </Link>
      </CardFooter>
    </Card>
  );
}

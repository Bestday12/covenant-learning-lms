import {
  Users,
  Link2,
  UserRoundX,
  Clock3,
} from "lucide-react";

const cards = [
  {
    key: "total",
    title: "Total Users",
    icon: Users,
    color:
      "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    key: "linked",
    title: "Linked Couples",
    icon: Link2,
    color:
      "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    key: "unlinked",
    title: "Unlinked",
    icon: UserRoundX,
    color:
      "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    key: "pending",
    title: "Pending Invites",
    icon: Clock3,
    color:
      "bg-violet-50 text-violet-600 border-violet-100",
  },
];

export default function PartnerStats({
  stats,
}) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <p className="mt-3 text-4xl font-bold text-slate-900">
                  {stats[card.key]}
                </p>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${card.color}`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Heart, Shield, Compass } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center py-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-800 mb-4">
          Build, Restore, and Protect Your Marriage
        </h1>
        <p className="text-brand-600 max-w-2xl mx-auto mb-8">
          Christ-centred courses for couples preparing for marriage, rebuilding after
          crisis, and strengthening covenant for the long term.
        </p>
        <Link to="/courses">
          <Button size="lg" variant="accent">Explore Courses</Button>
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <Compass className="text-accent-500 mb-3" size={28} />
          <h3 className="font-serif font-semibold text-lg text-brand-800 mb-2">
            Pre-Marital Masterclass
          </h3>
          <p className="text-brand-500 text-sm">
            Discernment and preparation for engaged and seriously dating couples.
          </p>
        </Card>
        <Card>
          <Heart className="text-accent-500 mb-3" size={28} />
          <h3 className="font-serif font-semibold text-lg text-brand-800 mb-2">
            Covenant Marriage Foundation
          </h3>
          <p className="text-brand-500 text-sm">
            Building a strong biblical foundation for lifelong marriage.
          </p>
        </Card>
        <Card>
          <Shield className="text-accent-500 mb-3" size={28} />
          <h3 className="font-serif font-semibold text-lg text-brand-800 mb-2">
            Marriage Crisis Survival Guide
          </h3>
          <p className="text-brand-500 text-sm">
            Stabilisation and restoration for marriages in serious distress.
          </p>
        </Card>
      </section>
    </div>
  );
}

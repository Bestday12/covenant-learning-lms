// src/components/ui/CourseUpsell.jsx
// Reusable upsell section - shows next course recommendations
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import { supabase } from "@/lib/supabase.js";

// Course relationship map - which courses to recommend after each
const NEXT_COURSE_MAP = {
  "pre-marital-masterclass": ["covenant-marriage-foundation", "newlywed-navigation"],
  "covenant-marriage-foundation": ["communication-that-builds-marriage", "sacred-purpose-gods-design-for-marriage"],
  "newlywed-navigation": ["communication-that-builds-marriage", "covenant-marriage-foundation"],
  "communication-that-builds-marriage": ["covenant-marriage-foundation", "sacred-purpose-gods-design-for-marriage"],
  "marriage-crisis-survival-guide": ["covenant-marriage-foundation", "communication-that-builds-marriage"],
  "parenting-as-a-team": ["blended-family-foundations", "covenant-marriage-foundation"],
  "blended-family-foundations": ["parenting-as-a-team", "communication-that-builds-marriage"],
  "sacred-purpose-gods-design-for-marriage": ["covenant-marriage-foundation", "communication-that-builds-marriage"],
};

export default function CourseUpsell({ completedCourseId, userId, variant = "certificate" }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        // Get next course IDs for this course
        const nextIds = NEXT_COURSE_MAP[completedCourseId] || [];

        // Get all courses if no specific recommendations
        const courseIds = nextIds.length > 0 ? nextIds : [];

        // Fetch course details
        let query = supabase.from("courses").select("id, title, description, price");
        if (courseIds.length > 0) {
          query = query.in("id", courseIds);
        } else {
          query = query.neq("id", completedCourseId).limit(2);
        }

        const { data: courses } = await query;

        // Filter out already enrolled courses
        if (userId && courses?.length) {
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("course_id")
            .eq("user_id", userId);

          const enrolledIds = new Set((enrollments || []).map((e) => e.course_id));
          const filtered = (courses || []).filter((c) => !enrolledIds.has(c.id)).slice(0, 2);
          setRecommendations(filtered);
        } else {
          setRecommendations((courses || []).slice(0, 2));
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    }
    if (completedCourseId) loadRecommendations();
  }, [completedCourseId, userId]);

  if (loading || recommendations.length === 0) return null;

  // Certificate page variant — elegant, scripture-inspired
  if (variant === "certificate") {
    return (
      <div className="mt-12 max-w-5xl mx-auto px-6">
        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-brand-200" />
          <div className="flex items-center gap-2">
            <Star size={14} className="text-accent-500 fill-accent-500" />
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-widest">What's Next for Your Marriage?</span>
            <Star size={14} className="text-accent-500 fill-accent-500" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-brand-200" />
        </div>

        <p className="text-center text-brand-500 text-sm mb-8 max-w-xl mx-auto">
          You have taken a significant step. Here are courses that will help you continue building a strong, Christ-centred marriage.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {recommendations.map((course, index) => (
            <div key={course.id} className="relative rounded-[24px] border border-brand-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3d0a6e] to-[#c9960c]" />

              {index === 0 && (
                <span className="inline-block bg-accent-50 text-accent-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3 border border-accent-200">
                  ⭐ Recommended Next
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-brand-800 text-lg leading-tight mb-2">{course.title}</h3>
                  <p className="text-brand-500 text-sm leading-relaxed line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-brand-800">
                      {course.price ? `£${course.price}` : "Free"}
                    </span>
                    <Link
                      to={`/checkout/${course.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#3d0a6e] text-white px-5 py-2.5 text-sm font-bold hover:bg-[#5a1a9a] transition-colors"
                    >
                      Enrol Now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scripture encouragement */}
        <div className="mt-8 text-center">
          <p className="text-brand-400 text-xs italic">
            "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." — Galatians 6:9
          </p>
        </div>
      </div>
    );
  }

  // Thank You page variant — more urgent, conversion focused
  if (variant === "thankyou") {
    return (
      <div className="mt-10 max-w-2xl mx-auto px-6">
        <div className="rounded-[24px] border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-white p-6">
          <div className="text-center mb-6">
            <span className="inline-block bg-accent-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              💑 COUPLES WHO BOUGHT THIS ALSO LOVED
            </span>
            <h3 className="font-serif text-xl font-bold text-brand-800">Continue Your Marriage Journey</h3>
            <p className="text-brand-500 text-sm mt-1">Add another course while you're here</p>
          </div>

          <div className="space-y-4">
            {recommendations.slice(0, 1).map((course) => (
              <div key={course.id} className="rounded-2xl bg-white border border-brand-100 p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={24} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-brand-800 leading-tight">{course.title}</h4>
                  <p className="text-brand-400 text-xs mt-0.5 line-clamp-1">{course.description}</p>
                  <p className="text-accent-600 font-bold text-lg mt-1">
                    {course.price ? `£${course.price}` : "Free"}
                  </p>
                </div>
                <Link
                  to={`/checkout/${course.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#3d0a6e] text-white px-4 py-2.5 text-sm font-bold hover:bg-[#5a1a9a] transition-colors flex-shrink-0"
                >
                  Add <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

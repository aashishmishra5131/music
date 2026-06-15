import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import dbConnect from "@/lib/db.Connect";
import CourseModel from "@/model/Course";

const staticCourses = [
  {
    title: "Guitar Fundamentals",
    slug: "guitar-fundamentals",
    description: "Learn the basics of playing guitar with our comprehensive beginner's course. Master chords, strumming patterns, and music theory fundamentals.",
    price: 999,
    instructor: "John Doe",
    image: "https://img.freepik.com/free-photo/texture-treble-clef-dark-background-isolated-generative-ai_169016-29581.jpg?size=626&ext=jpg",
    level: "Beginner",
    category: "Guitar",
    duration: "6 weeks",
    isFeatured: true,
    isPublished: true,
  },
  {
    title: "Piano for Beginners",
    slug: "piano-for-beginners",
    description: "Start your musical journey with foundational piano skills taught by expert instructors. Learn scales, chords, and your first songs.",
    price: 1299,
    instructor: "John Doeee",
    image: "https://img.freepik.com/free-photo/texture-treble-clef-dark-background-isolated-generative-ai_169016-29581.jpg?size=626&ext=jpg",
    level: "Beginner",
    category: "Piano",
    duration: "8 weeks",
    isFeatured: true,
    isPublished: true,
  },
  {
    title: "Advanced Vocal Techniques",
    slug: "advanced-vocal-techniques",
    description: "Enhance your singing with advanced vocal techniques for intermediate to advanced learners. Covers breathing, range extension, and performance skills.",
    price: 1499,
    instructor: "Emily Johnson",
    image: "https://img.freepik.com/free-photo/texture-treble-clef-dark-background-isolated-generative-ai_169016-29581.jpg?size=626&ext=jpg",
    level: "Advanced",
    category: "Vocals",
    duration: "10 weeks",
    isFeatured: true,
    isPublished: true,
  },
  {
    title: "Drumming Mastery",
    slug: "drumming-mastery",
    description: "Master the drums with our comprehensive course covering all skill levels. From basic beats to complex fills and full band performance.",
    price: 1199,
    instructor: "Mike Brown",
    image: "https://img.freepik.com/free-photo/texture-treble-clef-dark-background-isolated-generative-ai_169016-29581.jpg?size=626&ext=jpg",
    level: "Intermediate",
    category: "Drums",
    duration: "8 weeks",
    isFeatured: true,
    isPublished: true,
  },
];

export async function POST() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let seeded = 0;
    let skipped = 0;

    for (const course of staticCourses) {
      const exists = await CourseModel.findOne({ slug: course.slug });
      if (!exists) {
        await CourseModel.create(course);
        seeded++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seeded} courses, skipped ${skipped} (already exist)`,
      seeded,
      skipped,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Also auto-seed on GET (for quick check)
export async function GET() {
  try {
    await dbConnect();
    let seeded = 0;
    for (const course of staticCourses) {
      const exists = await CourseModel.findOne({ slug: course.slug });
      if (!exists) {
        await CourseModel.create(course);
        seeded++;
      }
    }
    const total = await CourseModel.countDocuments({ isPublished: true });
    return NextResponse.json({ success: true, seeded, total });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

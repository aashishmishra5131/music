"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { useRouter } from "next/navigation";
import axios from "axios";
import { IconLoader2, IconTag } from "@tabler/icons-react";

type Course = {
  _id?: string;
  id?: number;
  title: string;
  slug?: string;
  description: string;
  image: string;
  price?: number;
  instructor?: string;
  level?: string;
};

function Page() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Auto-seed static courses to DB then fetch
      await axios.get("/api/admin/seed-courses");
      const res = await axios.get("/api/admin/courses");
      if (res.data.success && res.data.courses?.length > 0) {
        setCourses(res.data.courses.filter((c: any) => c.isPublished));
      } else {
        // Fallback to JSON
        const json = require("@/data/music_courses.json");
        setCourses(json.courses);
      }
    } catch {
      // Fallback to JSON
      const json = require("@/data/music_courses.json");
      setCourses(json.courses);
    } finally {
      setLoading(false);
    }
  };

  const getSlug = (course: Course) =>
    course.slug ||
    course.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  return (
    <div className="min-h-screen bg-black py-12 pt-36">
      <h1 className="text-lg md:text-7xl text-center font-sans font-bold mb-8 text-white">
        All Courses
        {!loading && <span className="text-5xl ml-3 text-neutral-500">({courses.length})</span>}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <IconLoader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-wrap justify-center">
          {courses.map((course, i) => (
            <CardContainer key={course._id || course.id || i} className="inter-var m-4">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  {course.title}
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  {course.description}
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-4">
                  <Image
                    src={course.image}
                    height="1000"
                    width="1000"
                    className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt={course.title}
                    unoptimized
                  />
                </CardItem>
                <div className="flex justify-between items-center mt-6">
                  {/* Price badge */}
                  <CardItem translateZ={20}>
                    {course.price !== undefined ? (
                      <div className="flex items-center gap-1 text-purple-400 font-bold text-sm">
                        <IconTag className="w-4 h-4" />
                        ₹{Number(course.price).toLocaleString("en-IN")}
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-xs">Free</span>
                    )}
                  </CardItem>

                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl text-xs font-semibold dark:text-white bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition-all"
                    onClick={() => router.push(`/course_details/${getSlug(course)}`)}
                  >
                    Get details →
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      )}
    </div>
  );
}

export default Page;

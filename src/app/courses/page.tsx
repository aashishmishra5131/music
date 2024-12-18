'use client';
import Image from "next/image";
import React, { useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import courseData from "@/data/music_courses.json";
import { useRouter } from "next/navigation";

function Page() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const router = useRouter();

  const handleBuyClick = (course: any) => {
    setSelectedCourse(course);
  };

  const closePopup = () => {
    setSelectedCourse(null);
  };

  const handleDetails = () =>{
    router.push(`/course_details`);
  }

  return (
    <div className="min-h-screen bg-black py-12 pt-36">
      <h1 className="text-lg md:text-7xl text-center font-sans font-bold mb-8 text-white">
        All courses ({courseData.courses.length})
      </h1>
      <div className="flex flex-wrap justify-center">
        {courseData.courses.map((course) => (
          <CardContainer key={course.id} className="inter-var m-4">
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
                />
              </CardItem>
              <div className="flex justify-between items-center mt-20">
                <CardItem
                  translateZ={20}
                  as="button"
                  className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                  onClick ={handleDetails}
                >
                  {/* Try now → */}
                  Get details →
                </CardItem>
                <CardItem
                  translateZ={20}
                  as="button"
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                  onClick={() => handleBuyClick(course)}
                >
                  Buy
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        ))}
      </div>

      {/* Popup for Course Form */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md relative">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">
              Buy Course: {selectedCourse.title}
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-lg dark:bg-white dark:text-black"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;

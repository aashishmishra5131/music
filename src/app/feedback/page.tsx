"use client"

import { useState } from 'react';
import { BackgroundGradient } from '@/components/ui/gradient';

const FeaturedCourses = () => {
  // Initial courses (for example purposes)
  const initialCourses = [
    { id: 1, title: 'Course 1', description: 'Description of Course 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
    { id: 2, title: 'Course 2', description: 'Description of Course 2bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
    { id: 3, title: 'Course 3', description: 'Description of Course 3cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' },
    { id: 4, title: 'Course 4', description: 'Description of Course 4cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' },
    { id: 5, title: 'Course 5', description: 'Description of Course 5cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' },
    { id: 6, title: 'Course 6', description: 'Description of Course 6cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' },
  ];

  const [courses, setCourses] = useState(initialCourses);

  // Function to handle deleting a course
  const handleDelete = (id: number) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  return (
    <div className="py-12 bg-gray-900 min-h-screen flex flex-col justify-end">
      <div className="flex-grow flex flex-col justify-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center ml-8 mr-8 mb-12">
          {courses.map((course) => (
            <div className="flex justify-center" key={course.id}>
              <BackgroundGradient className="relative flex flex-col rounded-[22px] bg-white dark:bg-zinc-900 overflow-hidden h-full max-w-sm">
              
                <button
                  onClick={() => handleDelete(course.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-500 text-3xl"
                  aria-label="Delete Course"
                >
                  ✕
                </button>
                <div className="p-4 sm:p-6 flex flex-col items-center text-center flex-grow">
                  <p className="text-lg sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                    {course.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-grow">
                    {course.description}
                  </p>
                </div>
              </BackgroundGradient>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCourses;

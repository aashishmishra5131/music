"use client"
import { HoverEffect } from "./ui/card-hover-effect";
import Link from "next/link";

const projects = [
    {
      title: "Understanding Music Theory",
      description: "A comprehensive guide to the fundamental concepts of music theory.",
      slug: 'understanding-music-theory',
      isFeatured: true,
    },
    {
      title: "Music Production Techniques",
      description: "Exploring the latest techniques and tools used in music production.",
      slug: 'music-production-techniques',
      isFeatured: true,
    },
    {
      title: "History of Classical Music",
      description: "An in-depth look at the development and evolution of classical music through the ages.",
      slug: 'history-of-classical-music',
      isFeatured: false,
    },
    {
      title: "Modern Music Trends",
      description: "Analyzing the trends and influences shaping contemporary music.",
      slug: 'modern-music-trends',
      isFeatured: true,
    },
    {
      title: "Music and Technology",
      description: "Examining the impact of technology on music creation, distribution, and consumption.",
      slug: 'music-and-technology',
      isFeatured: false,
    },
    {
      title: "Jazz Improvisation Techniques",
      description: "A guide to the art and techniques of jazz improvisation.",
      slug: 'jazz-improvisation-techniques',
      isFeatured: true,
    },
    {
      title: "World Music Exploration",
      description: "Discovering the rich and diverse musical traditions from around the world.",
      slug: 'world-music-exploration',
      isFeatured: false,
    },
    {
      title: "Electronic Music Production",
      description: "Learning the processes and tools used in creating electronic music.",
      slug: 'electronic-music-production',
      isFeatured: true,
    },
    {
      title: "Songwriting and Composition",
      description: "Developing skills and techniques for writing and composing original music.",
      slug: 'songwriting-and-composition',
      isFeatured: false,
    }
  ];
  

const UpcomingWebinars = () => {
      return (
      <div className='py-12 bg-gray-900'>
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className='text-center'>
             <h2 className='text-base text-teal-600 font-semibold tracking-wide'>FEATURED WEBINARS</h2>
             <p className='mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl'>Enhance Your Musical Journey</p>
          </div>
         </div>
         <div className='mt-10'>
            
                  <HoverEffect items={projects.map(webinar=>(
                    {
                        title:webinar.title,
                        description:webinar.description,
                        link:'/'
                    }
                  ))} />
                  </div>
         <div className='mt-20 text-center'>
            <Link href={"/courses"} className='px-4 py-2 rounded-border border-neutral-600 text-neutral-700 bg-white hover:bg-gray-100 transition duration-200'>
             View All Courses
            </Link>
         </div>
      </div>
    )
}

export default UpcomingWebinars
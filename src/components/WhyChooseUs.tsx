"use client";
import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";

const musicSchoolContent = [
    {
      title: "Master Classes with Renowned Musicians",
      description:
      "Learn from the best in the industry. Our music school offers exclusive master classes with world-renowned musicians. Gain insights, techniques, and inspiration from those who have mastered their craft."
    },
    {
      title: "Individualized Instruction",
      description:
        "Tailor your learning experience with personalized lessons. Our expert instructors provide one-on-one guidance to help you achieve your musical goals, whether you're a beginner or an advanced student.",
    },
    {
      title: "Version control",
      description:
        "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
      
    },
    {
      title: "Running out of content",
      description:
        "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
      
    },
    {
        title: "State-of-the-Art Facilities",
        description:
          "Practice and perform in our cutting-edge facilities. Our music school is equipped with top-of-the-line instruments, recording studios, and performance spaces to support your growth as a musician.",
        
    },
    {
        title: "Music Production and Technology",
        description:
          "Practice and perform in our cutting-edge facilities. Our music school is equipped with top-of-the-line instruments, recording studios, and performance spaces to support your growth as a musician. Dive into the world of music production and technology. Our courses cover recording techniques, digital audio workstations, and sound engineering, preparing you for a career in the modern music industry.",
        
    },
  ];

const WhyChooseUs = () => {
  return (
    <div>
        <StickyScroll content={musicSchoolContent}/>
    </div>
  )
}

export default WhyChooseUs
"use client";
import React from "react";
import { WavyBackground } from "./ui/wavy-background";
import { AnimatedTooltip } from "./ui/animated-tooltip";

const instructor=[
  {
    id:1,
    name:'Aashish Mishra',
    designation:'Vocal Coach',
    image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSVUrrx8ohez67j1Qq8uKMrhwXwg1CJp1aDw&s'
  },
  {
    id:2,
    name:'Abhishek Mishra',
    designation:'Guitar Coach',
    image:'https://skillcurb.com/wp-content/uploads/2022/05/hero-instructor.png'
  },
  {
    id:3,
    name:'Harsh Mishra',
    designation:'accordian Coach',
    image:'https://t3.ftcdn.net/jpg/02/94/21/42/360_F_294214205_ZmptWrtSwORSWadAIHSWqwSa319XlQiB.jpg'
  },
  {
    id:4,
    name:'Rohan Mishra',
    designation:'Trumpet Coach',
    image:'https://t4.ftcdn.net/jpg/02/78/59/29/360_F_278592929_5Ia1ld3x1Dpwio0li2L8sP2k9wI8CCM7.jpg'
  },
]

const Instructor = () => {
  return (
    <div className="relative h-[40rem] overflow-hidden flex items-center justify-center">
      <WavyBackground className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center h-full">
       <h2 className="text-2xl md:text-4xl lg:text-7xl text-white font-bold text-center mb-8">Meet Our Instructors</h2>
       <p className="text-base md:text-lg text-white text-center mb-4">Discover the talented professional who will guide your musical journey</p>
       <div className="flex flex-row items-center justify-center mb-10 w-full">
       <AnimatedTooltip items={instructor} />
       </div>
      </WavyBackground>
    </div>
  )
}

export default Instructor
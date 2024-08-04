"use client";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";


const testimonials = [
  {
    quote:
      "This service has exceeded our expectations. The team was professional and the results were fantastic. Highly recommended!",
    name: "John Doe",
    title: "CEO at ExampleCorp",
  },
  {
    quote:
      "An exceptional experience from start to finish. The quality of work was outstanding and the customer service was top-notch.",
    name: "Jane Smith",
    title: "Marketing Manager at Marketify",
  },
  {
    quote:
      "A game-changer for our business. The innovative solutions provided were exactly what we needed. Fantastic job!",
    name: "Mike Johnson",
    title: "CTO at InnovateTech",
  },
  {
    quote:
      "The best investment we have made. The results speak for themselves and the support was fantastic.",
    name: "Sarah Williams",
    title: "Product Manager at TechCorp",
  },
  {
    quote:
      "Absolutely wonderful! I'm really impressed with the team's dedication and creativity.",
    name: "James Brown",
    title: "Founder at StartupHub",
  },
  {
    quote:
      "The quality of work delivered was outstanding. Their attention to detail and commitment to excellence is truly impressive.",
    name: "Patricia Taylor",
    title: "COO at FinServ",
  },
  {
    quote:
      "Highly professional and incredibly talented team. The project was delivered on time and exceeded our expectations.",
    name: "Robert Miller",
    title: "Head of Development at SoftSolutions",
  },
  {
    quote:
      "Their expertise and creativity transformed our vision into reality. We couldn't be happier with the results.",
    name: "Emily Davis",
    title: "Chief Designer at CreativeStudio",
  },
  {
    quote:
      "From start to finish, the experience was seamless and the outcome was perfect. Great job!",
    name: "Michael Wilson",
    title: "Director at InnovateMedia",
  },
  {
    quote:
      "Remarkable service and exceptional quality. The team's dedication and expertise made all the difference.",
    name: "Emma Martinez",
    title: "VP of Marketing at Brandify",
  },
  {
    quote:
      "Outstanding work! The project was executed flawlessly and the results were beyond our expectations.",
    name: "Daniel Garcia",
    title: "Senior Engineer at BuildTech",
  },
  {
    quote:
      "Their innovative approach and attention to detail were exactly what we needed. We highly recommend their services.",
    name: "Laura Hernandez",
    title: "HR Manager at PeopleFirst",
  },
  {
    quote:
      "A fantastic experience from beginning to end. The team's professionalism and talent were evident in every step.",
    name: "William Lee",
    title: "CEO at GreenEnergy",
  },
  {
    quote:
      "Impressive work! The team's creativity and dedication resulted in an outstanding product.",
    name: "Olivia Rodriguez",
    title: "Project Lead at WebWorks",
  },
  {
    quote:
      "Their ability to understand our needs and deliver exceptional results was remarkable. We're extremely satisfied.",
    name: "David Martinez",
    title: "Operations Manager at LogiTrack",
  },
];

const TestimonialCards = () => {
  return (
    <div className="h-[40rem] w-full dark:bg-black dark:bg-grid-white/[0.2] relative flex flex-col items-center justify-center overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-8 z-10">Here Our Harmony : Voices of Success</h2>
      <div className="flex justify-center w-full overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    </div>
  );
};

export default TestimonialCards;

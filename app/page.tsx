import { ScrollHero } from "@/components/hero/ScrollHero";
import { About } from "@/components/home/About";
import { FinalCta } from "@/components/home/FinalCta";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Institutions } from "@/components/home/Institutions";
import { Intro } from "@/components/home/Intro";
import { Privacy } from "@/components/home/Privacy";

export default function Home() {
  return (
    <>
      <ScrollHero />
      <Intro />
      <HowItWorks />
      <About />
      <Institutions />
      <Privacy />
      <FinalCta />
    </>
  );
}

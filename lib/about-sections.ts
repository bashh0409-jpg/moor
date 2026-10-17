export interface AboutSection {
  index: string;
  label: string;
  body: string;
}

// Shared by the page and /api/tts so the spoken text always matches the UI.
export const ABOUT_SECTIONS: AboutSection[] = [
  {
    index: "01",
    label: "Problem",
    body: "Our digital lives are built around files, yet managing them across devices, folders and storage services can quickly become complicated. As our libraries grow, finding space for large files and keeping everything accessible becomes increasingly difficult. Local storage has its limits, while traditional cloud storage can feel like little more than another place to put things. We believe managing digital files should feel simpler, more flexible and less dependent on the limitations of a single device.",
  },
  {
    index: "02",
    label: "The Idea",
    body: "Splash is an upcoming cloud storage platform built around a simple idea: your files should have a place of their own, accessible beyond the limits of your local device. Inspired by a new generation of storage solutions, Splash aims to make storing, accessing and managing digital files feel natural. We're exploring a more straightforward approach to cloud storage, bringing the essentials together in one focused experience without unnecessary complexity.",
  },
  {
    index: "03",
    label: "The Experience",
    body: "We're building Splash with simplicity at its core. The goal is to create a clean, intuitive space where files can be stored, browsed and managed without friction. From everyday documents to larger digital assets, the experience is being designed to keep file management straightforward and organised. Rather than overwhelming users with unnecessary tools, Splash will focus on the essential interactions that make cloud storage useful, accessible and easy to understand.",
  },
  {
    index: "04",
    label: "The Vision",
    body: "We imagine a future where your digital files are no longer tied so closely to the physical devices you own. Splash aims to make cloud storage feel like a natural extension of your everyday computing experience, giving your files a more flexible home as your digital world grows. Our vision is to create a dependable, accessible storage experience that puts your files first and makes managing them feel less like a technical task and more like second nature.",
  },
  {
    index: "05",
    label: "Principles",
    body: "Splash is being shaped by a few simple principles. Simplicity means making storage easy to understand and use. Accessibility means rethinking how people reach their files beyond a single device. Reliability means treating the safekeeping of digital assets as a fundamental responsibility. Privacy means designing with appropriate protection and user control in mind. These principles guide our decisions as we work towards a product that feels considered, practical and built around the needs of the people who use it.",
  },
  {
    index: "06",
    label: "In Development",
    body: "Splash is currently in preparation. We're working on the foundations of the product, exploring the right infrastructure and shaping an experience that brings our vision of cloud storage to life. This stage is about getting the fundamentals right before opening the platform to users. We're taking the time to build thoughtfully, prioritising the core storage experience and making deliberate decisions about what belongs in the product and what doesn't. There's still work ahead, and this is only the beginning.",
  },
  {
    index: "07",
    label: "What's Next",
    body: "The next chapter of Splash is focused on turning the idea into a working product. Our initial direction centres on the foundations of cloud file storage, with a focus on file management, accessibility and a straightforward user experience. As development progresses, we'll share more about the platform, its capabilities and our plans for launch. We're not rushing to build everything at once. We're focused on getting the essentials right and creating a solid foundation for what Splash can become.",
  },
];

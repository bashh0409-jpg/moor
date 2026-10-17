export interface AboutSection {
  index: string;
  label: string;
  body: string;
}

// Shared by the page and /api/tts so the spoken text always matches the UI.
// Platform and feature claims below mirror the v1 scope (Mac first); update them as milestones ship.
export const ABOUT_SECTIONS: AboutSection[] = [
  {
    index: "01",
    label: "Problem",
    body: "Our digital lives are built around files, yet storage is still tied to the device in front of us. Libraries of photos, video and projects keep growing, internal disks fill up, and the usual fix is to download, upload and juggle copies between a computer and a cloud service. Traditional cloud storage often feels like a separate website rather than part of your computer. We believe your files should be as easy to open as the ones sitting on your own disk, wherever they actually live.",
  },
  {
    index: "02",
    label: "The Idea",
    body: "Splash is an upcoming cloud storage app that works like a drive you plug into your computer. Install it, mount your Splash drive, and it appears alongside your other drives in Finder. Your files live in the cloud, but you open, edit and save them just as you would with a USB stick. Splash fetches only the parts of a file you actually need, when you need them, so a large video can start playing without waiting for the whole thing to download.",
  },
  {
    index: "03",
    label: "Experience",
    body: "The experience is designed to feel invisible. Drag files onto your drive to move them to the cloud and free up space on your device. Open a document, scrub through a video or browse a large folder without downloading everything first. Frequently used files are kept close by so they open quickly, and changes are sent back to the cloud as you save. There is no separate upload step to remember, and no extra app to learn beyond the drive itself.",
  },
  {
    index: "04",
    label: "The Vision",
    body: "We imagine a future where the size of your files is no longer limited by the size of your disk. Splash aims to make cloud storage feel like a natural extension of your computer, giving your files a flexible home that grows with your digital world. Our vision is a dependable drive that works the same way on every device you own, putting your files first and making storage feel less like a technical task and more like second nature.",
  },
  {
    index: "05",
    label: "Principles",
    body: "Splash is being shaped by a few simple principles. Simplicity means a drive that behaves like any other, with nothing new to learn. Accessibility means reaching your files from any of your devices without copying them around. Reliability means treating the safekeeping of your files as a fundamental responsibility, including when a connection drops mid-save. Privacy means designing with appropriate protection and user control in mind. These principles guide our decisions as we work towards a product that feels considered, practical and built around the people who use it.",
  },
  {
    index: "06",
    label: "Development",
    body: "Splash is currently in preparation. We're working on the foundations: the system that presents cloud storage to your computer as a real drive, and the backend that stores and serves your files efficiently. We're starting with Mac, so we can get the core experience right on one platform before widening our reach. This stage is about getting the fundamentals right before opening the platform to users. We're prioritising reading, writing and reliability over extra features, and there's still work ahead.",
  },
  {
    index: "07",
    label: "What's Next",
    body: "The next chapter of Splash is turning the idea into a working product. Our first milestone is a drive you can mount on your Mac and browse, with files streaming on demand rather than downloading in full. After that, we'll add writing files back to the cloud, then support for using Splash across multiple devices. Linux and Windows will follow once the Mac experience is solid. We're not rushing to build everything at once. We're focused on getting the essentials right and creating a solid foundation for what Splash can become.",
  },
];

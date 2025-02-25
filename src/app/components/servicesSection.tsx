"use client";

import React, { JSX } from "react";
import Image from "next/image";

interface IFeature {
  name: string;
  icon: string;
}

interface IService {
  title: string;
  description: string[];
  icon: string;
  features?: IFeature[];
  imageUrl: string;
}

const servicesData: IService[] = [
  {
    title: "Digital Product Development",
    description: [
      "Do you know the feeling of navigating a website or a mobile application and it is either hideous or you are getting lost in the pages all the time?",
      "UI and UX is the art of creating beautiful applications that offer a smooth user experience whether it is a web or mobile application.",
      "Both are essential for creating a successful application. UI design ensures that the application looks visually appealing and attractive to users, while UX design ensures that the application is intuitive and easy to use.",
      "Let us enable you to balance both.",
    ],
    icon: "/icons/digital.svg",
    imageUrl: "/images/dpd.jpg",
    features: [
      {
        name: "E-commerce & Websites",
        icon: "/icons/e-commerce.svg",
      },
      {
        name: "Mobile apps & Web applications",
        icon: "/icons/mobile.svg",
      },
      {
        name: "Digital Solutions & Platforms",
        icon: "/icons/platforms.svg",
      },
    ],
  },
  {
    title: "Climate Reporting",
    description: [
      "Searching for the right data? Preparing to report scope 1, 2 or 3? Or are you looking for internal tracking to make data-driven decisions to lower your climate footprint?",
      "At Enablment, we have the technical skills to integrate with the correct data sources and align that data for trustworthy reporting. We can set up automated reporting flows from multiple data sources for internal tracking.",
    ],
    icon: "/icons/climate.svg",
    imageUrl: "/images/climate.jpg",
  },
  {
    title: "Insights through Data",
    description: [
      "On the journey of digitalization, automating and optimizing processes and data collection create the best fundamentals for an effective digital solution.",
      "Luckily, we are more than stoked to help you with following.",
    ],
    icon: "/icons/data.svg",
    imageUrl: "/images/data.jpg",
  },
  {
    title: "Data Consolidation (Cloud)",
    description: [
      "Is it difficult, and time consuming gathering data, and structuring it for data analytics/insight?",
      "This is the first step within data analytics and all companies will inevitably go through this transformation at some point. Once implemented there will be a consistent and reliable data foundation for all data analysis. Plus a setup like this is fully automated.",
    ],
    icon: "/icons/cloud.svg",
    imageUrl: "/images/cloud.jpg",
  },
  {
    title: "Business Intelligence (BI)",
    description: [
      "Do you have a database that is automatically sourcing the data for you? And is your data then, consequently, consolidated in one place and might even be structured? Now you want insight from your data?",
      "This is Business Intelligence. We conduct a data analysis and transform your data, then we create dashboards to visualize the insight.",
    ],
    icon: "/icons/bi.svg",
    imageUrl: "/images/bi.jpg",
  },
  {
    title: "Machine Learning & Artificial Intelligence (ML & AI)",
    description: [
      "Is your decision-making process supplemented with insight and a descriptive data analysis through BI? Are you ready to let a data model offer you suggestions?",
      "Certain trends and causalities that might not be visible to the human eye or the data input is simply too big. This is when you move from the descriptive to the prescriptive data analysis. A machine learning model can highlight causalities and forecast development.",
    ],
    icon: "/icons/ai.svg",
    imageUrl: "/images/AI-ML.jpg",
  },
];
const formatText = (text: string, maxLength: number): JSX.Element[] => {
  const words = text.split(" ");
  const formattedLines: JSX.Element[] = [];
  let currentLine = "";

  words.forEach((word, index) => {
    if ((currentLine + word).length > maxLength) {
      formattedLines.push(
        <span key={index}>
          {currentLine.trim()}
          <br />
        </span>
      );
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  });

  // Add the last line
  if (currentLine) {
    formattedLines.push(<span key={words.length}>{currentLine.trim()}</span>);
  }

  return formattedLines;
};
const ServicesSection: React.FC = () => {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      <h2 className="text-3xl font-pt-sans-bold-900 mb-4">Services</h2>
      <div
        style={{
          maxHeight: "calc(100vh - 300px)",
          overflowY: "auto",
        }}
      >
        {servicesData.map((service, index) => (
          <div key={index} className="mb-6">
            <div className="flex flex-wrap items-stretch shadow-lg rounded-lg overflow-hidden lg:justify-start sm:justify-center lg:flex-nowrap space-x-4">
              <div className="relative w-full flex-grow tablet:flex-grow-0 md:w-1/2  services-image-container">
                <Image
                  src={service.imageUrl}
                  alt={`${service.title}`}
                  layout="fill"
                  objectFit="cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              {/* Rest of the Content */}
              <div className="text-container lg:w-1/2 sm:mt-4">
                <div className="flex items-center space-x-2">
                  <Image
                    src={service.icon}
                    alt={`${service.title} Icon`}
                    width={24}
                    height={24}
                  />
                  <h3 className="text-2xl font-semibold mb-2">
                    {service.title}
                  </h3>
                </div>
                {service.description.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    style={{ lineHeight: "1.4" }}
                    className="text-lg mb-3"
                  >
                    {/* {formatText(paragraph, 75)} */}
                    {paragraph}
                  </p>
                ))}
                {service.features && (
                  <div className="flex flex-col space-y-2 mt-4">
                    {service.features.map((feature, fIndex) => (
                      <div
                        key={fIndex}
                        className="flex items-center space-x-2 "
                      >
                        <Image
                          src={feature.icon}
                          alt={`${feature.name} Icon`}
                          width={20}
                          height={20}
                        />
                        <span style={{ lineHeight: "1.4" }} className="text-lg">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;

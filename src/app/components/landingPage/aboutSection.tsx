import React from "react";

interface IDefinition {
  term: string;
  description: string;
}

interface IAboutContent {
  definitions: IDefinition[];
  transparency: string[];
  organization: string[];
}

const aboutContent: IAboutContent = {
  definitions: [
    {
      term: "Collaborator",
      description:
        "Is a client company, who is subject to a collaboration with Enablment.",
    },
    {
      term: "Enabler",
      description:
        "Conventionally known as a consultant, but we enable Collaborators. We exist because we are Enablers who love to devise and create delightful technical solutions with Collaborators.",
    },
  ],
  transparency: [
    "We demystify the conventional consultancy-client relationship.",
    "We want transparency. In the sense that we have structurally implemented it in our professional relationship with Collaborators.",
    "We want to communicate openly with Collaborators whether an Enabler is experienced in the given tech or needs to learn new components.",
    "Consequently, we deploy varied rates for varied tasks, supported by a decision tree and a detailed invoice report.",
  ],
  organization: [
    "We place decision-making where it is due.",
    "Enablment is expanding on the idea of a flat hierarchy and is transitioning towards an organization with distributed leadership.",
    "We have a passion for rethinking and refining processes, why we deploy slim and execution-oriented project teams. That means we have redefined the project manager as a role that is shared by Collaborators and Enablers, but it is structured by a system landscape.",
    "We have added what we call work groups. These are diverse groups of Enablers which only exist to support each other in their decision-making.",
    "At Enablement, everyone is passionate about digitization and capable to execute on it.",
  ],
};

const AboutSection: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl mb-4 font-pt-sans-bold-900">About Enablment</h2>
      <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
        <section className="pb-4">
          <h3 className="text-2xl font-semibold mb-2">Definitions</h3>
          {aboutContent.definitions.map((def, index) => (
            <div key={index} className="mb-3">
              <p style={{ lineHeight: "1.4" }} className="text-lg">
                <span className="font-bold">{def.term}:</span> {def.description}
              </p>
            </div>
          ))}
        </section>

        <section className="flex flex-col md:flex-row space-y-4 gap-4">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-semibold mb-2">Transparency</h3>
            {aboutContent.transparency.map((item, index) => (
              <div key={index} className="mb-3">
                <p
                  style={{ lineHeight: "1.4" }}
                  className="text-lg font-roboto"
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
          <div className="md:w-1/2 flex justify-center shadow-md">
            <video
              className="rounded-lg lazy h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src="/video/transparancy.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        <section className="flex flex-col md:flex-row-reverse mt-6 gap-4">
          <div className="md:w-1/2 mt-6">
            <h3 className="text-2xl font-semibold mb-2">Organization</h3>
            {aboutContent.organization.map((item, index) => (
              <div key={index} className="mb-3">
                <p
                  style={{ lineHeight: "1.4" }}
                  className="text-lg font-roboto"
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
          <div className="md:w-1/2 flex justify-center">
            <video
              className="rounded-lg lazy h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src="/video/meeting.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutSection;

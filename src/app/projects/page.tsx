"use client";
import React, { useState, useEffect, FC } from "react";

const Projects: FC = () => {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:8080/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              query {
                projects {
                  id
                  name
                  teamId
                }
              }
            `,
          }),
        });

        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Server Response:", data);

        if (data && data.data && data.data.projects) {
          setProjects(data.data.projects);
        } else if (data.errors && data.errors.length > 0) {
          alert(`Error: ${data.errors[0].message}`);
        } else {
          alert("An unexpected error occurred.");
        }
      } catch (error: any) {
        alert(
          `Network error: ${error.message || "Cannot connect to the server."}`
        );
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <h2 className="text-2xl text-stone-950 font-semibold mb-4">Projects</h2>
      <ul className="bg-white shadow rounded p-4">
        {projects.map((project) => (
          <li key={project.id} className="border-b border-gray-200 py-2">
            <span className="font-medium text-stone-700">
              Project Name: {project.name}
            </span>{" "}
            (<span className="text-green-800">Team ID:</span>{" "}
            <span className="text-stone-700">{project.teamId}</span>)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;

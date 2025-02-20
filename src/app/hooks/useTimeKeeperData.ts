import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import {
  PROJECTS_QUERY,
  USER_PROJECTS_QUERY,
} from "@/app/graphql/timeKeeperOperations";
import useStore from "@/app/lib/store";
import { currentUserVar } from "@/app/lib/apolloClient";

// Define interfaces for our expected data shapes:
export interface Project {
  id: string;
  name: string;
  teamId: string;
}

export interface ProjectsData {
  projects: Project[];
}

export interface Team {
  name: string;
  projects: Project[];
}

export interface User {
  id: string;
  teams: Team[];
}

export interface UserProjectsData {
  users: User[];
}

export interface UserProject {
  id: string;
  name: string;
  teamName: string;
}

const useTimeKeeperData = () => {
  // Use typed queries
  const { data: projectsData } = useQuery<ProjectsData>(PROJECTS_QUERY);
  const { data: userProjectsData } = useQuery<UserProjectsData>(
    USER_PROJECTS_QUERY,
    {
      skip: !currentUserVar(),
    }
  );
  const { setProjects, setTeamId } = useStore();
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | undefined>(
    undefined
  );
  const selectedProject = useStore((state) => state.selectedProject);

  useEffect(() => {
    if (projectsData) {
      setProjects(projectsData.projects);
    }
  }, [projectsData, setProjects]);

  useEffect(() => {
    if (projectsData && selectedProject) {
      // Use the typed projects array
      const project = projectsData.projects.find(
        (p) => p.id === selectedProject
      );
      if (project) {
        setTeamId(project.teamId);
        setCurrentTeamId(project.teamId);
      }
    }
  }, [projectsData, selectedProject, setTeamId]);

  useEffect(() => {
    const currentUser = currentUserVar();
    if (userProjectsData && currentUser) {
      const currentUserId = currentUser.id;
      const user = userProjectsData.users.find((u) => u.id === currentUserId);
      if (user) {
        const projectsList: UserProject[] = user.teams.flatMap((team) =>
          team.projects.map((project) => ({
            id: project.id,
            name: project.name,
            teamName: team.name,
          }))
        );
        setUserProjects(projectsList);
      }
    }
  }, [userProjectsData]);

  return { userProjects, currentTeamId };
};

export default useTimeKeeperData;

import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_MY_PROJECTS } from "@/app/components/Admin/totalTimeSpent";
import useStore from "@/app/lib/store";
import { useAuthStore } from "@/app/lib/authStore";

export interface MyProject {
  id: string;
  name: string;
  teamName?: string;
  teamId: string;
  __typename?: "Project";
}

interface GetMyProjectsQueryData {
  myProjects: MyProject[];
}

const useTimeKeeperData = () => {
  const user = useAuthStore((state) => state.user);
  const loggedInUserId = user?.id;

  const {
    data: myProjectsData,
    loading: loadingMyProjects,
    error: errorMyProjects,
  } = useQuery<GetMyProjectsQueryData>(GET_MY_PROJECTS, {
    skip: !loggedInUserId,
    fetchPolicy: "cache-first",
  });

  const { setProjects, setTeamId } = useStore(); // Keep zustand store actions if still needed
  const [userProjects, setUserProjects] = useState<MyProject[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | undefined>(
    undefined
  );
  const selectedProject = useStore((state) => state.selectedProject); // Keep if used

  useEffect(() => {
    if (myProjectsData?.myProjects) {
      setUserProjects(myProjectsData.myProjects);
      // Update the generic 'projects' in zustand store if other components use it?
      // Or maybe remove setProjects from zustand if only TimeKeeper needs this list.
      // setProjects(myProjectsData.myProjects); // Be careful with types if setProjects expects the old Project type
    } else {
      setUserProjects([]);
      // setProjects([]); // Clear zustand store too?
    }
  }, [myProjectsData /* setProjects */]); // Adjust dependencies

  // Effect to set teamId based on selectedProject
  useEffect(() => {
    if (myProjectsData?.myProjects && selectedProject) {
      // Find the project in the fetched 'myProjects' list
      const project = myProjectsData.myProjects.find(
        (p) => p.id === selectedProject
      );
      if (project?.teamId) {
        setTeamId(project.teamId); // Update zustand store
        setCurrentTeamId(project.teamId); // Update local state if needed elsewhere in hook
      } else {
        // Clear if selected project not found or has no teamId
        setTeamId(null);
        setCurrentTeamId(undefined);
      }
    } else if (!selectedProject) {
      // Clear if no project is selected
      setTeamId(null);
      setCurrentTeamId(undefined);
    }
  }, [myProjectsData, selectedProject, setTeamId]);

  // Return projects list specifically formatted for dropdowns if needed,
  // and potentially loading/error states for projects.
  return {
    userProjects, // This list is now directly from GET_MY_PROJECTS
    currentTeamId,
    loadingUserProjects: loadingMyProjects,
    errorUserProjects: errorMyProjects,
  };
};

export default useTimeKeeperData;

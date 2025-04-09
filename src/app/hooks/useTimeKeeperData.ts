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

  const [userProjects, setUserProjects] = useState<MyProject[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | undefined>(
    undefined
  );
  const selectedProject = useStore((state) => state.selectedProject);

  useEffect(() => {
    if (myProjectsData?.myProjects) {
      setUserProjects(myProjectsData.myProjects);
    } else {
      setUserProjects([]);
    }
  }, [myProjectsData]);

  useEffect(() => {
    if (myProjectsData?.myProjects && selectedProject) {
      const project = myProjectsData.myProjects.find(
        (p) => p.id === selectedProject
      );
      if (project?.teamId) {
        setCurrentTeamId(project.teamId);
      } else {
        setCurrentTeamId(undefined);
      }
    } else if (!selectedProject) {
      setCurrentTeamId(undefined);
    }
  }, [myProjectsData, selectedProject]);

  return {
    userProjects,
    currentTeamId,
    loadingUserProjects: loadingMyProjects,
    errorUserProjects: errorMyProjects,
  };
};

export default useTimeKeeperData;

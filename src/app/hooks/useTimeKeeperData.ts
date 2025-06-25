import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_MY_PROJECTS } from "@/app/graphql/fragments";
import { useAuthStore } from "@/app/lib/authStore";
import { useReactiveVar } from "@apollo/client";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";

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

const useTimeKeeperData = (selectedProject: string | null) => {
  const user = useAuthStore((state) => state.user);
  const loggedInUserId = user?.id;
  const teamsVersion = useReactiveVar(loggedInUserTeamsVersion);

  const {
    data: myProjectsData,
    loading: loadingMyProjects,
    error: errorMyProjects,
    refetch: refetchMyProjects,
  } = useQuery<GetMyProjectsQueryData>(GET_MY_PROJECTS, {
    skip: !loggedInUserId,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const [userProjects, setUserProjects] = useState<MyProject[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (myProjectsData?.myProjects) {
      setUserProjects(myProjectsData.myProjects);
    } else {
      setUserProjects([]);
    }
  }, [myProjectsData]);

  useEffect(() => {
    if (teamsVersion > 0 && loggedInUserId) {
      console.log(
        `[useTimeKeeperData] Detected team version change (${teamsVersion}), refetching my projects...`
      );
      refetchMyProjects().catch((err) => {
        console.error("Failed to refetch my projects on version change:", err);
      });
    }
  }, [teamsVersion, loggedInUserId, refetchMyProjects]);

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

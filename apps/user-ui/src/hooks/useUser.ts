
"use client";

import authAxiosInstance from "@/utils/authAxiosInstance";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchUser = async () => {
  try {
    const response = await authAxiosInstance.get(
      "/logged-in-user"
    );

    return response.data.user;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      return null;
    }

    throw error;
  }
};

export const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user: user ?? null,
    isLoading,
    isError,
    refetch,
  };
};

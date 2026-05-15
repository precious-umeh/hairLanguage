import server from "./axiosClient";

export const fetcher = async (url) => {
  try {
    const res = await server.get(url);
    return res.data.products || res.data.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      // Treat empty filtered results as a valid empty state.
      return [];
    }
    throw error;
  }
};

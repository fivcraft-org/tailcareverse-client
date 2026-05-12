import { useState } from "react";

export const useFollow = () => {
  const [isFollowing, setIsFollowing] = useState(false);

  const followUser = async (userId) => {
    // Logic to follow user
    setIsFollowing(true);
  };

  return { isFollowing, followUser };
};

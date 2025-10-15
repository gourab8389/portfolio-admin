"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]); // run once when the component mounts

  return null; // or a loading spinner if you prefer
};

export default Home;

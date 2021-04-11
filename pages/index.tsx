import { getSession } from "next-auth/client";
import React from "react";
import SiteLayout from "../components/SiteLayout";
import prisma from "../lib/prisma";

// index.tsx
export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await prisma.player?.findFirst({
      where: { userId: session?.userId },
    });

    return { props: { player } };
  } else {
    return { props: {} };
  }
};

function HomePage(props) {
  return (
    <SiteLayout player={props.player}>
      <React.Fragment></React.Fragment>
    </SiteLayout>
  );
}

export default HomePage;

import { Player } from "@prisma/client";
import { getSession, useSession } from "next-auth/client";
import React, { useState } from "react";
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
  const [session, loading] = useSession();
  const [fullPlayer] = useState<Player>(props.player);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  return (
    <SiteLayout>
      <React.Fragment></React.Fragment>
    </SiteLayout>
  );
}

export default HomePage;

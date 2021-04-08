import prisma from "../lib/prisma";
import { getSession, useSession } from "next-auth/client";
import { Monster } from "@prisma/client";
import React from "react";
import MonsterCard from "../components/MonsterCard";
import { Row } from "antd";
// index.tsx

interface IFightCatalogueProps {
  monsters: Monster[];
}

const FightCatalogue = ({ monsters }: IFightCatalogueProps) => {
  const [session, loading] = useSession();

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  console.log(monsters, "props");

  return (
    <React.Fragment>
      <Row>
        {monsters.map((monster) => {
          return <MonsterCard monster={monster} showAttack={true} key={monster.id} />;
        })}
      </Row>
    </React.Fragment>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const monsters = await prisma.monster?.findMany();

    return { props: { monsters } };
  } else {
    return { props: {} };
  }
};

export default FightCatalogue;

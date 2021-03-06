import prisma from "../lib/prisma";
import { getSession, useSession } from "next-auth/client";
import { Monster } from "@prisma/client";
import React from "react";
import MonsterCard from "../components/MonsterCard";
import { Col, Row } from "antd";
import SiteLayout from "../components/SiteLayout";
import { getPlayer, IPlayer } from "../lib/functions";
// index.tsx

interface IFightCatalogueProps {
  monsters: Monster[];
  player: IPlayer;
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await getPlayer(session.userId);
    const monsters = await prisma.monster.findMany();

    return { props: { monsters, player } };
  } else {
    return { props: {} };
  }
};

const FightCatalogue = ({ monsters, player }: IFightCatalogueProps) => {
  const [session, loading] = useSession();

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );
  const sortedMonsters = monsters.sort((a, b) => (a.level > b.level ? 1 : -1));
  return (
    <SiteLayout player={player}>
      <Row>
        <h2>Known Monsters</h2>
      </Row>
      <div
        style={{
          display: "grid",
          gridTemplate: "auto / 1fr 1fr 1fr",
          gridGap: 16,
        }}
      >
        {sortedMonsters.map((monster) => {
          return (
            <MonsterCard
              key={monster.id}
              monster={monster}
              showAttack={true}
              hideHpBar={true}
            />
          );
        })}
      </div>
    </SiteLayout>
  );
};

export default FightCatalogue;

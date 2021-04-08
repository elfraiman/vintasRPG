import prisma from "../lib/prisma";
import { getSession, useSession } from "next-auth/client";
import { Monster } from "@prisma/client";
import React from "react";
import MonsterCard from "../components/MonsterCard";
import { Col, Row } from "antd";
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
  const sortedMonsters = monsters.sort((a, b) => (a.level > b.level ? 1 : -1));
  return (
    <React.Fragment>
      <Row>
        <h2>Known Monsters</h2>
      </Row>
      <Row>
        {sortedMonsters.map((monster) => {
          return (
            <Col key={monster.id} span={8}>
              <MonsterCard monster={monster} showAttack={true} />
            </Col>
          );
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

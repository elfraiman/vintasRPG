import { Monster } from "@prisma/client";
import { Button } from "antd";
import { getSession, useSession } from "next-auth/client";
import React, { useState } from "react";
import Header from "../components/Header";
import MonsterCard from "../components/MonsterCard";
import PlayerCard, { IFullPlayer } from "../components/PlayerCard";
import prisma from "../lib/prisma";

function HomePage(props) {
  const [session, loading] = useSession();
  const [fullPlayer, setFullPlayer] = useState<IFullPlayer>(props.fullPlayer);
  const [monster, setMonster] = useState<Monster>(props.monster);

  if (!loading && !session)
    return (
      <React.Fragment>
        <Header />
        <p>Access Denied</p>
      </React.Fragment>
    );

  const save = async () => {
    console.log('fetch');
    await fetch(`http://localhost:3000/api/player/${fullPlayer.player.id}`, {
      method: 'POST',
      body: JSON.stringify(fullPlayer.player)
    })
  };

  const startFight = () => {
    const interval = setInterval(() => {
      console.log("doing fight");
      setFullPlayer({
        equipement: fullPlayer.equipement,
        player: {
          ...fullPlayer.player,
          health: (fullPlayer.player.health -= 1),
        },
      });

      if (fullPlayer.player.health === 0) {
        clearInterval(interval);
        save();
      }
    }, 1000);
  };

  return (
    <React.Fragment>
      <Header />
      <PlayerCard fullPlayer={fullPlayer} />
      <MonsterCard monster={monster} />

      <Button onClick={startFight}> fight </Button>
    </React.Fragment>
  );
}

// index.tsx
export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await prisma.player?.findFirst({
      where: { userId: session?.userId },
    });

    const fullPlayer: IFullPlayer = {
      player: player,
      equipement: {
        weapon: await prisma.player
          ?.findFirst({
            where: { userId: session?.userId },
          })
          .inventory()
          .weapon(),
      },
    };

    const monster = await prisma.monster?.findFirst();

    return { props: { fullPlayer, monster } };
  } else {
    return { props: {} };
  }
};

export default HomePage;

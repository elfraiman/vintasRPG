import { Monster } from "@prisma/client";
import { message, Button, Row, Col } from "antd";
import { getSession, useSession } from "next-auth/client";
import React, { useState } from "react";
import Header from "../components/Header";
import MonsterCard from "../components/MonsterCard";
import PlayerCard, { IFullPlayer } from "../components/PlayerCard";
import prisma from "../lib/prisma";

export enum STATSMULTIPLIERS {
  STR = 0.255,
  DEX = 0.125,
}

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

  const savePlayer = async () => {
    await fetch(`http://localhost:3000/api/player/${fullPlayer.player.id}`, {
      method: "POST",
      body: JSON.stringify(fullPlayer.player),
    }).then((response) => {
      console.log(response)
      message.info(
        `You killed ${monster.name} and gained ${monster.experience} experience`
      );
    })
  };

  const playerWin = () => {
    // Player Won
    // Add experience and rewards to player for killing monster
    //
    setFullPlayer({
      equipement: fullPlayer.equipement,
      player: {
        ...fullPlayer.player,
        experience: (fullPlayer.player.experience += monster.experience),
      },
    });

    // If level  up
    if (fullPlayer.player.experience >= fullPlayer.player.experienceToLevelUp) {
      setFullPlayer({
        equipement: fullPlayer.equipement,
        player: {
          ...fullPlayer.player,
          level: (fullPlayer.player.level += 1),
        },
      });
    }


    // Saves the local obj to the backend;
    savePlayer();
  };

  const doPlayerAttack = () => {
    const attackSpeed = 2000;
    const calculatedTotalDamage =
      fullPlayer.player.strength * STATSMULTIPLIERS.STR +
      fullPlayer.equipement.weapon.maxDamage;
    const calculatedMinimumDamage =
      fullPlayer.player.strength * STATSMULTIPLIERS.STR +
      fullPlayer.equipement.weapon.minDamage;

    const upcomingHit = Math.floor(
      Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
        calculatedMinimumDamage
    );

    const fight = setInterval(() => {
      if (monster.health > 0 && fullPlayer.player.health > 0) {
        setMonster({
          ...monster,
          health: (monster.health -= upcomingHit),
        });
      } else {
        playerWin();
        setMonster({
          ...monster,
          health: monster.maxHealth,
        });
        clearInterval(fight);
      }
    }, attackSpeed);
  };

  const doMonsterAttack = () => {
    const attackSpeed = 2000;
    const upcomingHit = Math.floor(
      Math.random() * (monster.maxDamage - monster.minDamage) +
        monster.minDamage
    );

    const fight = setInterval(() => {
      if (fullPlayer.player.health > 0 && monster.health > 0) {
        setFullPlayer({
          equipement: fullPlayer.equipement,
          player: {
            ...fullPlayer.player,
            health: (fullPlayer.player.health -= upcomingHit),
          },
        });
      } else if (fullPlayer.player.health <= 0) {
        setFullPlayer({
          equipement: fullPlayer.equipement,
          player: {
            ...fullPlayer.player,
            health: (fullPlayer.player.health = 0),
          },
        });
        savePlayer();
        clearInterval(fight);
      }
    }, attackSpeed);
  };

  const startFight = () => {
    if (fullPlayer.player.health > 0) {
      doPlayerAttack();
      doMonsterAttack();
    }
  };

  return (
    <React.Fragment>
      <Header />
      <Row>
        <Col span={12}>
          <PlayerCard fullPlayer={fullPlayer} />
        </Col>
        <Col span={12}>
          <MonsterCard monster={monster} />
        </Col>
      </Row>

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

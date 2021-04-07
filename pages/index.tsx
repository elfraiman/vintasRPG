import { Monster } from '@prisma/client';
import { Button, Col, Layout, message, Row } from 'antd';
import { getSession, useSession } from 'next-auth/client';
import React, { useState } from 'react';
import MonsterCard from '../components/MonsterCard';
import PlayerCard, { IFullPlayer } from '../components/PlayerCard';
import prisma from '../lib/prisma';

export enum STATSMULTIPLIERS {
  STR = 0.255,
  DEX = 0.125,
}

function HomePage(props) {
  const [session, loading] = useSession();
  const [fullPlayer, setFullPlayer] = useState<IFullPlayer>(props.fullPlayer);
  const [monster, setMonster] = useState<Monster>(props.monster);
  const [playerHit, setPlayerHit] = useState<number>(null);
  const [monsterHit, setMonsterHit] = useState<number>(null);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  const savePlayer = async () => {
    await fetch(`http://localhost:3000/api/player/${fullPlayer.player.id}`, {
      method: 'POST',
      body: JSON.stringify(fullPlayer.player),
    }).then((response) => {
      console.log(response);
    });
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

    setPlayerHit(null);
    setMonsterHit(null);
    // Saves the local obj to the backend;
    savePlayer();
    message.info(
      `You killed the ${monster.name} and gained ${monster.experience} experience`
    );
  };

  const playerLose = () => {
    const lostExp =  Math.round((fullPlayer.player.experience /
      fullPlayer.player.experienceToLevelUp) *
    100);
    // Player lost
    // penelty
    setFullPlayer({
      equipement: fullPlayer.equipement,
      player: {
        ...fullPlayer.player,
        experience: (fullPlayer.player.experience -= lostExp)
      },
    });

    setPlayerHit(null);
    setMonsterHit(null);
    // Saves the local obj to the backend;
    savePlayer();
    message.error(
      `You died to the ${monster.name} and lost ${monster.experience} experience`
    );
  };

  const doPlayerAttack = () => {
    const attackSpeed = 2000;

    const fight = setInterval(() => {
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
      if (monster.health > 0 && fullPlayer.player.health > 0) {
        setPlayerHit(upcomingHit);
        setMonster({
          ...monster,
          health: (monster.health -= upcomingHit),
        });
      } else if (monster.health <= 0) {
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

    const fight = setInterval(() => {
      const upcomingHit = Math.floor(
        Math.random() * (monster.maxDamage - monster.minDamage) +
          monster.minDamage
      );

      if (fullPlayer.player.health > 0 && monster.health > 0) {
        setMonsterHit(upcomingHit);
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
        playerLose();
        clearInterval(fight);
      }
    }, attackSpeed);
  };

  const startFight = () => {
    if (fullPlayer.player.health > 0) {
      doPlayerAttack();
      doMonsterAttack();
    } else {
      message.error('You are dead');
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col span={12}>
          <PlayerCard fullPlayer={fullPlayer} hit={monsterHit} />
        </Col>
        <Col span={12}>
          <MonsterCard monster={monster} hit={playerHit} />
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

    const monster = await prisma.monster?.findFirst({
      where: { id: 10 },
    });

    return { props: { fullPlayer, monster } };
  } else {
    return { props: {} };
  }
};

export default HomePage;

import { Monster } from "@prisma/client";
import { Button, Card, Col, message, Row } from "antd";
import { cloneDeep } from "lodash";
import { getSession, useSession } from "next-auth/client";
import React, { useEffect, useRef, useState } from "react";
import InventoryCard from "../components/InventoryCard";
import MonsterCard from "../components/MonsterCard";
import PlayerCard from "../components/PlayerCard";
import SiteLayout from "../components/SiteLayout";
import { getPlayer, IPlayer } from "../lib/functions";
import prisma from "../lib/prisma";
import Image from "next/image";

export enum WEAPONTYPES {
  MAINHAND = "mainhand",
  OFFHAND = "offhand",
  TWOHANDED = "twohanded",
}
export enum STATSMULTIPLIERS {
  STR = 0.255,
  DEX = 0.125,
  CON = 0.825,
}

export enum MULTIPLIERS {
  LEVELUPEXPMULTIPLIER = 1.85,
}

interface IFightPageProps {
  player: IPlayer;
  monster: Monster;
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    const player = await getPlayer(session.userid);

    const monster = await prisma.monster?.findFirst({
      where: { id: parseInt(context.query.monsterId, 10) },
    });

    return { props: { player, monster } };
  } else {
    return { props: {} };
  }
};

function FightPage({ player, monster }: IFightPageProps) {
  const [session, loading] = useSession();
  const [playerInState, setPlayerInState] = useState<IPlayer>(
    cloneDeep(player)
  );
  const [monsterInState, setMonster] = useState<Monster>(cloneDeep(monster));
  const [battleLog, setBattleLog] = useState<any>([]);
  const [fightStarted, setFightStarted] = useState<boolean>(false);
  const [globalCD, setGlobalCD] = useState<boolean>(false);
  const [playerHit, setPlayerHit] = useState({ dmg: 0, slot: "" });
  const [playerTwohandInterval, setPlayerTwoHandInterval] = useState<any>();
  const [playerMainhandInterval, setPlayerMainHandInterval] = useState<any>();
  const [playerOffhandInterval, setPlayerOffhandInterval] = useState<any>();
  const [monsterInterval, setMonsterInterval] = useState<any>();
  const [monsterHit, setMonsterHit] = useState<number>(null);

  let playerMainhand = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.MAINHAND
  )?.item;
  let playerOffhand = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.OFFHAND
  )?.item;
  const playerTwoHanded = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.TWOHANDED
  )?.item;
  const playerDuelWielding = playerMainhand && playerOffhand;

  // Dummy ref to keep scrolling in the combat log
  //
  let dummyRef = useRef(null);

  if (!loading && !session)
    return (
      <React.Fragment>
        <p>Access Denied</p>
      </React.Fragment>
    );

  // Save the local state player to the back-end
  //
  const savePlayer = async () => {
    console.log(playerInState);
    await fetch(`http://localhost:3000/api/player/${player.id}`, {
      method: "POST",
      body: JSON.stringify(playerInState),
    }).then((response) => {
      // console.log(response);
    });
  };

  // 1 of 3 chance to loot gold
  // calculate gold loot with multiplier
  //
  const lootGoldRoll = () => {
    const dropGold = Math.floor(Math.random() * 2);
    const getMonsterGoldDrop = Math.round(
      Math.floor(Math.random() * monster.goldDrop + 1) *
        monster.currencyMultiplier
    );

    if (dropGold === 1) {
      return getMonsterGoldDrop;
    }
  };

  //  Levelup player
  //
  const levelUpPlayer = () => {
    // Calculate hp gained from leveling using
    // con multiplier
    //
    const healthToGain =
      Math.round(
        playerInState.constitution * STATSMULTIPLIERS.CON +
          playerInState.maxHealth * 1.1
      ) - playerInState.maxHealth;

    // Calculate next xp to level
    const nextExpToLevelUp = Math.floor(
      (playerInState.experienceToLevelUp *= MULTIPLIERS.LEVELUPEXPMULTIPLIER)
    );

    // Add level, calculate next xp to level, set xp to 0, calculate new max health and
    // set current health to maxHealth
    setPlayerInState({
      ...playerInState,
      level: (playerInState.level += 1),
      experienceToLevelUp: (playerInState.experienceToLevelUp +=
        nextExpToLevelUp - playerInState.experienceToLevelUp),
      experience: (playerInState.experience = 0),
      maxHealth: (playerInState.maxHealth += healthToGain),
      health: (playerInState.health +=
        playerInState.maxHealth - playerInState.health),
    });

    message.success(`You have leveled up! you gained ${healthToGain} health!`);
    savePlayer();
  };

  // Handle player winning
  const playerWin = () => {
    // Saves the local obj to the backend;
    const gold = lootGoldRoll();
    // Player Won
    // Add experience and rewards to player for killing monster
    //
    setPlayerInState({
      ...playerInState,
      experience: (playerInState.experience += monsterInState.experience),
      gold: gold ? (playerInState.gold += gold) : playerInState.gold,
    });
    message.config({
      duration: 2,
      maxCount: 3,
    });

    if (gold) {
      message.success({
        content: (
          <span>
            +<b style={{ color: "#ffd700" }}>{gold}</b>
            <Image src="/assets/icons/gold-coins.svg" width={30} height={20} />
          </span>
        ),
        icon: <React.Fragment></React.Fragment>,
      });
    }

    setFightStarted(false);
    setBattleLog([
      ...battleLog,
      <span>
        You have killed the {monsterInState.name} and gained{" "}
        <span style={{ color: "#1890ff" }}>{monsterInState.experience}</span>{" "}
        experience{" "}
        {gold ? (
          <>
            {" "}
            and <span style={{ color: "#ffd700" }}> {gold} </span> gold.
          </>
        ) : (
          <></>
        )}
      </span>,
    ]);

    // If level  up
    if (playerInState.experience >= playerInState.experienceToLevelUp) {
      levelUpPlayer();
      // we return here because we save the player in the levelup
      return;
    }

    savePlayer();
  };

  // Handle  player lose
  //
  const playerLose = () => {
    const lostExp = Math.round(
      (playerInState.experience / playerInState.experienceToLevelUp) * 100
    );

    if (playerInState.experience > 0) {
      // Player lost
      // penelty
      setPlayerInState({
        ...playerInState,
        experience: (playerInState.experience -= lostExp),
      });
    } else {
      setPlayerInState({
        ...playerInState,
        experience: (playerInState.experience = 0),
      });
    }

    setFightStarted(false);

    setBattleLog([
      ...battleLog,
      <span>
        You <b>died</b> to {monsterInState.name} and lost{" "}
        <span style={{ color: "#1890ff" }}>{monsterInState.experience}</span>{" "}
        experience
      </span>,
    ]);
    message.error(
      `You died to the ${monsterInState.name} and lost ${monsterInState.experience} experience`
    );

    // Saves the local obj to the backend;
    savePlayer();
  };

  // Handle the combat log
  const handleBattleLog = (
    playerOrMonster: "player" | "monster",
    dmg: number,
    weaponName?
  ) => {
    if (playerOrMonster === "player") {
      // Text for display
      //
      setBattleLog([
        ...battleLog,
        <span>
          Your {weaponName} hit {monsterInState.name} for
          <span style={{ color: "green" }}> {dmg}</span> damage.
        </span>,
      ]);
    } else if (playerOrMonster === "monster") {
      setBattleLog([
        ...battleLog,
        <span>
          The {monsterInState.name} hit you for
          {<span style={{ color: "red" }}> {dmg}</span>} damage.
        </span>,
      ]);
    }
  };

  // Always keep the combat log scrolling
  useEffect(() => {
    dummyRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }, [battleLog]);

  // Handle setting intervals to state;
  //
  const doPlayerAttack = () => {
    if (playerDuelWielding) {
      // Main hand hit
      //

      setPlayerMainHandInterval(
        setInterval(() => {
          if (globalCD) {
            return;
          }
          // If player is duel wielding we cant to create
          // more hits.
          //
          const calculatedTotalDamage =
            playerInState.strength * STATSMULTIPLIERS.STR +
            playerMainhand.maxDamage;
          const calculatedMinimumDamage =
            playerInState.strength * STATSMULTIPLIERS.STR +
            playerMainhand.minDamage;

          const upcomingHit = Math.floor(
            Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
              calculatedMinimumDamage
          );

          setPlayerHit({ dmg: upcomingHit, slot: "mainhand" });

          if (monsterInState.health > 0 && playerInState.health > 0) {
            // Text for display
            //
            setBattleLog([
              ...battleLog,
              <span>
                Your {playerMainhand.name} hit {monsterInState.name} for
                <span style={{ color: "green" }}> {upcomingHit}</span> damage.
              </span>,
            ]);
          }
        }, playerMainhand.attackSpeed * 1000)
      );

      setPlayerOffhandInterval(
        setInterval(() => {
          if (globalCD) {
            return;
          }
          // If player is duel wielding we cant to create
          // more hits.
          //
          const calculatedTotalDamage =
            playerInState.strength * STATSMULTIPLIERS.STR +
            playerOffhandInterval.maxDamage;
          const calculatedMinimumDamage =
            playerInState.strength * STATSMULTIPLIERS.STR +
            playerOffhandInterval.minDamage;

          const upcomingHit = Math.floor(
            Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
              calculatedMinimumDamage
          );

          setPlayerHit({ dmg: upcomingHit, slot: "offhand" });

          if (monsterInState.health > 0 && playerInState.health > 0) {
            // Text for display
            //
            setBattleLog([
              ...battleLog,
              <span>
                Your {playerOffhandInterval.name} hit {monsterInState.name} for
                <span style={{ color: "green" }}> {upcomingHit}</span> damage.
              </span>,
            ]);
          }
        }, playerOffhandInterval.attackSpeed * 1000)
      );
    } else {
      // 2 handed hit
      //
      setPlayerTwoHandInterval(
        setInterval(() => {
          // If player is duel wielding we cant to create
          // more hits.
          //
          const calculatedTotalDamage =
            playerInState.strength * STATSMULTIPLIERS.STR +
            playerTwoHanded.maxDamage;
          const calculatedMinimumDamage =
            playerInState.strength * STATSMULTIPLIERS.STR +
            playerTwoHanded.minDamage;

          const upcomingHit = Math.floor(
            Math.random() * (calculatedTotalDamage - calculatedMinimumDamage) +
              calculatedMinimumDamage
          );

          setPlayerHit({ dmg: upcomingHit, slot: "twohanded" });
        }, playerTwoHanded.attackSpeed * 1000)
      );
    }
  };

  // PlayerAttack use effect
  //
  useEffect(() => {
    if (globalCD) {
      return;
    }

    if (monsterInState.health > 0 && playerInState.health > 0) {
      // Set monster stats after hit
      setMonster({
        ...monsterInState,
        health: (monsterInState.health -= playerHit.dmg),
      });

      if (playerDuelWielding) {
        handleBattleLog(
          "player",
          playerHit.dmg,
          playerHit.slot === "mainhand"
            ? playerMainhand.name
            : playerOffhand.name
        );
      } else {
        handleBattleLog("player", playerHit.dmg, playerTwoHanded.name);
      }
    }

    if (monsterInState.health <= 0) {
      playerWin();
      clearAllIntervals();
    }
  }, [playerHit]);

  const clearAllIntervals = () => {
    clearInterval(playerTwohandInterval);
    clearInterval(playerMainhandInterval);
    clearInterval(playerOffhandInterval);
    clearInterval(monsterInterval);
  };
  const doMonsterAttack = () => {
    setMonsterInterval(
      setInterval(() => {
        const upcomingHit = Math.floor(
          Math.random() *
            (monsterInState.maxDamage - monsterInState.minDamage) +
            monsterInState.minDamage
        );

        setMonsterHit(upcomingHit);
      }, monsterInState.attackSpeed * 1000)
    );
  };

  //  Monster attack useEffect
  //
  useEffect(() => {
    if (playerInState.health <= 0) {
      setPlayerInState({
        ...playerInState,
        health: (playerInState.health = 0),
      });

      playerLose();
      clearAllIntervals();
    }

    if (playerInState.health > 0 && monsterInState.health > 0) {
      handleBattleLog("monster", monsterHit);
      setPlayerInState({
        ...playerInState,
        health: (playerInState.health -= monsterHit),
      });
    }
  }, [monsterHit]);

  // Start fight again
  //
  const startReFight = () => {
    setMonster({
      ...monsterInState,
      health: (monsterInState.health +=
        monsterInState.maxHealth - monsterInState.health),
    });

    startFight();
  };

  // Start the fight
  const startFight = () => {
    setBattleLog([]);
    if (playerInState.health > 0 && monsterInState.health > 0) {
      doPlayerAttack();
      doMonsterAttack();
      setFightStarted(true);
      return;
    } else if (monsterInState.health < 0) {
      message.error("You can't kill what is already dead.");
    } else {
      message.error("You are dead.");
    }
    setFightStarted(false);
  };

  // Save player on destroy and start fight on enter
  //
  useEffect(() => {
    startFight();
    return () => {
      savePlayer();
      clearAllIntervals();
    };
  }, []);

  const handleGlobalCD = () => {
    setTimeout(() => {
      console.log("globalCD OFF");
      setGlobalCD(false);
    }, 1500);
  };

  // Handlesglobal cd on globalCD change
  //
  useEffect(() => {
    handleGlobalCD();
  }, [globalCD]);

  return (
    <SiteLayout player={playerInState}>
      <Row>
        <h2>Combat</h2>
      </Row>

      <div
        style={{
          display: "grid",
          gridTemplate: "auto / 1fr 1fr 1fr",
          gridGap: 16,
        }}
      >
        <PlayerCard player={playerInState} />

        <Card
          style={{
            height: 350,
            width: "100%",
            overflowY: "hidden",
            padding: 16,
          }}
        >
          {battleLog.map((val, i) => (
            <Row key={i}>{val}</Row>
          ))}

          <div ref={dummyRef}></div>
        </Card>

        <MonsterCard monster={monsterInState} />
      </div>

      <Row style={{ marginTop: 16 }}>
        {fightStarted ? (
          <Button>Run</Button>
        ) : (
          <Button onClick={startReFight}>Fight Again</Button>
        )}
      </Row>
      <Row>
        <Col>
          <InventoryCard
            player={playerInState}
            setPlayer={setPlayerInState}
            setGlobalCD={setGlobalCD}
            globalCD={globalCD}
          />
        </Col>
      </Row>
    </SiteLayout>
  );
}

export default FightPage;

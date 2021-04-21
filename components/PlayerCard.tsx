import { Player } from "@prisma/client";
import { Card, Progress } from "antd";
import { useSession } from "next-auth/client";
import React, { useEffect, useState } from "react";
import { IPlayer } from "../lib/functions";
import { WEAPONTYPES } from "../pages/fight";
import PowEffect from "./PowEffect";

interface IPlayerCardProps {
  player: IPlayer;
  incomingDamage?: number;
  fightStarted?: any;
}

const PlayerCard = ({
  player,
  incomingDamage,
  fightStarted,
}: IPlayerCardProps) => {
  const [session, loading] = useSession();
  const [mainInterval, setMainInterval] = useState(0);
  const [offInterval, setOffInterval] = useState(0);
  const [twoHandedInterval, setTwoHandedInterval] = useState(0);
  const [reTrigger, setRetrigger] = useState(false);

  let playerMainhand = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.MAINHAND
  )?.item;
  let playerOffhand = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.OFFHAND
  )?.item;
  const playerTwoHanded = player.equipement.find(
    (equip) => equip.slot.type === WEAPONTYPES.TWOHANDED
  )?.item;

  if (!player) return null;
  if (!loading && !session) return null;

  const calculatePercentHealth = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return Math.round(result);
  };

  const calculateExperience = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return Math.round(result);
  };

  // Bajesus this needs better code...
  //
  const returnValueForAttackProgress = (
    time: number,
    main?: boolean,
    off?: boolean,
    twoHanded?: boolean
  ) => {
    // Taking the time from the weapon attackspeed
    //
    let duration = time * 1000;
    // current time to create progress
    //
    let currentTime = new Date().getTime();

    // Trigger a re-render to trigger the useState so we call this function again every attackspeed time
    //
    const reTrig = setInterval(() => {
      setRetrigger(true);
    }, time * 1000);

    const interval = setInterval(() => {
      let diff = Math.round(new Date().getTime() - currentTime);
      let val = Math.round((diff / duration) * 100);
    
      if (main) {
        setMainInterval((val = val > 100 ? 100 : val));
      } else if (off) {
        setOffInterval((val = val > 100 ? 100 : val));
      } else {
        setTwoHandedInterval((val = val > 100 ? 100 : val));
      }

      // If we reach 100
      if (diff >= duration) {
        clearInterval(interval);
        setRetrigger(!reTrigger);
        clearInterval(reTrig);
      }
    }, 100);

    if (!fightStarted) {
      clearInterval(reTrig);
      clearInterval(interval);
    }
  };

  useEffect(() => {
    if (playerTwoHanded) {
      returnValueForAttackProgress(
        playerTwoHanded.attackSpeed,
        false,
        false,
        true
      );
    } else {
      returnValueForAttackProgress(playerOffhand.attackSpeed, false, true);
      returnValueForAttackProgress(playerMainhand.attackSpeed, true);
    }
  }, [reTrigger, fightStarted]);

  const playerWeaponInfo = () => {
    let text;

    if (playerTwoHanded) {
      text = (
        <div>
          {playerTwoHanded.name} ({playerTwoHanded.minDamage}-
          {playerTwoHanded.maxDamage})
          <Progress percent={twoHandedInterval} showInfo={false} strokeColor="lightgrey" />
        </div>
      );
    } else {
      text = (
        <div>
          Mainhand: {playerMainhand.name} ({playerMainhand.minDamage}-
          {playerMainhand.maxDamage})
          <br />
          <Progress percent={mainInterval} showInfo={false} />
          <br />
          Offhand: {playerOffhand.name} ({playerOffhand.minDamage}-
          {playerOffhand.maxDamage})
          <br />
          <Progress percent={offInterval} showInfo={false} />
        </div>
      );
    }

    return text;
  };

  return (
    <React.Fragment>
      <Card
        title={player.name}
        style={{
          maxWidth: 450,
          minHeight: 350,
          display: "flex",
          flexDirection: "column",
        }}
        loading={loading}
      >
        <PowEffect incomingDamage={incomingDamage} />

        <p> Level: {player.level}</p>
        <p style={{ marginBottom: 0 }}>Experience:</p>
        <Progress
          percent={calculateExperience(
            player.experience,
            player.experienceToLevelUp
          )}
          type="line"
          showInfo={true}
        />
        <p style={{ marginBottom: 0 }}>
          Health: {player.health} / {player.maxHealth}
        </p>
        <Progress
          percent={calculatePercentHealth(player.health, player.maxHealth)}
          type="line"
          showInfo={false}
          status={
            calculatePercentHealth(player.health, player.maxHealth) <= 30
              ? "exception"
              : "success"
          }
        />
        <p>{playerWeaponInfo()}</p>
      </Card>
    </React.Fragment>
  );
};

export default PlayerCard;

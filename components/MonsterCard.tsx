import { Monster, Player, Weapon } from "@prisma/client";
import { Button, Card, Progress } from "antd";
import { useSession } from "next-auth/client";
import React, { useState } from "react";
import { useRouter } from 'next/router'

interface IMonsterCardProps {
  monster: Monster;
  hit?: number;
  showAttack?: boolean;
}

const MonsterCard = ({ monster, hit, showAttack }: IMonsterCardProps) => {
  const router = useRouter();
  const [session, loading] = useSession();

  if (!monster) return null;
  if (!loading && !session) return null;

  const calculatePercentHealth = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return result;
  };

  const handleAttack = () => {
    router.push({pathname: "/fight", query: {monsterId: monster.id}})
  }

  return (
    <React.Fragment>
      <Card
        title={monster.name}
        style={{
          width: 300,
          height: 300,
          display: "flex",
          flexDirection: "column",
        }}
        loading={loading}
      >
        <p> Level: {monster.level}</p>
        <p style={{ marginBottom: 0 }}>
          Health: {monster.health} / {monster.maxHealth}
        </p>
        {monster.health > 0 ? (
          <div>
            <Progress
              percent={calculatePercentHealth(
                monster.health,
                monster.maxHealth
              )}
              type="line"
              showInfo={false}
              status={
                calculatePercentHealth(monster.health, monster.maxHealth) <= 30
                  ? "exception"
                  : "success"
              }
            />
            {hit}
          </div>
        ) : (
          <p>Dead</p>
        )}
        {showAttack ? <Button onClick={handleAttack}>Attack</Button> : <></>}
      </Card>
    </React.Fragment>
  );
};

export default MonsterCard;

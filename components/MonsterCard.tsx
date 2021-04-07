import { Monster, Player, Weapon } from "@prisma/client";
import { Card, Progress } from "antd";
import { useSession } from "next-auth/client";
import React from "react";

interface IMonsterCardProps {
  monster: Monster;
}

const MonsterCard = ({ monster }: IMonsterCardProps) => {
  const [session, loading] = useSession();

  if (!loading && !session) return null;

  const calculatePercentHealth = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return result;
  };

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
             <Progress
             percent={calculatePercentHealth(monster.health, monster.maxHealth)}
             type="line"
             showInfo={false}
             status={calculatePercentHealth(monster.health, monster.maxHealth) <= 30 ? "exception" : "success"}
           />
        ) : (
            <p>Dead</p>
        )}
       
      </Card>
    </React.Fragment>
  );
};

export default MonsterCard;

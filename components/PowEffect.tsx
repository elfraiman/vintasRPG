import Image from "next/image";
import React, { useEffect, useState } from "react";

const PowEffect = ({ incomingDamage }) => {
  const [arrayOfDamage, setArrayOfDamage] = useState([]);

  useEffect(() => {
    arrayOfDamage.push(incomingDamage);
    setArrayOfDamage(arrayOfDamage);

    setTimeout(() => {
      arrayOfDamage.pop();

      setArrayOfDamage(arrayOfDamage);

      if (arrayOfDamage.length <= 0) {
        setArrayOfDamage([]);
      }
    }, 1000);

    return () => {
      setArrayOfDamage([]);
    };
  }, [incomingDamage]);

  return (
    <React.Fragment>
      {arrayOfDamage.length > 0 ? (
        <React.Fragment>
          {arrayOfDamage.map((dmg, index) => {
            return (
              <div className="pow" key={index} style={{ top: 0 + index * 45 }}>
                <Image
                  src="/assets/effects/pow.svg"
                  width={"100%"}
                  height={120}
                  className="img"
                />

                <h2 className="damage">{dmg}</h2>

                <style jsx>{`
                  .pow {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    margin-left: auto;
                    left: 0;
                    margin-right: auto;
                    right: 0;
                  }
                  .damage {
                    z-index: 101;
                    position: absolute;
                    color: white;
                    text-align: center;
                    font-size: 26px;
                  }
                `}</style>
              </div>
            );
          })}
        </React.Fragment>
      ) : (
        <></>
      )}
    </React.Fragment>
  );
};

export default PowEffect;

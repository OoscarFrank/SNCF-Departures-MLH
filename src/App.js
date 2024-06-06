import React, { useEffect, useState } from "react";
import style from "./App.module.css";

import { ReactComponent as Walk } from "./assets/walk.svg";
import { ReactComponent as Bike } from "./assets/bike.svg";
import { ReactComponent as Car } from "./assets/car.svg";

import KM0Logo from "./assets/kmLogo.png";
import SNCFLogo from "./assets/sncfLogo.png";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

function IconAndText({ icon, text }) {
  return (
    <div className={style.iconAndTextContainer}>
      <div className={style.itemForIcons}>{icon}</div>
      <span className={style.textTime}>{text}</span>
    </div>
  );
}

function Header() {
  const now = new Date();
  const formattedDate = format(now, "dd/MM/yyyy - HH:mm", { locale: fr });

  return (
    <div className={style.headerContainer}>
      <div className={style.partHeader}>
        <span className={style.headerTitle}>
          Départ des trains - Gare de Mulhouse
        </span>

        <div className={style.headerSeperator} />

        <div className={style.iconsContainer}>
          <IconAndText
            icon={<Walk className={style.iconStyle} />}
            text="18 min"
          />
          <IconAndText
            icon={<Bike className={style.iconStyle} />}
            text="8 min"
          />
          <IconAndText
            icon={<Car className={style.iconStyle} />}
            text="4 min"
          />
        </div>
      </div>

      <div className={style.partHeader}>
        <span className={style.headerTitle}>{formattedDate}</span>

        <div className={style.headerSeperator} />

        <div className={style.logosContainer}>
          <img src={KM0Logo} alt="KM0 logo" className={style.logoStyle} />
          <span className={style.textLogoSeparator}>x</span>
          <img src={SNCFLogo} alt="SNCF logo" className={style.logoStyle} />
        </div>
      </div>
    </div>
  );
}

function OneLineItem({
  departTime,
  transportMode,
  transportNumber,
  destination,
  index,
}) {
  const containerClassName =
    index % 2 === 0 ? style.itemContainer : style.itemContainerImpair;

  return (
    <div className={containerClassName}>
      <div className={style.itemMode}>
        <span className={style.transportMode}>{transportMode}</span>
        <span className={style.transportNumber}>N°{transportNumber}</span>
      </div>
      <div className={style.itemTime}>{departTime}</div>
      <div className={style.itemDirection}>{destination.split("(")[0]}</div>
    </div>
  );
}

function App() {
  const [departures, setDepartures] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://api.navitia.io/v1/coverage/sncf/stop_areas/stop_area:SNCF:87182063/departures",
        {
          headers: new Headers({
            Authorization: KEY,
          }),
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setDepartures(data.departures || []);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  function reloadPageEveryMinute() {
    fetchData();
    setInterval(function () {
      fetchData();
    }, 60000);
  }

  useEffect(() => {
    reloadPageEveryMinute();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    const hours = dateTimeStr.substring(9, 11);
    const minutes = dateTimeStr.substring(11, 13);

    return `${hours}:${minutes}`;
  };

  return (
    <div className={style.mainContainer}>
      <Header />
      {/* <div className={style.subHeaderContainer}>
        <span>Heure</span>
        <span>Mode</span>
        <span>Direction</span>
      </div> */}
      <div className={style.bodyContainer}>
        {departures.map((departure, index) => (
          <OneLineItem
            key={index}
            departTime={formatDateTime(
              departure.stop_date_time.departure_date_time
            )}
            transportMode={departure.display_informations.commercial_mode}
            transportNumber={departure.display_informations.headsign}
            destination={departure.display_informations.direction}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

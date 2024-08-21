import { Stack } from "@mui/material";

import { places } from "../../consts";
import calendarIcon from "../../images/calender.svg";
import eventIcon from "../../images/event.svg";
import personIcon from "../../images/person.svg";
import teamIcon from "../../images/team.svg";
import { useAppContext } from "../AppContext";

import Search from "./Search";
import Selector from "./Selector";

const Filters = () => {
  const {
    data,
    setYear,
    setEvent,
    setPerson,
    setTeam,
    setIsOpenMenu,
    desktop,
    events,
    people,
    teams,
  } = useAppContext();

  function formatOptions(a) {
    return a.map((x) => {
      return { data: x, label: x };
    });
  }

  function formatYearOption(a) {
    return a.map(({ year, place }) => {
      return { data: year, label: year + " " + place };
    });
  }

  function selectItem(item, func) {
    if (item === "clear") {
      setYear(data.year);
    } else {
      func(item.data);
    }
  }

  return (
    <Stack direction={desktop ? "row" : "column"} spacing={desktop ? 1 : 0.5}>
      {!desktop && (
        <Selector
          options={formatYearOption(places)}
          leftIcon={calendarIcon}
          name={"Select year"}
          onChange={(selectedItem) => {
            const year = selectedItem.data;
            setYear(year);
          }}
          value={data.year}
          disableClearable
        />
      )}
      <Selector
        options={formatOptions(events)}
        name={"Select event"}
        leftIcon={eventIcon}
        onChange={(selectedItem) => {
          selectItem(selectedItem, setEvent);
        }}
        value={data.event}
      />
      <Selector
        options={formatOptions(teams)}
        name={"Select team"}
        leftIcon={teamIcon}
        onChange={(selectedItem) => {
          selectItem(selectedItem, setTeam);
        }}
        value={data.team}
      />
      <Selector
        options={formatOptions(people)}
        name={"Select person"}
        leftIcon={personIcon}
        onChange={(selectedItem) => {
          selectItem(selectedItem, setPerson);
        }}
        value={data.person}
      />
      <Search setIsOpenMenu={setIsOpenMenu} />
    </Stack>
  );
};

export default Filters;

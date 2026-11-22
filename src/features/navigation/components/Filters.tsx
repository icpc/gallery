import { Stack } from "@mui/material";
import type { FC } from "react";
import calendarIcon from "@/assets/icons/calendar.svg";
import eventIcon from "@/assets/icons/event.svg";
import personIcon from "@/assets/icons/person.svg";
import teamIcon from "@/assets/icons/team.svg";
import { places } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import type { Place } from "@/types/gallery";
import { SearchBar } from "./SearchBar";
import { Selector } from "./Selector";

function formatOptions(items: string[]) {
  return items.map((item) => ({ data: item, label: item }));
}

function formatYearOptions(items: Place[]) {
  return items.map(({ year, place }) => ({
    data: year,
    label: `${year} ${place}`,
  }));
}

export const Filters: FC = () => {
  const {
    data,
    setYear,
    setEvent,
    setPerson,
    setTeam,
    desktop,
    events,
    people,
    teams,
  } = useGallery();

  const selectItem = (
    item: string | "clear",
    setter: (val: string) => void,
  ) => {
    if (item === "clear") {
      if (data.year) {
        setYear(data.year);
      }
    } else {
      setter(item);
    }
  };

  return (
    <Stack direction={desktop ? "row" : "column"} spacing={desktop ? 1 : 0.5}>
      {!desktop && (
        <Selector
          options={formatYearOptions(places)}
          leftIcon={calendarIcon}
          name="Select year"
          onChange={(selectedYear) => {
            if (selectedYear !== "clear") {
              setYear(selectedYear);
            }
          }}
          value={data.year}
          disableClearable
        />
      )}
      <Selector
        options={formatOptions(events)}
        name="Select event"
        leftIcon={eventIcon}
        onChange={(selectedItem) => selectItem(selectedItem, setEvent)}
        value={data.event}
      />
      <Selector
        options={formatOptions(teams)}
        name="Select team"
        leftIcon={teamIcon}
        onChange={(selectedItem) => selectItem(selectedItem, setTeam)}
        value={data.team}
      />
      <Selector
        options={formatOptions(people)}
        name="Select person"
        leftIcon={personIcon}
        onChange={(selectedItem) => selectItem(selectedItem, setPerson)}
        value={data.person}
      />
      <SearchBar />
    </Stack>
  );
};

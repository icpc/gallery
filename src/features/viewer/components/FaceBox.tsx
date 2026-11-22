import styled from "@emotion/styled";
import type { FC } from "react";
import type { Person } from "@/types/gallery";

import "../styles/FaceBox.css";

interface RectangleProps {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const Rectangle = styled.fieldset<RectangleProps>((props) => ({
  position: "absolute",
  top: `${props.top * 100}%`,
  bottom: `${100 - props.bottom * 100 - 3}%`,
  left: `${props.left * 100}%`,
  right: `${100 - props.right * 100}%`,
  color: "var(--colorRectangle)",
  padding: "3px 6px",
  border: "var(--borderRectangle) solid 3px",
  transform: "rotateX(180deg)",
}));

interface FaceBoxProps {
  person: Person;
  hidden: boolean;
  setFace: (face: Person | null) => void;
}

export const FaceBox: FC<FaceBoxProps> = ({ person, hidden, setFace }) => {
  if (!person.position) {
    return null;
  }
  return (
    <Rectangle
      top={person.position.top}
      bottom={person.position.bottom}
      left={person.position.left}
      right={person.position.right}
      className={hidden ? "hidden" : ""}
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
    >
      <legend style={{ transform: "rotatex(180deg)" }}>{person.name}</legend>
    </Rectangle>
  );
};

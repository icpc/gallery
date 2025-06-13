import { FC } from "react";

import styled from "@emotion/styled";

import { Person } from "../../types";

import "../../styles/FaceDiv.css";
import "../../styles/theme-variables.css";

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
interface FaceDivProps {
  person: Person;
  hidden: boolean;
  setFace: (face: Person | null) => void;
}
const FaceDiv: FC<FaceDivProps> = ({ person, hidden, setFace }) => {
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

export default FaceDiv;

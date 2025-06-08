import { FC } from "react";

import TableOfContents from "./TableOfContents";

import "../styles/Sidebar.css";

const Sidebar: FC = () => {
  return (
    <div>
      <TableOfContents />
    </div>
  );
};

export default Sidebar;

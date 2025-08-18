import { RenderLeafProps } from "slate-react";
import { cn } from "../utils/tw/cn";

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return (
    <span
      {...attributes}
      className={cn("text-sm break-all align-middle", leaf.bold && "font-bold")}
    >
      {children}
    </span>
  );
};

export default Leaf;

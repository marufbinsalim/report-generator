import { Descendant } from "slate";
import { CustomTextType, TaskElementType } from "../../assets/editorTypes";

/**
 * Convert an array of TaskElementType to clean Markdown for a dev report
 */
export function parseTasksToMarkdown(tasks: Descendant[]): string {
  const convertableTasks = tasks as TaskElementType[];

  return convertableTasks
    .map((task) => {
      // Combine children text
      const lines = task.children.map((child: CustomTextType) => {
        let text = child.text;

        // Apply bold formatting
        if (child.bold) {
          text = `**${text}**`;
        }

        return text;
      });

      if (lines.length === 0) return "";

      // First line as heading (task title)
      const title = `## ${lines[0]}`;

      // Remaining lines as task description
      const descriptionLines = lines.slice(1);

      // Add checkbox for the task itself
      const checkbox = task.status === "DONE" ? "- [x] " : "- [ ] "; // For any other status

      // Format each description line with checkbox if non-empty
      const description = descriptionLines
        .map((line) => (line.trim() ? `${checkbox}${line}` : ""))
        .filter(Boolean)
        .join("\n");

      // Combine title + description
      return description ? `${title}\n${description}` : title;
    })
    .join("\n\n"); // separate tasks with empty line
}

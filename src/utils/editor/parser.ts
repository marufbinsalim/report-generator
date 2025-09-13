import { Descendant } from "slate";
import { CustomTextType, TaskElementType } from "../../assets/editorTypes";

/**
 * Convert an array of TaskElementType to a polished Markdown dev report
 */
export function parseTasksToMarkdown(tasks: Descendant[]): string {
  const convertableTasks = tasks as TaskElementType[];

  const now = new Date();
  const formattedDate = now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Header for the report
  let markdown = `# Development Task Report\n*Generated on: ${formattedDate}*\n\n`;

  convertableTasks.forEach((task, index) => {
    // Combine children text
    const lines = task.children.map((child: CustomTextType) => {
      let text = child.text;
      if (child.bold) text = `**${text}**`;
      return text;
    });

    const title = lines[0] ? `### ${lines[0]}` : "### Untitled Task";

    const descriptionLines = lines.slice(1);
    const checkbox = task.status === "DONE" ? "- [x]" : "- [ ]";

    const description = descriptionLines
      .map((line) => (line.trim() ? `${checkbox} ${line}` : ""))
      .filter(Boolean)
      .join("\n");

    // Status and type badges
    const statusBadge = `\n**Status:** \`${task.status.replace("_", " ")}\``;
    const typeBadge = `\n**Type:** \`${task.taskType.replace("_", " ")}\``;

    // Combine everything for this task
    markdown += `${title}\n${statusBadge} | ${typeBadge}\n\n`;
    if (description) markdown += `${description}\n\n`;

    // Divider between tasks, except after last one
    if (index < convertableTasks.length - 1) {
      markdown += `---\n\n`;
    }
  });

  return markdown;
}

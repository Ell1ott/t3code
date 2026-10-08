import { describe, expect, it } from "vite-plus/test";

import { openCodeToolProjectionKind, openCodeToolTurnItem } from "./OpenCodeToolItems.ts";

type Base = Parameters<typeof openCodeToolTurnItem>[0];
const base = {} as Base;

const directoryOutput = [
  "<path>/Users/dev/uwccr-school-scedules</path>",
  "<type>directory</type>",
  "<entries>",
  ".cursor/",
  ".cursorignore",
  ".git/",
  "",
  "(3 entries)",
  "</entries>",
].join("\n");

describe("openCodeToolItems", () => {
  it("projects directory listings as file search", () => {
    expect(openCodeToolProjectionKind("list")).toBe("file_search");
    expect(openCodeToolProjectionKind("read")).toBe("dynamic_tool");
  });

  it("titles a bare list by its target instead of echoing the path as a query", () => {
    const item = openCodeToolTurnItem(base, {
      name: "list",
      input: { path: "/Users/dev/uwccr-school-scedules" },
      output: "/Users/dev/uwccr-school-scedules/\n  README.md\n",
      completedMetadata: undefined,
    });
    expect(item.type).toBe("file_search");
    if (item.type !== "file_search") throw new Error("Expected file_search");
    expect(item.title).toBe("Searched in uwccr-school-scedules");
    expect(item.pattern).toBeUndefined();
    expect(item.results?.[0]?.fileName).toBe("/Users/dev/uwccr-school-scedules");
  });

  it("falls back to the first output line for a bare list with no input path", () => {
    const item = openCodeToolTurnItem(base, {
      name: "list",
      input: {},
      output: "/work/project/\n  README.md\n",
      completedMetadata: undefined,
    });
    expect(item.type).toBe("file_search");
    if (item.type !== "file_search") throw new Error("Expected file_search");
    expect(item.results?.[0]?.fileName).toBe("/work/project/");
  });

  it("stores directory reads without the XML envelope", () => {
    const item = openCodeToolTurnItem(base, {
      name: "read",
      input: { filePath: "/Users/dev/uwccr-school-scedules" },
      output: directoryOutput,
      completedMetadata: undefined,
    });
    expect(item.type).toBe("dynamic_tool");
    if (item.type !== "dynamic_tool") throw new Error("Expected dynamic_tool");
    expect(item.title).toBe("Read /Users/dev/uwccr-school-scedules");
    expect(item.output).toBe(".cursor/\n.cursorignore\n.git/\n\n(3 entries)");
    expect(item.output).not.toContain("<path>");
  });
});

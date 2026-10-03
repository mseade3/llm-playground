export type DotPermission = "browser" | "files" | "shell" | "memory";

export type SpecialistDot = {
  id: string;
  name: string;
  role: string;
  instructions: string;
  tone: "coral" | "violet" | "sky" | "teal" | "amber";
  icon: "scout" | "quill" | "relay" | "builder";
  permissions: DotPermission[];
  defaultSpaceId: string;
  lastActivity?: string;
  lastActivityAt?: string;
};

export type SpacePage = {
  id: string;
  spaceId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  savedByDotId?: string;
  editedBy?: string;
};

export type Space = {
  id: string;
  name: string;
  emoji?: string;
};

export type ComputerFile = {
  path: string;
  sizeLabel: string;
  content: string;
  updatedAt: string;
};

export type TerminalLine = {
  id: string;
  command: string;
  output: string;
  createdAt: string;
};

export type InlineAction =
  | {
      id: string;
      kind: "browser";
      url: string;
      title: string;
      live?: boolean;
      preview?: string;
    }
  | {
      id: string;
      kind: "file";
      path: string;
      sizeLabel: string;
    }
  | {
      id: string;
      kind: "terminal";
      command: string;
      output: string;
    };

export type ReviewCard = {
  id: string;
  title: string;
  targetSpaceId: string;
  targetSpaceName: string;
  summary: string;
  body: string;
  status: "pending" | "approved" | "declined";
  messageId?: string;
  approvalId?: string;
  createdAt: string;
  dotId?: string;
};

export type WorkspaceView =
  | "chat"
  | "space"
  | "memory"
  | "settings"
  | "plugins";

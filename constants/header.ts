import { IHeaderButton } from "@/interfaces/header.interface";

export const HEADER_ITEMS: IHeaderButton[] = [
  {
    title: "Apple",
    logo: "images/apple-logo.png",
    items: [
      {
        title: "About This Mac",
        separator: true,
        rightLabel: "",
      },
      {
        title: "System Preferences",
        separator: false,
        rightLabel: "",
      },
      {
        title: "App Store...",
        separator: true,
        rightLabel: "8 updates",
      },
      {
        title: "Recent Items",
        separator: true,
        rightLabel: "",
      },
      {
        title: "Force Quit",
        separator: true,
        rightLabel: "⌥⌘⎋",
      },
      {
        title: "Sleep",
        separator: false,
        rightLabel: "",
      },
      {
        title: "Restart...",
        separator: false,
        rightLabel: "",
      },
      {
        title: "Shut Down...",
        separator: true,
        rightLabel: "",
      },
      {
        title: "Lock Screen",
        separator: false,
        rightLabel: "^⌘Q",
      },
      {
        title: "Log Out Soroush...",
        separator: false,
        rightLabel: "⇧⌘Q",
      },
    ],
  },
  {
    title: "Finder",
    items: [
      {
        title: "About Finder",
        separator: true,
        rightLabel: "",
      },
      {
        title: "Preferences...",
        separator: true,
        rightLabel: "⌘ ,",
      },
      {
        title: "Empty Trash...",
        separator: true,
        rightLabel: "⇧⌘⌫",
      },
      {
        title: "Services",
        separator: true,
        rightLabel: "",
      },
      {
        title: "Hide Finder",
        separator: false,
        rightLabel: "⌘H",
      },
      {
        title: "Hide Others",
        separator: false,
        rightLabel: "⌥⌘H",
      },
      {
        title: "Show All",
        separator: false,
        rightLabel: "",
      },
    ],
  },
  {
    title: "File",
    items: [
      {
        title: "About",
        separator: true,
        rightLabel: "",
      },
      {
        title: "Preferences...",
        separator: false,
        rightLabel: "⌘P",
      },
    ],
  },
];

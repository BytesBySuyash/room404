export type FileKind =
  | "folder"
  | "text"
  | "image"
  | "installer"
  | "document"
  | "pdf"
  | "audio"
  | "mail"
  | "game";
export interface VFile {
  id: string;
  parentId: string;
  name: string;
  type: FileKind;
  content?: string;
  asset?: string;
  modifiedAt: string;
  deleted?: boolean;
  originalParent?: string;
  game?: "minesweeper" | "solitaire" | "pinball";
  credit?: string;
  preview?: string;
}
const file = (id: string, name: string, content: string): VFile => ({
  id,
  name,
  content,
  type: "text",
  parentId: "docs",
  modifiedAt: "2002-10-31",
});
export const seedFiles: VFile[] = [
  {
    id: "drive",
    parentId: "computer",
    name: "Local Disk (C:)",
    type: "folder",
    modifiedAt: "1999-07-04",
  },
  {
    id: "docs",
    parentId: "drive",
    name: "My Documents",
    type: "folder",
    modifiedAt: "2002-10-31",
  },
  {
    id: "pictures",
    parentId: "docs",
    name: "Pictures",
    type: "folder",
    modifiedAt: "2002-10-24",
  },
  {
    id: "downloads",
    parentId: "docs",
    name: "Downloads",
    type: "folder",
    modifiedAt: "2002-10-31",
  },
  file(
    "readme",
    "README_FIRST.txt",
    "If you found this computer, please delete my browser history before calling my parents.\n\nMy website is bookmarked in Internet Explorer.\n\nAlso, the Recycle Bin is PRIVATE.\n\n— Rohan, Room 404",
  ),
  file(
    "timetable",
    "timetable.txt",
    "WINTER SEMESTER / ROOM 404\n\nMonday      09:00  Data Structures\nTuesday     11:00  Computer Networks\nWednesday   14:00  Software Engineering lab\nThursday    10:00  Discrete Mathematics\nFriday      16:00  Project review\n\nSunday      19:00  Call home. Do not forget.\n\nLibrary books due: 4 November.\nMeet Amit at the canteen after lab.",
  ),
  file(
    "expenses",
    "expenses.txt",
    "OCTOBER EXPENSES\n\nTea: 12\nPhotocopies: 18\nComputer upgrades: 0\nConfidence: priceless\n\nStill owe Amit 30 rupees for the network cable.",
  ),
  file(
    "letter",
    "letter_to_home.txt",
    "Dear Ma,\n\nThe computer is working. I am eating properly.\nPlease do not ask how the project is going.\nI will call on Sunday.\n\n— Rohan",
  ),
  file(
    "project1",
    "project_final.txt",
    "Step 1: become a software genius.\nStep 2: choose a project topic.",
  ),
  file(
    "project2",
    "project_final_FINAL.txt",
    "Progress update: folder structure completed.",
  ),
  file(
    "project3",
    "project_final_FINAL_reallyfinal.txt",
    "Presentation tip: say “modular architecture” whenever someone asks why nothing is connected.",
  ),
  {
    ...file(
      "confession",
      "confession.txt",
      "Fine. The revolutionary software was a drawing.\nOpen Pictures\\architecture.bmp.\n\nI spent three weeks making this desktop look productive.\nPlease do not tell Ma.\n\nP.S. If anyone asks where I went: the night bus home.\nMa said the project could wait. She had made aloo paratha.",
    ),
    deleted: true,
    originalParent: "docs",
  },
  {
    id: "hostel",
    name: "hostel_evening.svg",
    type: "image",
    parentId: "pictures",
    asset: "./art/hostel.svg",
    content:
      "An original pixel illustration of the hostel at dusk. A single window in Room 404 is still lit.",
    modifiedAt: "2002-10-24",
  },
  {
    id: "architecture",
    name: "architecture.bmp",
    type: "image",
    parentId: "pictures",
    asset: "./art/architecture.svg",
    content:
      "REVOLUTIONARY DISTRIBUTED SYSTEM: three hand-drawn boxes, USER → MAGIC → MARKS. Scalability plan: buy a longer cable.",
    modifiedAt: "2002-10-31",
  },
];
const referenceCredit =
  "Image supplied in Gandhi Hackathon problem statement. Rights remain with the original rights holder.";
const picture = (
  id: string,
  parentId: string,
  name: string,
  asset: string,
  content: string,
): VFile => ({
  id,
  parentId,
  name,
  asset,
  content,
  type: "image",
  modifiedAt: "2002-10-31",
  credit: referenceCredit,
});
seedFiles.push(
  {
    id: "archive1998",
    parentId: "docs",
    name: "1998",
    type: "folder",
    modifiedAt: "2002-10-31",
  },
  {
    id: "my-pictures",
    parentId: "docs",
    name: "My Pictures",
    type: "folder",
    modifiedAt: "2002-10-24",
  },
  {
    id: "music",
    parentId: "docs",
    name: "My Music",
    type: "folder",
    modifiedAt: "2002-10-30",
  },
  {
    id: "games",
    parentId: "drive",
    name: "Games",
    type: "folder",
    modifiedAt: "2002-10-30",
  },
  {
    id: "cs-folder",
    parentId: "games",
    name: "Counter-Strike",
    type: "folder",
    modifiedAt: "2002-10-01",
  },
  {
    id: "gta-folder",
    parentId: "games",
    name: "GTA III",
    type: "folder",
    modifiedAt: "2002-10-01",
  },
  {
    id: "windows-folder",
    parentId: "drive",
    name: "Windows",
    type: "folder",
    modifiedAt: "1999-07-04",
  },
  {
    id: "media-folder",
    parentId: "windows-folder",
    name: "Media",
    type: "folder",
    modifiedAt: "2002-10-31",
  },
  {
    id: "mail-folder",
    parentId: "docs",
    name: "Mail",
    type: "folder",
    modifiedAt: "2002-10-31",
  },
  picture(
    "titanic",
    "archive1998",
    "titanic_1997.jpg",
    "./files/My Documents/1998/titanic_1997.jpg",
    "Titanic (1997), the ship-bow scene, from the supplied hackathon reference.",
  ),
  picture(
    "france98",
    "archive1998",
    "world_cup_1998.jpg",
    "./files/My Documents/1998/world_cup_1998.jpg",
    "The French national team celebrating the 1998 FIFA World Cup, from the supplied hackathon reference.",
  ),
  picture(
    "wanted",
    "archive1998",
    "most_wanted_list.jpg",
    "./files/My Documents/1998/most_wanted_list.jpg",
    "A historical press image of Dawood Ibrahim, as shown in the supplied reference. Saved as a news image.",
  ),
  picture(
    "news2001",
    "archive1998",
    "news_clipping_2001.jpg",
    "./files/My Documents/1998/news_clipping_2001.jpg",
    "A historical television news image of Osama bin Laden, as shown in the supplied reference. Saved for a class news archive.",
  ),
  picture(
    "wtc",
    "docs",
    "news_clipping_2001.jpg",
    "./files/My Documents/news_clipping_2001.jpg",
    "Historical World Trade Center news photograph from the supplied problem statement.",
  ),
  picture(
    "worldcup-root",
    "docs",
    "world_cup_1998.jpg",
    "./files/My Documents/1998/world_cup_1998.jpg",
    "France celebrates the 1998 World Cup. Rohan: the one group project that actually worked.",
  ),
  picture(
    "family",
    "my-pictures",
    "family_memory.jpg",
    "./files/My Pictures/family_memory.jpg",
    "Family photograph from the user-supplied reference, kept as a picture in this fictional computer.",
  ),
  picture(
    "cs-shot",
    "cs-folder",
    "de_dust_2000.jpg",
    "./files/Games/Counter-Strike/de_dust_2000.jpg",
    "Counter-Strike gameplay screenshot supplied in the hackathon reference.",
  ),
  {
    ...file(
      "cs-readme",
      "README.txt",
      "COUNTER-STRIKE / LAN NIGHT\n\nScreenshot from the hackathon reference.\nThe commercial game files are not included in this website.\n\nRohan: Meet in the lab after dinner. Amit is hosting.\nIf Ma asks, this is a networking practical.",
    ),
    parentId: "cs-folder",
  },
  {
    ...file(
      "gta-readme",
      "README.txt",
      "GTA III / GAME COLLECTION\n\nReleased in the early 2000s.\nThe commercial game is not bundled or emulated here.\n\nFor a playable break, open Minesweeper, Solitaire,\nor the original Room 404 Pinball from C:\\Games.\n\nRohan: I only drive responsibly in the timetable.",
    ),
    parentId: "gta-folder",
  },
  {
    ...file(
      "archive-note",
      "archive_index.txt",
      "MY 1998 FOLDER\n\nStarted this folder after the World Cup. Never renamed it.\nTitanic, football, and later news clippings ended up here.\n\nThe images were supplied in the hackathon reference.\nThey are collection items, not photographs taken by Rohan.",
    ),
    parentId: "archive1998",
  },
  {
    id: "news-pdf",
    parentId: "docs",
    name: "9-11-attack-planning.pdf",
    type: "pdf",
    asset: "./files/My Documents/9-11-attack-planning.pdf",
    preview: "./files/My Documents/9-11-attack-planning.png",
    modifiedAt: "2001-10-03",
    content:
      "A classroom historical news clipping about 11 September 2001. The filename comes from the brief; the document contains historical context and Rohan’s note.",
  },
  {
    id: "music-catalog",
    parentId: "docs",
    name: "without_me_eminem.mp3",
    type: "audio",
    modifiedAt: "2002-10-30",
    content:
      "Eminem — Without Me (2002)\nMusic collection catalog entry. The commercial recording is not bundled.\nRohan’s original hostel loop is available in My Music.",
  },
  {
    id: "hostel-loop",
    parentId: "music",
    name: "hostel_loop.wav",
    type: "audio",
    asset: "./files/Windows/Media/hostel_loop.wav",
    modifiedAt: "2002-10-30",
    content:
      "Hostel Loop — Rohan\nOriginal instrumental, made for Room 404. No commercial music samples.",
  },
  {
    id: "word-letter",
    parentId: "docs",
    name: "letter_to_professor.doc",
    type: "document",
    modifiedAt: "2002-10-31",
    content: JSON.stringify({
      text: "Dear Professor,\n\nPlease find my semester project attached.\n\nThe design is complete. The implementation has chosen a more philosophical direction.\n\nI would appreciate an extension until Monday.\n\nYours sincerely,\nRohan\nRoom 404",
      font: "Times New Roman",
      size: 16,
      bold: false,
      italic: false,
      underline: false,
      align: "left",
    }),
  },
  {
    id: "mail-amit",
    parentId: "mail-folder",
    name: "Amit — About the project.eml",
    type: "mail",
    modifiedAt: "2002-10-31",
    content:
      "From: Amit <amit@hostel.test>\nTo: Rohan <rohan@hostel.test>\nSubject: About the project\nDate: 31 Oct 2002, 8:42 PM\n\nRohan,\n\nYou can’t submit a folder called “backend” with nothing in it.\n\nActually, knowing you, you might.\nSee you at the canteen. Bring my network cable.\n\n— Amit",
  },
  {
    id: "mail-home",
    parentId: "mail-folder",
    name: "Ma — Sunday.eml",
    type: "mail",
    modifiedAt: "2002-10-30",
    content:
      "From: Ma <home@family.test>\nTo: Rohan <rohan@hostel.test>\nSubject: Sunday\nDate: 30 Oct 2002, 6:15 PM\n\nBeta,\n\nCome home if you need a break. There is more to life than marks.\nI made aloo paratha.\n\nCall before you get on the bus.\n\nLove,\nMa",
  },
  ...(["minesweeper", "solitaire", "pinball"] as const).map((game) => ({
    id: "game-" + game,
    parentId: "games",
    name: game[0].toUpperCase() + game.slice(1) + ".exe",
    type: "game" as const,
    game,
    modifiedAt: "2002-10-30",
  })),
  ...[
    "startup",
    "shutdown",
    "open",
    "close",
    "click",
    "minimize",
    "maximize",
    "error",
    "notify",
    "mail",
    "recycle",
    "done",
    "modem",
    "pinball",
  ].map((name) => ({
    id: "sound-" + name,
    parentId: "media-folder",
    name: name + ".wav",
    type: "audio" as const,
    asset: "./files/Windows/Media/" + name + ".wav",
    modifiedAt: "2002-10-31",
    content: "Original Room 404 retro system sound: " + name,
  })),
);
export const ramFile: VFile = {
  id: "ram-exe",
  parentId: "downloads",
  name: "DownloadMoreRAM.exe",
  type: "installer",
  modifiedAt: "2002-10-31",
  content: "A fictional installer inside this simulated computer.",
};
export const receipt: VFile = {
  ...file(
    "ram-receipt",
    "RAM_receipt.txt",
    "DOWNLOAD MORE RAM — OFFICIAL RECEIPT\n31 October 2002\n\nRAM added:          0 MB\nConfidence added:   128 MB\nAmount paid:        your last remaining hope\n\nYour existing RAM has been polished to a lovely shine.\nThis is a fictional receipt. Nothing was downloaded\nor installed on your actual computer.\n\nTechnical support: try believing harder.",
  ),
  parentId: "downloads",
};
export function folderPath(id: string, files: VFile[]): string {
  if (id === "computer") return "My Computer";
  if (id === "drive") return "C:\\";
  const f = files.find((f) => f.id === id);
  return f
    ? folderPath(f.parentId, files).replace(/\\$/, "") + "\\" + f.name
    : "C:\\";
}

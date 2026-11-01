export type FileKind = 'folder' | 'text' | 'image' | 'installer';
export interface VFile { id: string; parentId: string; name: string; type: FileKind; content?: string; asset?: string; modifiedAt: string; deleted?: boolean; originalParent?: string }
const file = (id: string, name: string, content: string): VFile => ({ id, name, content, type: 'text', parentId: 'docs', modifiedAt: '2002-10-31' });
export const seedFiles: VFile[] = [
  { id:'drive', parentId:'computer', name:'Local Disk (C:)', type:'folder', modifiedAt:'1999-07-04' },
  { id:'docs', parentId:'drive', name:'My Documents', type:'folder', modifiedAt:'2002-10-31' },
  { id:'pictures', parentId:'docs', name:'Pictures', type:'folder', modifiedAt:'2002-10-24' },
  { id:'downloads', parentId:'docs', name:'Downloads', type:'folder', modifiedAt:'2002-10-31' },
  file('readme','README_FIRST.txt','If you found this computer, please delete my browser history before calling my parents.\n\nMy website is bookmarked in Internet Explorer.\n\nAlso, the Recycle Bin is PRIVATE.\n\n— Rohan, Room 404'),
  file('timetable','timetable.txt','WINTER SEMESTER / ROOM 404\n\nMonday      09:00  Data Structures\nTuesday     11:00  Computer Networks\nWednesday   14:00  Software Engineering lab\nThursday    10:00  Discrete Mathematics\nFriday      16:00  Project review\n\nSunday      19:00  Call home. Do not forget.\n\nLibrary books due: 4 November.\nMeet Amit at the canteen after lab.'),
  file('expenses','expenses.txt','OCTOBER EXPENSES\n\nTea: 12\nPhotocopies: 18\nComputer upgrades: 0\nConfidence: priceless\n\nStill owe Amit 30 rupees for the network cable.'),
  file('letter','letter_to_home.txt','Dear Ma,\n\nThe computer is working. I am eating properly.\nPlease do not ask how the project is going.\nI will call on Sunday.\n\n— Rohan'),
  file('project1','project_final.txt','Step 1: become a software genius.\nStep 2: choose a project topic.'),
  file('project2','project_final_FINAL.txt','Progress update: folder structure completed.'),
  file('project3','project_final_FINAL_reallyfinal.txt','Presentation tip: say “modular architecture” whenever someone asks why nothing is connected.'),
  { ...file('confession','confession.txt','Fine. The revolutionary software was a drawing.\nOpen Pictures\\architecture.bmp.\n\nI spent three weeks making this desktop look productive.\nPlease do not tell Ma.\n\nP.S. If anyone asks where I went: the night bus home.\nMa said the project could wait. She had made aloo paratha.'), deleted:true, originalParent:'docs' },
  { id:'hostel', name:'hostel_evening.svg', type:'image', parentId:'pictures', asset:'./art/hostel.svg', content:'An original pixel illustration of the hostel at dusk. A single window in Room 404 is still lit.', modifiedAt:'2002-10-24' },
  { id:'architecture', name:'architecture.bmp', type:'image', parentId:'pictures', asset:'./art/architecture.svg', content:'REVOLUTIONARY DISTRIBUTED SYSTEM: three hand-drawn boxes, USER → MAGIC → MARKS. Scalability plan: buy a longer cable.', modifiedAt:'2002-10-31' },
];
export const ramFile: VFile = { id:'ram-exe', parentId:'downloads', name:'DownloadMoreRAM.exe', type:'installer', modifiedAt:'2002-10-31', content:'A fictional installer inside this simulated computer.' };
export const receipt: VFile = { ...file('ram-receipt','RAM_receipt.txt','DOWNLOAD MORE RAM — OFFICIAL RECEIPT\n31 October 2002\n\nRAM added:          0 MB\nConfidence added:   128 MB\nAmount paid:        your last remaining hope\n\nYour existing RAM has been polished to a lovely shine.\nThis is a fictional receipt. Nothing was downloaded\nor installed on your actual computer.\n\nTechnical support: try believing harder.'), parentId:'downloads' };
export function folderPath(id: string, files: VFile[]): string {
  if(id==='computer') return 'My Computer';
  if(id==='drive') return 'C:\\';
  const f=files.find(f=>f.id===id);
  return f ? folderPath(f.parentId,files).replace(/\\$/,'')+'\\'+f.name : 'C:\\';
}

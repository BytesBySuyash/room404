export type IconName =
  | "computer"
  | "folder"
  | "browser"
  | "bin"
  | "text"
  | "image"
  | "installer"
  | "help"
  | "sound"
  | "windows";
export function Icon({ name, size = 32 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="pixel-icon"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {name === "computer" && (
        <>
          <path fill="#111" d="M3 2h25v20H17v4h8v3H6v-3h8v-4H3z" />
          <path fill="#ddd" d="M4 3h23v18H4zM7 26h17v2H7z" />
          <path fill="#808080" d="M6 5h19v13H6z" />
          <path fill="#003d80" d="M7 6h17v11H7z" />
          <path fill="#54c7ce" d="M8 7h15v3H8v6H7V7z" />
          <path fill="#fff" d="M5 4h21v1H5z" />
          <path fill="#888" d="M5 20h21v1H5z" />
          <path fill="#00a500" d="M23 19h2v1h-2z" />
          <path fill="#bbb" d="M2 29h27v2H2z" />
        </>
      )}
      {name === "folder" && (
        <>
          <path fill="#43340b" d="M1 7h12l3 3h14v18H1z" />
          <path fill="#ffff9b" d="M2 8h10l3 3h14v15H2z" />
          <path fill="#9b6e08" d="M1 14h30l-4 14H1z" />
          <path fill="#efd154" d="M2 15h28l-4 12H2z" />
          <path fill="#fff6a3" d="M3 15h26v1H3z" />
          <path fill="#d6a82d" d="M3 25h23v2H3z" />
        </>
      )}
      {name === "browser" && (
        <>
          <path fill="#004789" d="M9 4h15v3h4v6h2v10h-5v5H11v-3H6V12h3z" />
          <path fill="#087bc4" d="M11 6h12v3h3v8H11v5h14v3H13v-2H9V12h2z" />
          <path fill="#4db5e5" d="M13 8h8v2h-8zM11 12h13v3H11z" />
          <path
            fill="#e1b833"
            d="M1 22v-4h3v-3h3v-3h4v-2h5V8h12v2h3v4h-3v4h-3v-4h3v-3H17v2h-5v3H8v3H5v3h10v2H3v-2z"
          />
        </>
      )}
      {name === "bin" && (
        <>
          <path fill="#555" d="M6 7h21l-2 23H9z" />
          <path fill="#e4e4e4" d="M7 8h19l-2 21H10z" />
          <path
            fill="#898989"
            d="M9 12h2v13H9zM14 12h2v15h-2zM20 12h2v13h-2z"
          />
          <path fill="#fff" d="M8 8h2v18H8zM5 5h23v3H5z" />
          <path fill="#555" d="M6 4h21v2H6zM12 2h9v2h-9z" />
          <path fill="#008c6b" d="M12 17h7v2h3v3h-4v3h-4v-3h-3v-3h2z" />
        </>
      )}
      {name === "text" && (
        <>
          <path fill="#333" d="M6 2h15l6 6v22H6z" />
          <path fill="#fff" d="M7 3h13v6h6v20H7z" />
          <path
            fill="#aaa"
            d="M21 3v5h5zM10 12h13v1H10zM10 15h13v1H10zM10 18h13v1H10zM10 21h10v1H10zM10 24h12v1H10z"
          />
          <path fill="#000080" d="M3 25h8v5H3z" />
          <path fill="#fff" d="M5 26h4v1H8v3H7v-3H5z" />
        </>
      )}
      {name === "image" && (
        <>
          <path fill="#333" d="M3 3h26v26H3z" />
          <path fill="#fff" d="M4 4h24v24H4z" />
          <path fill="#8bd5ed" d="M6 6h20v19H6z" />
          <path fill="#fcf17b" d="M20 8h4v4h-4z" />
          <path fill="#227447" d="M6 21l7-10 7 10 3-5 3 8H6z" />
          <path fill="#365b85" d="M6 24h20v2H6z" />
        </>
      )}
      {name === "installer" && (
        <>
          <path fill="#333" d="M2 7h28v22H2z" />
          <path fill="#c0c0c0" d="M3 8h26v20H3z" />
          <path fill="#000080" d="M4 9h24v4H4z" />
          <path fill="#fff" d="M6 16h20v2H6zM6 20h12v2H6z" />
          <path fill="#008000" d="M17 2h7v6h5l-9 9-9-9h6z" />
        </>
      )}
      {name === "help" && (
        <>
          <path
            fill="#000080"
            d="M9 2h14v3h4v5h-3v5h-5v5h-6v-8h5V9h3V7h-7v4H8V5h1zM13 24h6v6h-6z"
          />
          <path fill="#66b3ff" d="M10 3h12v2H10zM14 25h4v2h-4z" />
        </>
      )}
      {name === "sound" && (
        <>
          <path fill="#333" d="M2 12h6l9-8v24l-9-8H2z" />
          <path fill="#ddd" d="M3 13h6l7-7v20l-7-7H3z" />
          <path fill="#999" d="M11 12l4-4v16l-4-5z" />
          <path
            stroke="#222"
            strokeWidth="2"
            fill="none"
            d="M21 10q7 6 0 12M24 6q12 10 0 20"
          />
        </>
      )}
      {name === "windows" && (
        <>
          <path fill="#111" d="M4 6l23-4v23L4 29z" />
          <path fill="#ef4141" d="M6 7l9-2v9l-9 1z" />
          <path fill="#36a842" d="M17 5l8-1v9l-8 1z" />
          <path fill="#2865db" d="M6 17l9-1v9l-9 2z" />
          <path fill="#ffcf2a" d="M17 16l8-1v9l-8 1z" />
        </>
      )}
    </svg>
  );
}

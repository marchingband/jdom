import { serve } from "https://deno.land/std/http/server.ts";
import { WebSocketServer } from "https://deno.land/x/websocket@v0.0.3/mod.ts";

const compile = async () => {
  var run = Deno.run({
    cmd: [
      "deno",
      "bundle",
      "./src/App.jsx",
      "main.bundle.js",
      "-c",
      "tsconfig.json",
    ],
  });
  await run.status();
  run.close();
  const js = await Deno.readTextFile("./main.bundle.js");
  const html = `
        <html>
            <canvas id="root"/>
            <script>
                ${js}
            </script>
        </html>`;
  // await Deno.writeTextFile('index.html',html)
  return html;
};

// html server
var html = await compile();
console.log("initial compilation done");

const initHTMLServer = async () => {
  const htmlServer = serve({ port: 8000 });
  for await (let req of htmlServer) {
    req.respond({ body: html });
  }
};

// WS server
var wsConnection = undefined;
const initWSServer = async () => {
  const wss = new WebSocketServer(8080);
  wss.on("connection", function (ws) {
    ws.on("message", (message) => console.log(message));
    console.log("client connected");
    wsConnection = ws;
  });
};

// file watcher
const initFsWatcher = async () => {
  let watcher = Deno.watchFs("./src");
  const refresh = async (e) => {
    html = await compile();
    console.log("recompiled");
    wsConnection && wsConnection.send("reload");
  };
  let last = 0;
  for await (const event of watcher) {
    // if (event.paths.some((x) => x.search("App.jsx") >= 0)) {
      let time = Date.now();
      if (time - last > 1000) {
        last = time;
        refresh(event);
      }
    // }
  }
};

initHTMLServer();
initWSServer();
initFsWatcher();

export const wsInit = () => {
    console.log("starting ws client");
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
        console.log("ws connected");
        ws.send("test");
    };
    ws.onmessage = (e) => {
        console.log("ws message in:");
        console.log(e);
        if (e.data == "reload") {
            window.location.reload();
        }
    }
}

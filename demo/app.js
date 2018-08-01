var socket = null;

var send = (x)=> {
  socket.send(JSON.stringify(x));
}

var onhashchange = (ev)=> {
  send({uri: '/hash-changed', params: JSON.parse(decodeURIComponent(window.location.hash.replace(/^#/, '')))});
}

var start = () => {
  console.log("Connecting to server");
  socket = new WebSocket("ws://localhost:8989/channel");
  socket.onmessage = (msg) => {
    console.log('from server: ', msg.data);
    var resp = JSON.parse(msg.data);
    if(resp.target) {
      document.getElementById(resp.target).innerHTML= resp.content;
    }
    if(resp.script) {
      eval(resp.script);
    }
  };
  socket.onopen = (event)=> {
    onhashchange(null);
  };
}

start();


window.onhashchange = onhashchange;

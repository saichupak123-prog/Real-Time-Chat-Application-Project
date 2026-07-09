const socket = new WebSocket("wss://uh2iyp88f0.execute-api.ap-southeast-2.amazonaws.com/dev");


const status = document.getElementById("status");
const chatBox = document.getElementById("chatBox");

// Connection Open
socket.onopen = function () {
    status.innerHTML = "Connected";
    status.style.color = "green";

    addSystemMessage("Connected to AWS WebSocket");
};

// Receive Messages
socket.onmessage = function (event) {

    let data;

    try{
        data = JSON.parse(event.data);
    }
    catch{

        addSystemMessage(event.data);
        return;
    }

    if(data.sender && data.message){

        addChatMessage(
            data.sender,
            data.message
        );

    }

};

// Connection Closed
socket.onclose = function () {

    status.innerHTML = "Disconnected";
    status.style.color = "red";

    addSystemMessage("Connection Closed");

};

// Error
socket.onerror = function(error){

    console.log(error);

    addSystemMessage("WebSocket Error");

};

// Send Message
function sendMessage(){

    const username =
        document.getElementById("username").value.trim();

    const message =
        document.getElementById("message").value.trim();

    if(username===""){

        alert("Enter your name");
        return;

    }

    if(message===""){

        alert("Enter a message");
        return;

    }

    const data={

        action:"sendMessage",
        sender:username,
        message:message

    };

    socket.send(JSON.stringify(data));

    document.getElementById("message").value="";

}

// Display Chat Message
function addChatMessage(sender,message){

    const div=document.createElement("div");

    div.className="message";

    div.innerHTML=
    "<strong>"+sender+"</strong><br>"+message;

    chatBox.appendChild(div);

    chatBox.scrollTop=chatBox.scrollHeight;

}

// Display System Message
function addSystemMessage(message){

    const div=document.createElement("div");

    div.className="system";

    div.innerHTML=message;

    chatBox.appendChild(div);

    chatBox.scrollTop=chatBox.scrollHeight;

}

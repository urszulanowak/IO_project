var message_room_id = null;
var oldest_message_id = null;
var no_older_messages = false;
var newest_message_id = null;

async function get_messages_before(limit) {
    if (no_older_messages) return;
    await fetch(`/message/get_messages_before`, {
        method: 'POST',
        body: JSON.stringify({
            room_id: message_room_id,
            before_id: oldest_message_id,
            limit: limit
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
        .then(data => {
            if (data.html == '') {
                no_older_messages = true;
                return;
            }
            document.getElementById('chat-box').innerHTML = data.html + document.getElementById('chat-box').innerHTML;
            oldest_message_id = data.oldest_message_id;
            if (newest_message_id == null) {
                newest_message_id = data.newest_message_id;
            }
        });
}

function get_messages_after(limit) {
    fetch(`/message/get_messages_after`, {
        method: 'POST',
        body: JSON.stringify({
            room_id: message_room_id,
            after_id: newest_message_id,
            limit: limit
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
        .then(data => {
            if (newest_message_id != data.newest_message_id) {
                document.getElementById('chat-box').innerHTML += data.html;
                var chat_box = document.getElementById('chat-box');
                chat_box.scrollTo({ left: 0, top: chat_box.scrollHeight, behavior: "smooth" });
                newest_message_id = data.newest_message_id;
                if (oldest_message_id == null) {
                    oldest_message_id = data.oldest_message_id;
                }
            }
        });
}

function add_message() {
    var text = document.getElementById('chat-input').value;
    fetch(`/message/add_message`, {
        method: 'POST',
        body: JSON.stringify({
            room_id: message_room_id,
            text: text
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(() => {
        document.getElementById('chat-input').value = '';
        get_messages_after(1000);
    });
}
document.add_message = add_message;

function cant_add_message() {
    alert('Musisz być zalogowany, aby móc wysyłać wiadomości!');
}
document.cant_add_message = cant_add_message;

async function message_room_init(room_id) {
    console.log('message_room_init', room_id);
    message_room_id = room_id;
    if (message_room_id != undefined) {
        await get_messages_before(30);
        var chat_box = document.getElementById('chat-box');
        chat_box.scrollTo({ left: 0, top: chat_box.scrollHeight, behavior: "smooth" });

        chat_box.addEventListener('scroll', async () => {
            if (chat_box.scrollTop === 0) {
                await get_messages_before(30);
            }
        });
    }
}
document.message_room_init = message_room_init;

setInterval(() => {
    get_messages_after(1000);
}, 10000);

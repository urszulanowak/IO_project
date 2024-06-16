var message_room_id = null;
var oldest_message_id = null;
var no_older_messages = false;
var newest_message_id = null;

function get_messages_before(limit) {
    if (no_older_messages) return;
    fetch(`/message/get_messages_before`, {
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
            document.getElementById('messages').innerHTML = data.html + document.getElementById('messages').innerHTML;
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
            document.getElementById('messages').innerHTML += data.html;
            newest_message_id = data.newest_message_id;
            if (oldest_message_id == null) {
                oldest_message_id = data.oldest_message_id;
            }
        });
}

function send_message() {
    var text = document.getElementById('message_input').value;
    fetch(`/message/send_message`, {
        method: 'POST',
        body: JSON.stringify({
            room_id: message_room_id,
            text: text
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
        .then(data => {
            document.getElementById('message_input').value = '';
            get_messages_after(newest_message_id);
        });
}

function init(room_id) {
    message_room_id = room_id;
    get_messages_after(10);
}
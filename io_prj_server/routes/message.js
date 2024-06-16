var express = require('express');
var router = express.Router();
var message_controller = require('@controllers/message');

router.get('/get_message_room/:room_id', message_controller.get_message_room);

router.post('/get_messages_before', message_controller.get_messages_before);

router.post('/get_messages_after', message_controller.get_messages_after);

router.post('/send_message', message_controller.send_message);

module.exports = router;
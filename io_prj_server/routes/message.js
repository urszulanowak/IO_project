var express = require('express');
var router = express.Router();
var message_controller = require('@controllers/message');

router.get('/room/:room_id', message_controller.get_message_room);

router.post('/get_messages_before', message_controller.get_messages_before);

router.post('/get_messages_after', message_controller.get_messages_after);

router.post('/add_message', message_controller.add_message);

module.exports = router;
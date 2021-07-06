import json
from videoConnect.models import messageUserRelationship
from channels.generic.websocket import AsyncWebsocketConsumer

class chatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = self.scope['url_route']['kwargs']['room']
        print(self.room_group_name)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(text_data_json)
        message = text_data_json['message']
        peer = text_data_json['peer']

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'email':peer,
                'message': message
            }
        )
        # self.send(text_data=json.dumps({
        #     'message':message
        # }))

    async def chat_message(self, event):
        message = event['message']
        email = event['email']
        print(message)
        # Send message to WebSocket
        await self.send(text_data = json.dumps({
            'message':message,
            'email':email
        }))
from channels.exceptions import MessageTooLarge
from channels.generic.websocket import AsyncJsonWebsocketConsumer, AsyncWebsocketConsumer

import json

from django.dispatch.dispatcher import receiver 

class VideoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'room101'
        
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
        print('Call disconnected')

    async def receive(self, text_data):
        incomingData = json.loads(text_data)
        action = incomingData['action']
        
        if (action == 'new-offer') or (action == 'new-answer'):
            receiver_channel_name = incomingData['keyword']['receiver_channel_name']

            incomingData['keyword']['receiver_channel_name']= self.channel_name

            await self.channel_layer.send(
                receiver_channel_name,
                {
                    'type':'send.sdp',
                    'incomingData':incomingData
                }
            )
            return

        incomingData['keyword']['receiver_channel_name']= self.channel_name

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':'send.sdp',
                'incomingData':incomingData
            }
        )

    async def send_sdp(self, event):
        incomingData = event['incomingData']

        await self.send(text_data=json.dumps(incomingData))
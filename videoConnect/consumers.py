from channels.exceptions import MessageTooLarge
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import rooms, userRoomRelationship

import json

class VideoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # self.room_group_name = 'room101'
        self.room_group_name = self.scope['url_route']['kwargs']['room']
        
        await self.get_room(self.room_group_name, self.scope['session']['authenticated_user'])

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
    
    @database_sync_to_async
    def get_room(self, roomName, username):
        room = rooms.objects.get_or_create(roomName=roomName)
        print(room)
        userRoomRelationship.objects.get_or_create(room=room[0], username = username)
        return

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        # print('disconnet is called')
        # print(self.scope['user'])
        username = self.scope['session']['authenticated_user']
        await self.delete_relationships(username)
        members = await self.get_members()
        if members == 0:
            await self.delete_room()
        print('Call disconnected')

    @database_sync_to_async
    def delete_room(self):
        return rooms.objects.get(roomName = self.room_group_name).delete()

    @database_sync_to_async
    def delete_relationships(self, username):
        return userRoomRelationship.objects.filter(room__roomName = self.room_group_name, username=username).delete()

    @database_sync_to_async
    def get_members(self):
        return userRoomRelationship.objects.filter(room__roomName = self.room_group_name).count()

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
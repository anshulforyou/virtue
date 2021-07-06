import json
from django.http.response import JsonResponse
from django.shortcuts import redirect, render
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.http import HttpResponse

from .models import messageUserRelationship, rooms, userRoomRelationship, users

import string
import random

# Create your views here.

def createSecret(length):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k = length))

def join_meeting(request, secret):
    email = request.GET.get('email')
    user = users.objects.get(email = email)
    if user.name == None:
        context = {
            'email':email,
            'name':None,
            'room':secret
        }
    else:
        context = {
            'email':email,
            'name':user.name,
            'room':secret
        }
    request.session['authenticated_user']=email
    return render(request, 'videoConnect/main.html', context=context)

def create_meeting(request, email):
    roomName = request.GET.get('roomname')
    print(roomName)
    user = users.objects.get(email = email)
    secret = createSecret(30)
    room = rooms.objects.create(
        secret = secret,
        roomName = roomName,
        author = user,
        isActive = True
    )
    userRoomRelationship(
        room = room,
        user = user,
        inCall = True
    )
    context = {
        'email':email,
        'room':secret,
        'name':roomName
    }
    return render(request, 'videoConnect/main.html', context=context)

def preview(request):
    if request.method == 'POST':
        # myLoginForm = LoginForm(request.POST)
        email = request.POST.get('email')
        return redirect('chat/'+email)

        # try:
        #     room = rooms.objects.get(roomName = roomName)
        #     rel = userRoomRelationship.objects.filter(room=room, user = user, inCall = True)
        #     if len(rel) == 0:
        #         userRoomRelationship.objects.create(
        #             room = room,
        #             user = user,
        #             inCall = True
        #         )
        #         return redirect('room/'+roomName+'?&email='+email)
        #     else:
        #         context = {
        #             'error':'User with this email already exists in this room'
        #         }
        #         return render(request, 'videoConnect/preview.html', context=context)
        # except:
        #     room = rooms.objects.create(
        #         roomName=roomName,
        #         author=user
        #     )
        #     userRoomRelationship.objects.create(
        #         room = room,
        #         user = user,
        #         inCall = True
        #     )
        #     return redirect('room/'+roomName+'?&email='+email)
    elif request.method == 'GET':
        room = request.GET.get('room')
        context = {'room':room}
        return render(request, 'videoConnect/preview.html', context=context)

def invite(request):
    print("hello")
    if request.method == 'POST':
        emails = request.POST.get('email')
        room = request.POST.get('room')
        emails = emails.split(",")
        print(emails)
        print(room)
        for i in emails:
            context = {
                'room':room,
                'email':request.session['authenticated_user'],
                'link':'/?&room='+room
            }
            html_template = render_to_string('email/invite.html', context=context)
            # print(html_template)
            send_mail(
                subject="[Virtue] "+request.session['authenticated_user']+" invited you to join the meeting",
                message="",
                from_email = settings.EMAIL_ADDRESS,
                recipient_list=[i], html_message=html_template
            )
        return JsonResponse(
            {
                'message':'Email sent'
            }
        )

def updateName(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        print(name)
        email = request.POST.get('email')
        print(email)
        user = users.objects.get(email = email)
        user.name = name
        user.save()
        return JsonResponse(
            {
                'message':'Name updated'
            }
        )

def storeMsg(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        message = request.POST.get('message')
        secret = request.POST.get('roomsecret')
        print(message)
        user = users.objects.get(email=email)
        room = rooms.objects.get(secret = secret)
        messageUserRelationship.objects.create(
            room = room,
            message = message,
            user = user
        )
        return JsonResponse(
            {
                'response':'Message Stored'
            }
        )
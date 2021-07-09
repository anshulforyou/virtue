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

def join_meeting(request, room):
    email = request.GET.get('email')
    user = users.objects.get(email = email)
    roomObj = rooms.objects.get(secret = room)
    messageRel = messageUserRelationship.objects.filter(room = roomObj)
    messages = []
    for i in messageRel:
        messages.append({
            'message':i.message,
            'name':i.user.name,
            'email':i.user.email
        })
    if user.name == None:
        context = {
            'email':email,
            'name':None,
            'room':room,
            'messages':messages
        }
    else:
        context = {
            'email':email,
            'name':user.name,
            'room':room,
            'messages':messages
        }
    request.session['authenticated_user']=email
    return render(request, 'videoConnect/main.html', context=context)

def inviteFriends(emails, userEmail, roomsecret):
    emails = emails.replace(" ", "").split(",")
    room = rooms.objects.get(secret = roomsecret)
    for i in emails:
        user = users.objects.get_or_create(email=i)[0]
        userRel = userRoomRelationship.objects.get_or_create(
            room = room,
            user = user,
            inCall = False
        )
        # print(userRel)
        if not userRel[1]:
            context = {
                'room':room,
                'email':userEmail,
                'link':'http://127.0.0.1:8000/join/'+room.secret+"?&email="+i
            }
            html_template = render_to_string('email/invite.html', context=context)
            # print(html_template)
            send_mail(
                subject="[Virtue] "+userEmail+" invited you to join the meeting",
                message="",
                from_email = settings.EMAIL_ADDRESS,
                recipient_list=[i], html_message=html_template
            )
    return

def create_meeting(request, email):
    roomName = request.GET.get('roomname')
    friendEmails = request.GET.get('emails')
    print(roomName)
    user = users.objects.get(email = email)
    secret = createSecret(30)
    request.session['authenticated_user']=email
    room = rooms.objects.create(
        secret = secret,
        roomName = roomName,
        author = user,
        isActive = True
    )
    userRoomRelationship.objects.create(
        room = room,
        user = user,
        inCall = True
    )
    inviteFriends(friendEmails, email, secret)
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

    elif request.method == 'GET':
        room = request.GET.get('room')
        context = {'room':room}
        return render(request, 'videoConnect/preview.html', context=context)

def invite(request):
    print("hello")
    if request.method == 'POST':
        emails = request.POST.get('email')
        roomsecret = request.POST.get('room')
        inviteFriends(emails, request.session['authenticated_user'], roomsecret)
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
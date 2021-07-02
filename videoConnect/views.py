from django.shortcuts import redirect, render
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from .models import rooms, userRoomRelationship

# Create your views here.

def main(request, room):
    username = request.GET.get('username')
    context = {
        'username' : username,
        'room':room
    }
    request.session['authenticated_user']=username
    return render(request, 'videoConnect/main.html', context=context)

def preview(request):
    if request.method == 'POST':
        # myLoginForm = LoginForm(request.POST)
        username = request.POST.get('username')
        roomName = request.POST.get('room')
        try:
            room = rooms.objects.get(roomName = roomName)
            rel = userRoomRelationship.objects.filter(room=room, username=username)
            if len(rel) == 0:
                userRoomRelationship.objects.create(
                    room = room,
                    username = username
                )
                return redirect('room/'+roomName+'?&username='+username)
            else:
                context = {
                    'error':'User with this username already exists in this room'
                }
                return render(request, 'videoConnect/preview.html', context=context)
        except:
            room = rooms.objects.create(
                roomName=roomName,
                author=username
            )
            userRoomRelationship.objects.create(
                room = room,
                username = username
            )
            return redirect('room/'+roomName+'?&username='+username)
    elif request.method == 'GET':
        room = request.GET.get('room')
        context = {'room':room}
        return render(request, 'videoConnect/preview.html', context=context)

def invite(request):
    print("hello")
    # if request.method == 'POST':
    email = request.POST.get('email')
    room = request.POST.get('room')
    print(email)
    print(room)
    context = {
        'room':room,
        'username':request.session['authenticated_user'],
        'link':'/?&room='+room
    }
    html_template = render_to_string('email/invite.html', context=context)
    print(html_template)
    send_mail(
        subject="[Virtue] "+request.session['authenticated_user']+" invited you to join the meeting",
        message="",
        from_email = settings.EMAIL_ADDRESS,
        recipient_list=[email], html_message=html_template
    )
    return 10
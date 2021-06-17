from django.shortcuts import redirect, render
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
                return redirect('main/'+roomName+'?&username='+username)
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
            return redirect('main/'+roomName+'?&username='+username)
    elif request.method == 'GET':
        context = {}
        return render(request, 'videoConnect/preview.html', context=context)
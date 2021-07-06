from django.shortcuts import render

from videoConnect.models import users, userRoomRelationship, messageUserRelationship

# Create your views here.

def chat(request, email):
    try:
        user = users.objects.get(email = email)
    except:
        user = users.objects.create(
            email = email
        )
    print(user)
    meetings = userRoomRelationship.objects.filter(user = user)
    details = []
    for i in meetings:
        messageRel = messageUserRelationship.objects.filter(room = i.room)
        messages = []
        for j in messageRel:
            messages.append({
                'message':j.message,
                'name':j.user.name,
                'email':j.user.email
            })
        details.append({
            "roomName":i.room.roomName,
            "secret":i.room.secret,
            "author":i.room.author.name,
            "messages":messages 
        })
    context = {
        'email':email,
        'nameUser':user.name,
        'details':details
    }
    print(context)
    return render(request, 'chatapp/chat.html', context=context)

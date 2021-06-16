from django.shortcuts import redirect, render
from .models import Users

# Create your views here.

def main(request, room):
    username = request.GET.get('username')
    context = {
        'username' : username,
        'room':room
    }
    return render(request, 'videoConnect/main.html', context=context)

def preview(request):
    if request.method == 'POST':
        # myLoginForm = LoginForm(request.POST)
        username = request.POST.get('username')
        room = request.POST.get('room')
        try:
            Users.objects.get(username=username)
            context = {
                'error':"Username already taken"
            }
            return render(request, 'videoConnect/preview.html', context=context)
        except:
            Users.objects.create(username=username)
            # context = {
            #     'username':username,
            #     'room':room
            # }
            # return render(request, 'videoConnect/main.html', context=context)
            return redirect('main/'+room+'?&username='+username)
    elif request.method == 'GET':
        context = {}
        return render(request, 'videoConnect/preview.html', context=context)
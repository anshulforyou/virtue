from django.urls import path
from .views import main, preview, invite

urlpatterns = [
    path('', preview, name='preview'),
    path('room/<room>', main, name='main'),
    path('room/invite', invite, name='invite')
]
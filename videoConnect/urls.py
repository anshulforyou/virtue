from django.urls import path
from .views import main, preview, invite

urlpatterns = [
    path('room/invite', invite, name='invite'),
    path('room/<room>', main, name='main'),
    path('', preview, name='preview'),
]
from django.urls import path
from .views import create_meeting, join_meeting, preview, invite, storeMsg, updateName

urlpatterns = [
    path('room/invite', invite, name='invite'),
    path('room/updatename', updateName, name='updateName'),
    path('room/storemsg', storeMsg, name='storeMsg'),
    path('create/<email>', create_meeting, name='createMeeting'),
    path('join/<room>', join_meeting, name='joinMeeting'),
    path('', preview, name='preview'),
]
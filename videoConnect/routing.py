from django.urls import re_path, path
from django.conf.urls import url

from . import consumers as videoCon
from chatapp import consumers as chatCon

websocket_urlpatterns = [
    re_path(r"^room/(?P<room>\w+)/$", videoCon.VideoConsumer.as_asgi()),
    re_path(r"^chat/(?P<room>\w+)/$", chatCon.chatConsumer.as_asgi())
    # re_path(r'', consumers.VideoConsumer.as_asgi()),
    # r'^ws/video/main/(?P<room>\w+)/$'
]
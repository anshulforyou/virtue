from django.urls import re_path, path
from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [
    re_path(r"^video/room/(?P<room>\w+)/$", consumers.VideoConsumer.as_asgi()),
    # re_path(r'', consumers.VideoConsumer.as_asgi()),
    # r'^ws/video/main/(?P<room>\w+)/$'
]
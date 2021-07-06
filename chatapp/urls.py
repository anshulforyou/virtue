from django.urls import path

from .views import chat

urlpatterns = [
    path('<email>', chat, name = 'chat')
]